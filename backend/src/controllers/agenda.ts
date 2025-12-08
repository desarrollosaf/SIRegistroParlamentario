import { Request, Response } from "express";
import Agenda from '../models/agendas';
import Sedes from "../models/sedes";
import TipoEventos from "../models/tipo_eventos";
import AnfitrionAgenda from "../models/anfitrion_agendas";
import Legislatura from "../models/legislaturas";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import Diputado from "../models/diputado";
import IntegranteComision from "../models/integrante_comisions";
import AsistenciaVoto from "../models/asistencia_votos";
import { setEngine } from "node:crypto";
import Partidos from "../models/partidos";
import Proponentes from "../models/proponentes";
import TipoCategoriaIniciativas  from "../models/tipo_categoria_iniciativas";
import Comision from "../models/comisions";
import TipoComisions from "../models/tipo_comisions";
import { Op } from 'sequelize';
import AdminCat from "../models/admin_cats";
import PuntosOrden from "../models/puntos_ordens";
import TipoIntervencion from "../models/tipo_intervencions";
import Intervencion from "../models/intervenciones";
import TemasPuntosVotos from "../models/temas_puntos_votos";
import VotosPunto from "../models/votos_punto";
import { Sequelize } from "sequelize";
import TipoCargoComision, { tipo_cargo_comisions } from "../models/tipo_cargo_comisions";
import TipoAutor from "../models/tipo_autors";
import { comisiones } from "../models/init-models";
import Municipios from "../models/municipios";
import OtrosAutores from "../models/otros_autores";
import MunicipiosAg from "../models/municipiosag";
import { Secretarias } from "../models/secretarias";
import CatFunDep from "../models/cat_fun_dep";
import PuntosPresenta from "../models/puntos_presenta";
import axios from "axios";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import PuntosComisiones from "../models/puntos_comisiones";


export const geteventos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventos = await Agenda.findAll(
      {
        include: [
        {
          model: Sedes,
          as: "sede",
          attributes: ["id", "sede"]
        },
        {
          model: TipoEventos,
          as: "tipoevento",
          attributes: ["id", "nombre"]
        }
      ],  
      }
    );
    return res.status(200).json({
      msg: "listoooo :v ",
      citas: eventos
    });
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener los eventos",
      error: (error as Error).message
    });
  }
};

export const getevento = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // 1. Obtener evento
    const evento = await Agenda.findOne({
      where: { id },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    // 2. Determinar tipo de evento
    const esSesion = evento.tipoevento?.nombre === "Sesión";
    const tipoEvento = esSesion ? 1 : 2; // 1 = Sesión, 2 = Comisiones

    // 3. Obtener título según tipo de evento
    let titulo = "";
    if (esSesion) {
      titulo = evento.descripcion ?? "";
    } else {
      const anfitriones = await AnfitrionAgenda.findAll({
        where: { agenda_id: evento.id },
        attributes: ["autor_id"],
        raw: true
      });
      const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
      
      if (comisionIds.length > 0) {
        const comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["nombre"],
          raw: true
        });
        titulo = comisiones.map(c => c.nombre).join(", ");
      }
    }

    // 4. Verificar si existen asistencias
    const asistenciasExistentes = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      order: [['created_at', 'DESC']],
      raw: true,
    });

    // 5. Si NO existen asistencias, crearlas
    if (asistenciasExistentes.length === 0) {
      await crearAsistencias(evento, esSesion);
      
      // Volver a consultar las asistencias recién creadas
      const asistenciasNuevas = await AsistenciaVoto.findAll({
        where: { id_agenda: id },
        order: [['created_at', 'DESC']],
        raw: true,
      });

      const integrantes = await procesarAsistencias(asistenciasNuevas, esSesion);
      
      return res.status(200).json({
        msg: "Asistencias creadas exitosamente",
        evento,
        integrantes,
        titulo,
        tipoEvento
      });
    }

    // 6. Si SÍ existen asistencias, procesarlas
    const integrantes = await procesarAsistencias(asistenciasExistentes, esSesion);

    return res.status(200).json({
      msg: "Evento con asistencias existentes",
      evento,
      integrantes,
      titulo,
      tipoEvento
    });

  } catch (error) {
    console.error("Error obteniendo evento:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener el evento",
      error: (error as Error).message,
    });
  }
};

/**
 * Crea asistencias para el evento
 */
async function crearAsistencias(evento: any, esSesion: boolean): Promise<void> {
  const listadoDiputados: { 
    id_diputado: string; 
    id_partido: string; 
    comision_dip_id: string | null; 
    cargo_dip_id: string | null; 
  }[] = [];

  if (esSesion) {
    // Para sesiones: todos los diputados de la legislatura actual
    const legislatura = await Legislatura.findOne({
      order: [["fecha_inicio", "DESC"]],
    });

    if (legislatura) {
      const diputados = await IntegranteLegislatura.findAll({
        where: { legislatura_id: legislatura.id },
        include: [{ model: Diputado, as: "diputado" }],
      });

      for (const inteLegis of diputados) {
        if (inteLegis.diputado) {
          listadoDiputados.push({
            id_diputado: inteLegis.diputado.id,
            id_partido: inteLegis.partido_id,
            comision_dip_id: null,
            cargo_dip_id: null,
          });
        }
      }
    }
  } else {
    // Para comisiones: solo integrantes de las comisiones anfitrionas
    const comisiones = await AnfitrionAgenda.findAll({
      where: { agenda_id: evento.id },
    });

    if (comisiones.length > 0) {
      const comisionIds = comisiones.map((c) => c.autor_id);
      const integrantes = await IntegranteComision.findAll({
        where: { comision_id: comisionIds },
        include: [
          {
            model: IntegranteLegislatura,
            as: "integranteLegislatura",
            include: [{ model: Diputado, as: "diputado" }],
          },
        ],
      });

      for (const inte of integrantes) {
        if (inte.integranteLegislatura?.diputado) {
          listadoDiputados.push({
            id_diputado: inte.integranteLegislatura.diputado.id,
            id_partido: inte.integranteLegislatura.partido_id,
            comision_dip_id: inte.comision_id,
            cargo_dip_id: inte.tipo_cargo_comision_id
          });
        }
      }
    }
  }

  // Crear asistencias en bulk
  const mensaje = "PENDIENTE";
  const timestamp = new Date();

  const asistencias = listadoDiputados.map((diputado) => ({
    sentido_voto: 0,
    mensaje,
    timestamp,
    id_diputado: diputado.id_diputado,
    partido_dip: diputado.id_partido,
    comision_dip_id: diputado.comision_dip_id,
    id_cargo_dip: diputado.cargo_dip_id, // 👈 Ya se guarda en la tabla
    id_agenda: evento.id,
  }));

  await AsistenciaVoto.bulkCreate(asistencias);
}

/**
 * Procesa las asistencias y las agrupa según el tipo de evento
 */
async function procesarAsistencias(asistencias: any[], esSesion: boolean): Promise<any> {
  if (esSesion) {
    // Para sesiones: lista plana sin duplicados
    return await procesarAsistenciasSesion(asistencias);
  } else {
    // Para comisiones: agrupadas y ordenadas por cargo
    return await procesarAsistenciasComisiones(asistencias);
  }
}

/**
 * Procesa asistencias para SESIONES (lista plana ordenada alfabéticamente)
 */
async function procesarAsistenciasSesion(asistencias: any[]): Promise<any[]> {
  // Eliminar duplicados por id_diputado (mantener el más reciente)
  const asistenciasSinDuplicados = Object.values(
    asistencias.reduce<Record<string, any>>((acc, curr) => {
      if (!acc[curr.id_diputado]) acc[curr.id_diputado] = curr;
      return acc;
    }, {})
  );

  const diputadoIds = [...new Set(asistenciasSinDuplicados.map(a => a.id_diputado).filter(Boolean))];
  const partidoIds = [...new Set(asistenciasSinDuplicados.map(a => a.partido_dip).filter(Boolean))];

  const [diputados, partidos] = await Promise.all([
    Diputado.findAll({
      where: { id: diputadoIds },
      attributes: ["id", "apaterno", "amaterno", "nombres"],
      raw: true
    }),
    Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true
    })
  ]);

  const diputadosMap = new Map(diputados.map((d: any) => [d.id, d]));
  const partidosMap = new Map(partidos.map((p: any) => [p.id, p]));

  const resultados = asistenciasSinDuplicados.map(inte => {
    const diputado = diputadosMap.get(inte.id_diputado);
    const partido = partidosMap.get(inte.partido_dip);

    const nombreCompletoDiputado = diputado
      ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
      : null;

    return {
      ...inte,
      diputado: nombreCompletoDiputado,
      partido: partido?.siglas || null,
    };
  });

  // Ordenar alfabéticamente por nombre de diputado
  resultados.sort((a, b) => {
    const nombreA = a.diputado || '';
    const nombreB = b.diputado || '';
    return nombreA.localeCompare(nombreB, 'es');
  });

  return resultados;
}

/**
 * Procesa asistencias para COMISIONES (agrupadas por comisión y ordenadas por cargo)
 */
async function procesarAsistenciasComisiones(asistencias: any[]): Promise<any[]> {
  const diputadoIds = [...new Set(asistencias.map(a => a.id_diputado).filter(Boolean))];
  const partidoIds = [...new Set(asistencias.map(a => a.partido_dip).filter(Boolean))];
  const comisionIds = [...new Set(asistencias.map(a => a.comision_dip_id).filter(Boolean))];
  const cargoIds = [...new Set(asistencias.map(a => a.id_cargo_dip).filter(Boolean))]; // 👈 NUEVO

  const [diputados, partidos, comisiones, cargos] = await Promise.all([
    Diputado.findAll({
      where: { id: diputadoIds },
      attributes: ["id", "apaterno", "amaterno", "nombres"],
      raw: true
    }),
    Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true
    }),
    comisionIds.length > 0 ? Comision.findAll({
      where: { id: comisionIds },
      attributes: ["id", "nombre", "importancia"],
      raw: true
    }) : [],
    cargoIds.length > 0 ? TipoCargoComision.findAll({ // 👈 NUEVO: Obtener cargos desde TipoCargo
      where: { id: cargoIds },
      attributes: ["id", "valor", "nivel"],
      raw: true
    }) : []
  ]);

  // Crear mapas
  const diputadosMap = new Map(diputados.map((d: any) => [d.id, d]));
  const partidosMap = new Map(partidos.map((p: any) => [p.id, p]));
  const comisionesMap = new Map(comisiones.map((c: any) => [c.id, c]));
  const cargosMap = new Map(cargos.map((c: any) => [c.id, c])); // 👈 NUEVO

  // Mapear asistencias con información completa
  const resultados = asistencias.map(inte => {
    const diputado = diputadosMap.get(inte.id_diputado);
    const partido = partidosMap.get(inte.partido_dip);
    const comision = inte.comision_dip_id ? comisionesMap.get(inte.comision_dip_id) : null;
    const cargo = inte.id_cargo_dip ? cargosMap.get(inte.id_cargo_dip) : null; // 👈 NUEVO

    const nombreCompletoDiputado = diputado
      ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
      : null;

    return {
      ...inte,
      diputado: nombreCompletoDiputado,
      partido: partido?.siglas || null,
      comision_id: inte.comision_dip_id,
      comision_nombre: comision?.nombre || 'Sin comisión',
      comision_importancia: comision?.importancia || 999,
      cargo: cargo?.valor || null, 
      nivel_cargo: cargo?.nivel || 999 
    };
  });

  // Agrupar por comisión
  const integrantesAgrupados = resultados.reduce((grupos, integrante) => {
    const comisionNombre = integrante.comision_nombre;
    
    if (!grupos[comisionNombre]) {
      grupos[comisionNombre] = {
        comision_id: integrante.comision_id,
        comision_nombre: comisionNombre,
        importancia: integrante.comision_importancia,
        integrantes: []
      };
    }
    
    grupos[comisionNombre].integrantes.push(integrante);
    return grupos;
  }, {} as Record<string, any>);

  // Convertir a array y ordenar por importancia de comisión
  const comisionesArray = Object.values(integrantesAgrupados).sort((a: any, b: any) => {
    return a.importancia - b.importancia;
  });

  // Ordenar integrantes dentro de cada comisión por nivel de cargo
  comisionesArray.forEach((comision: any) => {
    comision.integrantes.sort((a: any, b: any) => a.nivel_cargo - b.nivel_cargo);
  });

  return comisionesArray;
}

export const actualizar = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    if (!body.id) {
      return res.status(400).json({
        msg: "El campo 'id' es requerido",
        estatus: 400
      });
    }

    if (body.sentido === undefined || body.sentido === null) {
      return res.status(400).json({
        msg: "El campo 'sentido' es requerido",
        estatus: 400
      });
    }
    const voto = await AsistenciaVoto.findOne({
      where: {
        id: body.id,
      },
    });

    if (!voto) {
      return res.status(404).json({
        msg: "No se encontró el registro de asistencia",
        estatus: 404
      });
    }

    let nuevoSentido: number;
    let nuevoMensaje: string;

    switch (body.sentido) {
      case 1:
        nuevoSentido = 1;
        nuevoMensaje = "ASISTENCIA";
        break;
      case 2:
        nuevoSentido = 2;
        nuevoMensaje = "ASISTENCIA ZOOM";
        break;
      case 0:
        nuevoSentido = 0;
        nuevoMensaje = "PENDIENTE";
        break;
      default:
        return res.status(400).json({
          msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (ASISTENCIA) o 2 (ASISTENCIA ZOOM)",
          estatus: 400
        });
    }


    await AsistenciaVoto.update(
      {
        sentido_voto: nuevoSentido,
        mensaje: nuevoMensaje,
      },
      {
        where: {
          id: body.id,
        },
      }
    );

    return res.status(200).json({
      msg: "Registro actualizado correctamente",
      estatus: 200,

    });

  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      estatus: 500,
      error: (error as Error).message 
    });
  }
};


export const catalogos = async (req: Request, res: Response): Promise<any> => {
    try {
        const proponentes = await Proponentes.findAll({
          attributes: ['id', 'valor'],
          raw: true,
        });

        const partidos = await Partidos.findAll({
          attributes: ['id', 'siglas'],
          raw: true,
        });

        const comisiones = await Comision.findAll({
          attributes: ['id', 'nombre'],
          raw: true,
        });


        const legislatura = await Legislatura.findOne({
          order: [["fecha_inicio", "DESC"]],
        });

        let diputadosArray: { id: string; nombre: string }[] = [];

        if (legislatura) {
          const diputados = await IntegranteLegislatura.findAll({
            where: { legislatura_id: legislatura.id },
            include: [
              {
                model: Diputado,
                as: "diputado",
                attributes: ["id", "nombres", "apaterno", "amaterno"],
              },
            ],
          });
          diputadosArray = diputados
            .filter(d => d.diputado)
            .map(d => ({
              id: d.diputado.id,
              nombre: `${d.diputado.nombres ?? ""} ${d.diputado.apaterno ?? ""} ${d.diputado.amaterno ?? ""}`.trim(),
            }));
        }

        const tipointer = await TipoIntervencion.findAll({
            attributes: ['id', 'valor'],
            raw: true,
          });


        return res.json({
            proponentes: proponentes,
            comisiones: comisiones,
            diputados: diputadosArray,
            tipointer: tipointer,
            partidos:partidos

        });

    } catch (error) {
        console.error('Error al generar consulta:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
}

export const getTiposPuntos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    const  proponentes  = body;
    
    if (!proponentes || !Array.isArray(proponentes) || proponentes.length === 0) {
      return res.status(400).json({ message: 'Se requiere un arreglo de proponentes' });
    }

    let dtSlctConsolidado: any[] = [];
    let tiposConsolidados: any[] = [];
    let combosConsolidados: any[] = [];

    for (const proponenteData of proponentes) {
      const proponente = await Proponentes.findByPk(proponenteData.id);

      if (!proponente) {
        continue; 
      }

      let tiposRelacionados = await proponente.getTipos({ 
        attributes: ['id', 'valor'], 
        joinTableAttributes: [] 
      });
      
      tiposRelacionados.forEach((tipo: any) => {
        tiposConsolidados.push({
          ...tipo.toJSON(),
          proponente_id: proponente.id,
          proponente_valor: proponente.valor
        });
      });

      let dtSlctTemp: any = null;

      if (proponente.valor === 'Diputadas y Diputados') {
        const legis = await Legislatura.findOne({
          order: [["fecha_inicio", "DESC"]],
        });

        if (legis) {
          const dips = await IntegranteLegislatura.findAll({
            where: { legislatura_id: legis.id },
            include: [{ 
              model: Diputado, 
              as: 'diputado', 
              attributes: ['id', 'apaterno', 'amaterno', 'nombres'] 
            }],
          });

          const dipss = dips
            .filter((d) => d.diputado)
            .map((item) => ({
              id: `${proponente.id}/${item.diputado.id}`, // 👈 Concatenado
              id_original: item.diputado.id, // 👈 ID original
              valor: `${item.diputado.apaterno ?? ''} ${item.diputado.amaterno ?? ''} ${item.diputado.nombres ?? ''}`.trim(),
              proponente_id: proponente.id,
              proponente_valor: proponente.valor,
              tipo: 'diputado'
            }));

          dtSlctTemp = dipss;
        }
        
      } else if (proponente.valor === 'Mesa Directiva en turno') {
        const idMesa = await TipoComisions.findOne({ where: { valor: 'Mesa Directiva' } });
        if (idMesa) {
          const mesa = await Comision.findOne({
            where: { tipo_comision_id: idMesa.id },
            order: [['created_at', 'DESC']],
          });
          if (mesa) {
            dtSlctTemp = [{
              id: `${proponente.id}/${mesa.id}`,
              id_original: mesa.id,
              valor: mesa.nombre,
              proponente_id: proponente.id,
              proponente_valor: proponente.valor,
              tipo: 'comision'
            }];
          }
        }
       
      } else if (proponente.valor === 'Junta de Coordinación Politica') {
        const idMesa = await TipoComisions.findOne({ where: { valor: 'Comisiones Legislativas' } });
        if (idMesa) {
          const mesa = await Comision.findOne({
            where: {
              tipo_comision_id: idMesa.id,
              nombre: { [Op.like]: '%jucopo%' },
            },
            order: [['created_at', 'DESC']],
          });
          if (mesa) {
            dtSlctTemp = [{
              id: `${proponente.id}/${mesa.id}`,
              id_original: mesa.id,
              valor: mesa.nombre,
              proponente_id: proponente.id,
              proponente_valor: proponente.valor,
              tipo: 'comision'
            }];
          }
        }
        
      } else if (proponente.valor === 'Secretarías del GEM') {
        const secretgem = await Secretarias.findAll();
        dtSlctTemp = secretgem.map(s => ({
          id: `${proponente.id}/${s.id}`,
          id_original: s.id,
          valor: `${s.nombre} / ${s.titular}`,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'secretaria'
        }));
        
      } else if (proponente.valor === 'Gobernadora o Gobernador del Estado') {
        const gobernadora = await CatFunDep.findOne({
          where: {
            nombre_dependencia: { [Op.like]: '%Gobernadora o Gobernador del Estado%' },
            vigente: 1
          },
        });
        if (gobernadora) {
          dtSlctTemp = [{
            id: `${proponente.id}/${gobernadora.id}`,
            id_original: gobernadora.id,
            valor: gobernadora.nombre_titular,
            proponente_id: proponente.id,
            proponente_valor: proponente.valor,
            tipo: 'funcionario'
          }];
        }

      } else if (proponente.valor === 'Ayuntamientos') {
        const municipios = await MunicipiosAg.findAll();
        dtSlctTemp = municipios.map(l => ({
          id: `${proponente.id}/${l.id}`,
          id_original: l.id,
          valor: l.nombre,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'municipio'
        }));
        
      } else if (proponente.valor === 'Comición de Derechos Humanos del Estado de México') {
        const derechoshumanos = await Comision.findOne({
          where: {
            nombre: { [Op.like]: '%Derechos Humanos%' },
          },
          order: [['created_at', 'DESC']],
        });
        if (derechoshumanos) {
          dtSlctTemp = [{
            id: `${proponente.id}/${derechoshumanos.id}`,
            id_original: derechoshumanos.id,
            valor: derechoshumanos.nombre,
            proponente_id: proponente.id,
            proponente_valor: proponente.valor,
            tipo: 'comision'
          }];
        }
        
      } else if (proponente.valor === 'Tribunal Superior de Justicia') {
        const tribunal = await CatFunDep.findOne({
          where: {
            nombre_dependencia: { [Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
            vigente: 1
          },
        });
        if (tribunal) {
          dtSlctTemp = [{
            id: `${proponente.id}/${tribunal.id}`,
            id_original: tribunal.id,
            valor: tribunal.nombre_titular,
            proponente_id: proponente.id,
            proponente_valor: proponente.valor,
            tipo: 'funcionario'
          }];
        }
        
      } else if (
        proponente.valor === 'Ciudadanas y ciudadanos del Estado' ||
        proponente.valor === 'Fiscalía General de Justicia del Estado de México'
      ) {
        const fiscalia = await CatFunDep.findOne({
          where: {
            nombre_dependencia: { [Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
            vigente: 1
          },
        });
        if (fiscalia) {
          dtSlctTemp = [{
            id: `${proponente.id}/${fiscalia.id}`,
            id_original: fiscalia.id,
            valor: fiscalia.nombre_titular,
            proponente_id: proponente.id,
            proponente_valor: proponente.valor,
            tipo: 'funcionario'
          }];
        }
          
      } else if (proponente.valor === 'Comisiones Legislativas') {
        const idMesa = await TipoComisions.findOne({ where: { valor: 'Comisiones Legislativas' } });
        if (idMesa) {
          const comi = await Comision.findAll({ where: { tipo_comision_id: idMesa.id } });
          dtSlctTemp = comi.map((item) => ({ 
            id: `${proponente.id}/${item.id}`,
            id_original: item.id,
            valor: item.nombre,
            proponente_id: proponente.id,
            proponente_valor: proponente.valor,
            tipo: 'comision'
          }));
        }
         
      } else if (proponente.valor === 'Municipios') {
        const municipios = await MunicipiosAg.findAll();
        dtSlctTemp = municipios.map(l => ({
          id: `${proponente.id}/${l.id}`,
          id_original: l.id,
          valor: l.nombre,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'municipio'
        }));

      } else if (proponente.valor === 'Diputación Permanente') {
        const idMesa = await TipoComisions.findOne({ where: { valor: 'Diputación Permanente' } });
        if (idMesa) {
          const mesa = await Comision.findOne({
            where: { tipo_comision_id: idMesa.id },
            order: [['created_at', 'DESC']],
          });
          if (mesa) {
            dtSlctTemp = [{
              id: `${proponente.id}/${mesa.id}`,
              id_original: mesa.id,
              valor: mesa.nombre,
              proponente_id: proponente.id,
              proponente_valor: proponente.valor,
              tipo: 'comision'
            }];
          }
        }

      } else if (proponente.valor === 'Grupo Parlamentario') {
        const partidos = await Partidos.findAll();
        dtSlctTemp = partidos.map(l => ({
          id: `${proponente.id}/${l.id}`,
          id_original: l.id,
          valor: l.siglas,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'partido'
        }));

      } else if (proponente.valor === 'Legislatura') {
        const legislaturas = await Legislatura.findAll();
        dtSlctTemp = legislaturas.map(l => ({
          id: `${proponente.id}/${l.id}`,
          id_original: l.id,
          valor: l.numero,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'legislatura'
        }));
      }

      if (dtSlctTemp) {
        if (Array.isArray(dtSlctTemp)) {
          dtSlctConsolidado.push(...dtSlctTemp);
        } else {
          dtSlctConsolidado.push(dtSlctTemp);
        }
      }
    }

    return res.json({
      dtSlct: dtSlctConsolidado,
      tipos: tiposConsolidados,
    });
    
  } catch (error) {
    console.error('Error en getTiposPuntos:', error);
    return res.status(500).json({ 
      message: 'Error al obtener tipos de puntos', 
    });
  }
};

export const guardarpunto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { body } = req;
    const file = req.file;
    
    // console.log(body);
    // return 500;

  
    const presentaArray = (body.presenta || "")
      .split(",")
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .map((item: string) => {
        const [proponenteId, autorId] = item.split('/');
        return {
          proponenteId: parseInt(proponenteId),
          autorId: autorId 
        };
      });


    const proponentesIds = (body.proponente || "")
      .split(",")
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));

    const turnocomision = (body.id_comision || "")
      .split(",")
      .map((id: string) => id.trim()) 
      .filter((id: string) => id.length > 0);

    const evento = await Agenda.findOne({ where: { id } });
    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const puntonuevo = await PuntosOrden.create({
      id_evento: evento.id,
      nopunto: body.numpunto,
      id_tipo: body.tipo,
      tribuna: body.tribuna,
      path_doc: file ? `storage/puntos/${file.filename}` : null,
      punto: body.punto,
      observaciones: body.observaciones,
      se_turna_comision: body.se_turna_comision,
    });

    for (const item of presentaArray) {
      await PuntosPresenta.create({
        id_punto: puntonuevo.id,
        id_tipo_presenta: item.proponenteId,
        id_presenta: item.autorId 
      });
    }

    for (const item of turnocomision) {
      await PuntosComisiones.create({
        id_punto: puntonuevo.id,
        id_comision: item,
      });
    }


    return res.status(201).json({
      message: "Punto creado correctamente",
      data: puntonuevo,
    });
  } catch (error: any) {
    console.error("Error al guardar el punto:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const getpuntos = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const puntos = await PuntosOrden.findAll({
        where: { id_evento: id },
        order: [['nopunto', 'DESC']],
        include: [
          {
            model: PuntosPresenta,
            as: "presentan",
            attributes: [
              [
                Sequelize.fn(
                  'CONCAT',
                  Sequelize.col('presentan.id_tipo_presenta'),
                  '/',
                  Sequelize.col('presentan.id_presenta')
                ),
                'id'
              ],
              "id_tipo_presenta",
              "id_presenta",
              ["id_tipo_presenta", "id_proponente"]
            ]
          },
          { model: PuntosComisiones, as: "turnocomision", attributes: ["id", "id_punto","id_comision"] },
        ]
      });
      if (!puntos) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
     
      return res.status(201).json({
        message: "Se encontraron registros",
        data: puntos, 
      });
    } catch (error: any) {
      console.error("Error al guardar el punto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const actualizarPunto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { body } = req;
    const file = req.file;
    const presentaArray = (body.presenta || "")
      .split(",")
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .map((item: string) => {
        const [proponenteId, autorId] = item.split('/');
        return {
          proponenteId: parseInt(proponenteId),
          autorId: autorId 
        };
      });
    const proponentesIds = (body.proponente || "")
      .split(",")
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));

    const turnocomision = (body.id_comision || "")
      .split(",")
      .map((id: string) => id.trim()) 
      .filter((id: string) => id.length > 0);


    const punto = await PuntosOrden.findOne({ where: { id } });
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }

    const nuevoPath = file ? `storage/puntos/${file.filename}` : punto.path_doc;

    await punto.update({
      nopunto: body.numpunto ?? punto.nopunto,
      id_tipo: body.tipo ?? punto.id_tipo,
      tribuna: body.tribuna ?? punto.tribuna,
      path_doc: nuevoPath,
      punto: body.punto ?? punto.punto,
      observaciones: body.observaciones ?? punto.observaciones,
      editado: 1,
      se_turna_comision: body.se_turna_comision,
    });

    await PuntosPresenta.destroy({
      where: { id_punto: punto.id }
    });

    for (const item of presentaArray) {
      await PuntosPresenta.create({
        id_punto: punto.id,
        id_tipo_presenta: item.proponenteId, 
        id_presenta: item.autorId
      });
    }
    await PuntosComisiones.destroy({
      where: { id_punto: punto.id }
    });

     for (const item of turnocomision) {
      await PuntosComisiones.create({
        id_punto: punto.id,
        id_comision: item,
      });
    }

    return res.status(200).json({
      message: "Punto actualizado correctamente",
      data: punto,
    });

  } catch (error: any) {
    console.error("Error al actualizar el punto:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};


export const eliminarpunto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const punto = await PuntosOrden.findOne({ where: { id } });
     if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    await punto.destroy();
    return res.status(200).json({
      message: "Punto eliminado correctamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar el punto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const saveintervencion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;

    const registros = body.id_diputado.map((diputadoId: string) => ({
      id_punto: body.id_punto,
      id_evento: body.id_evento,
      id_diputado: diputadoId,
      id_tipo_intervencion: body.id_tipo_intervencion,
      mensaje: body.comentario,
      tipo: body.tipo,
      destacado: body.destacada, 
    }));

    const nuevasIntervenciones = await Intervencion.bulkCreate(registros, {
      returning: true,
    });

    if (body.destacada == 1) {
      for (const intervencion of nuevasIntervenciones) {
        await enviarWhatsIntervencion(intervencion);
      }
    }

    return res.status(200).json({
      message: "Intervenciones guardadas correctamente",
    });

  } catch (error: any) {
    console.error("Error al guardar intervenciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getintervenciones = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;

    const intervenci = await Intervencion.findAll({
        where: {
          id_evento: body.idagenda,
          tipo: body.tipo,
          id_punto: body.idpunto,
        },
        include: [
          {
            model: TipoIntervencion,
            as: "tipointerven",
            attributes: ["id", "valor"],
          },
        ],
      });

      const resultados = await Promise.all(
        intervenci.map(async (inte) => {
          const diputado = await Diputado.findOne({
            where: { id: inte.id_diputado },
            attributes: ["apaterno", "amaterno", "nombres"],
            raw: true,
          });

          const nombreCompletoDiputado = diputado
            ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
            : null;

          return {
            id: inte.id,
            id_evento: inte.id_evento,
            id_punto: inte.id_punto,
            mensaje: inte.mensaje,
            tipo: inte.tipo,
            destacado: inte.destacado,
            tipointerven: inte.tipointerven, 
            diputado: nombreCompletoDiputado,
          };
        })
      );

      return res.status(200).json({
        data: resultados,
      });
   
  } catch (error: any) {
    console.error("Error al traer el evento:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const eliminarinter = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const inter = await Intervencion.findOne({ where: { id } });
     if (!inter) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    await inter.destroy();
    return res.status(200).json({
      message: "Intervencion eliminada correctamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar la intervencion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const getvotacionpunto = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const punto = await PuntosOrden.findOne({ where: { id } });
    if (!punto) {
      return res.status(404).json({ msg: "Punto no encontrado" });
    }

    const evento = await Agenda.findOne({
      where: { id: punto.id_evento },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });
    
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const esSesion = evento.tipoevento?.nombre === "Sesión";
    const tipoEvento = esSesion ? 'sesion' : 'comision';
    const tipovento = esSesion ? 1 : 2; // 1 = Sesión, 2 = Comisiones

    let temavotos = await TemasPuntosVotos.findOne({ where: { id_punto: id } });
    let mensajeRespuesta = "Punto con votos existentes";
    
    if (!temavotos) {
      const listadoDiputados = await obtenerListadoDiputados(evento);
      
      temavotos = await TemasPuntosVotos.create({
        id_punto: punto.id,
        id_evento: punto.id_evento,
        tema_votacion: null,
        fecha_votacion: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      
      const votospunto = listadoDiputados.map((dip) => ({
        sentido: 0,
        mensaje: "PENDIENTE",
        id_tema_punto_voto: temavotos.id,
        id_diputado: dip.id_diputado,
        id_partido: dip.id_partido,
        id_comision_dip: dip.comision_dip_id,
        id_cargo_dip: dip.id_cargo_dip,
      }));
      
      await VotosPunto.bulkCreate(votospunto);
      mensajeRespuesta = "Votacion creada correctamente";
    }

    const integrantes = await obtenerResultadosVotacionOptimizado(
      temavotos.id,
      tipoEvento
    );

    return res.status(200).json({
      msg: mensajeRespuesta,
      evento,
      integrantes,
      tipovento
    });
    
  } catch (error: any) {
    console.error("Error al traer los votos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

async function obtenerListadoDiputados(evento: any) {
  const listadoDiputados: { id_diputado: string; id_partido: string; comision_dip_id: string | null; id_cargo_dip: string | null }[] = [];
  
  const diputados = await AsistenciaVoto.findAll({
        where: { id_agenda: evento.id },
  });
    for (const inteLegis of diputados) {
            listadoDiputados.push({
            id_diputado: inteLegis.id_diputado,
            id_partido: inteLegis.partido_dip,
            comision_dip_id: inteLegis.comision_dip_id,
            id_cargo_dip: inteLegis.id_cargo_dip,
          });
    }
  return listadoDiputados;
}


interface ResultadoVotacion {
  id: string;
  sentido: number;
  mensaje: string;
  id_diputado: string;
  id_partido: string;
  id_comision_dip: string | null;
  id_cargo_dip: string | null;
  diputado: string | null;
  partido: string | null;
  comision_nombre?: string;
  comision_importancia?: string;
  cargo?: string;
  nivel_cargo?: number;
}

interface ComisionAgrupada {
  comision_id: string | null;
  comision_nombre: string | null;
  importancia: string | null;
  integrantes: ResultadoVotacion[];
}

async function obtenerResultadosVotacionOptimizado(
  idTemaPuntoVoto: string,
  tipoEvento: 'sesion' | 'comision'
): Promise<ResultadoVotacion[] | ComisionAgrupada[]> {
  
  const votosRaw = await VotosPunto.findAll({
    where: { id_tema_punto_voto: idTemaPuntoVoto },
    raw: true,
  });
  
  if (votosRaw.length === 0) {
    return [];
  }

  const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
  const diputados = await Diputado.findAll({
    where: { id: diputadoIds },
    attributes: ["id", "apaterno", "amaterno", "nombres"],
    raw: true,
  });
  const diputadosMap = new Map(
    diputados.map(d => [d.id, d])
  );

  const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
  const partidos = await Partidos.findAll({
    where: { id: partidoIds },
    attributes: ["id", "siglas"],
    raw: true,
  });
  const partidosMap = new Map(
    partidos.map(p => [p.id, p])
  );

  let comisionesMap = new Map();
  let cargosMap = new Map();
  
  if (tipoEvento === 'comision') {
    const comisionIds = votosRaw
      .map(v => v.id_comision_dip)
      .filter(Boolean);
    
    if (comisionIds.length > 0) {
      const comisiones = await Comision.findAll({
        where: { id: comisionIds },
        attributes: ["id", "nombre", "importancia"],
        raw: true,
      });
      comisionesMap = new Map(
        comisiones.map(c => [c.id, c])
      );
    }

    const cargoIds = votosRaw  
      .map(v => v.id_cargo_dip)
      .filter(Boolean);
    
    if (cargoIds.length > 0) {
      const cargos = await TipoCargoComision.findAll({
        where: { id: cargoIds },
        attributes: ["id", "valor", "nivel"],
        raw: true,
      });
      cargosMap = new Map(
        cargos.map(c => [c.id, c])
      );
    }
  }

  const resultados: ResultadoVotacion[] = votosRaw.map((voto) => {
    const diputado = diputadosMap.get(voto.id_diputado);
    const partido = partidosMap.get(voto.id_partido);
    const comision = comisionesMap.get(voto.id_comision_dip);
    const cargo = cargosMap.get(voto.id_cargo_dip);
    
    const nombreCompletoDiputado = diputado
      ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
      : null;

    const resultado: ResultadoVotacion = {
      id: voto.id,
      sentido: voto.sentido,
      mensaje: voto.mensaje,
      id_diputado: voto.id_diputado,
      id_partido: voto.id_partido,
      id_comision_dip: voto.id_comision_dip,
      id_cargo_dip: voto.id_cargo_dip,
      diputado: nombreCompletoDiputado,
      partido: partido?.siglas || null,
    };

    if (tipoEvento === 'comision') {
      resultado.comision_nombre = comision?.nombre || null;
      resultado.comision_importancia = comision?.importancia || null;
      resultado.cargo = cargo?.valor || null;
      resultado.nivel_cargo = cargo?.nivel || 999;
    }

    return resultado;
  });


  if (tipoEvento === 'sesion') {
   
    resultados.sort((a, b) => {
      const nombreA = a.diputado || '';
      const nombreB = b.diputado || '';
      return nombreA.localeCompare(nombreB, 'es');
    });
    return resultados;
    
  } else {
    resultados.sort((a, b) => {
      const nivelA = a.nivel_cargo || 999;
      const nivelB = b.nivel_cargo || 999;
      return nivelA - nivelB;
    });

    const agrupados = resultados.reduce((acc, voto) => {
      const comisionId = voto.id_comision_dip || 'sin_comision';
      
      if (!acc[comisionId]) {
        acc[comisionId] = {
          comision_id: voto.id_comision_dip,
          comision_nombre: voto.comision_nombre || null,
          importancia: voto.comision_importancia || null,
          integrantes: [],
        };
      }
      
      acc[comisionId].integrantes.push(voto);
      return acc;
    }, {} as Record<string, ComisionAgrupada>);

    const resultado = Object.values(agrupados).sort((a, b) => {
      const importanciaA = parseInt(a.importancia || '999');
      const importanciaB = parseInt(b.importancia || '999');
      return importanciaA - importanciaB;
    });

    return resultado;
  }
}


export const actualizarvoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;

    if (!body.idpunto || !body.id|| body.sentido === undefined) {
      return res.status(400).json({
        msg: "Faltan datos requeridos: idpunto, iddiputado y sentido",
      });
    }

    const temavotos = await TemasPuntosVotos.findOne({ 
      where: { id_punto: body.idpunto } 
    });

    if (!temavotos) {
      return res.status(404).json({
        msg: "No se encontró el tema de votación para este punto",
      });
    }

    let nuevoSentido: number;
    let nuevoMensaje: string;

    switch (body.sentido) {
      case 1:
        nuevoSentido = 1;
        nuevoMensaje = "A FAVOR";
        break;
      case 2:
        nuevoSentido = 2;
        nuevoMensaje = "ABSTENCIÓN";
        break;
      case 0:
        nuevoSentido = 0;
        nuevoMensaje = "PENDIENTE";
        break;
      case 3:
        nuevoSentido = 3;
        nuevoMensaje = "EN CONTRA";
        break;
      default:
        return res.status(400).json({
          msg: "Sentido de voto inválido. Usa 1 (A FAVOR), 2 (ABSTENCIÓN) o 0/3 (EN CONTRA)",
        });
    }

    const [cantidadActualizada] = await VotosPunto.update(
      {
        sentido: nuevoSentido,
        mensaje: nuevoMensaje,
      },
      {
        where: {
          id: body.id,
        }
      }
    );

    if (cantidadActualizada === 0) {
      return res.status(404).json({
        msg: "No se encontró el voto del diputado para este punto",
      });
    }

    return res.status(200).json({
      msg: "Voto actualizado correctamente",
      estatus: 200,
      registrosActualizados: cantidadActualizada,
    });

  } catch (error) {
    console.error('Error al actualizar el voto:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const reiniciarvoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    if (!body.idpunto) {
      return res.status(400).json({
        msg: "Falta el parámetro requerido: idpunto",
      });
    }
    const temavotos = await TemasPuntosVotos.findOne({ 
      where: { id_punto: body.idpunto } 
    });

    if (!temavotos) {
      return res.status(404).json({
        msg: "No se encontró el tema de votación para este punto",
      });
    }
    const [cantidadActualizada] = await VotosPunto.update(
      {
        sentido: 0,
        mensaje: "PENDIENTE",
      },
      {
        where: {
          id_tema_punto_voto: temavotos.id,  
        }
      }
    );
    if (cantidadActualizada === 0) {
      return res.status(404).json({
        msg: "No se encontraron votos para reiniciar",
      });
    }
    return res.status(200).json({
      msg: `${cantidadActualizada} voto(s) reiniciado(s) correctamente a PENDIENTE`,
      estatus: 200,
    });

  } catch (error) {
    console.error('Error al reiniciar las votaciones:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};


export const catalogossave = async (req: Request, res: Response) => {
  try {
    const sedes = await Sedes.findAll({
      attributes: ['id', ['sede', 'name']]
    });

    const comisiones = await Comision.findAll({
      attributes: ['id', ['nombre', 'name']]
    });

    const municipios = await MunicipiosAg.findAll({
      attributes: ['id', ['nombre', 'name']],
    });

    const partidos = await Partidos.findAll({
      attributes: ['id', ['nombre', 'name']]
    });

    const tipoAutores = await TipoAutor.findAll({
      attributes: ['id', ['valor', 'name']]
    });

    const otros = await OtrosAutores.findAll({
      attributes: ['id', ['valor', 'name']]
    });

    const legislatura = await Legislatura.findAll({
      attributes: ['id', ['numero', 'name']]
    });

    const tipoevento = await TipoEventos.findAll({
      attributes: ['id', ['nombre', 'name']]
    });
    const idComites = await TipoComisions.findOne({
      where: { valor: 'Comités' }
    });

    let comites: Record<string, string> = {};

    if (idComites) {
      const com = await Comision.findAll({
        where: { tipo_comision_id: idComites.id },
        attributes: ['id',['nombre', 'name']]
      });

      comites = Object.fromEntries(
        com.map(item => [item.id, item.nombre])
      );
    }

    const idPermanente = await TipoComisions.findOne({
      where: { valor: 'Diputación Permanente' }
    });

    let permanente: Record<string, string> = {};

    if (idPermanente) {
      const dips = await Comision.findAll({
        where: { tipo_comision_id: idPermanente.id },
        attributes: ['id', ['nombre', 'name']]
      });

      permanente = Object.fromEntries(
        dips.map(item => [item.id, item.nombre])
      );
    }

    const legisla = await Legislatura.findOne({
      order: [["fecha_inicio", "DESC"]],
    });

    let diputadosArray: { id: string; nombre: string }[] = [];

    if (legisla) {
      const diputados = await IntegranteLegislatura.findAll({
        where: { legislatura_id: legisla.id },
        include: [
          {
            model: Diputado,
            as: "diputado",
            attributes: ["id", "nombres", "apaterno", "amaterno"],
          },
        ],
      });
      diputadosArray = diputados
            .filter(d => d.diputado)
            .map(d => ({
              id: d.diputado.id,
              nombre: `${d.diputado.nombres ?? ""} ${d.diputado.apaterno ?? ""} ${d.diputado.amaterno ?? ""}`.trim(),
            }));
    }


    return res.json({
      sedes,
      comisiones,
      municipios,
      partidos,
      tipoAutores,
      otros,
      legislatura,
      tipoevento,
      comites,
      permanente,
      diputadosArray
    });

  } catch (error) {
    console.error("Error al obtener catálogos de agenda:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};



export const saveagenda = async (req: Request, res: Response) => {
  try {
    const agendaBody = req.body;
    const anfitriones = req.body.autores || [];

    const agenda = await Agenda.create({
      descripcion: agendaBody.descripcion,
      fecha: agendaBody.fecha,
      sede_id: agendaBody.sede_id,
      tipo_evento_id: agendaBody.tipo_evento_id, 
      transmision: agendaBody.transmite,
      liga: agendaBody.liga || null,
      fecha_hora_inicio: agendaBody.hora_inicio || null,
      fecha_hora_fin: agendaBody.hora_fin || null,

    });

    for (const item of anfitriones) {
   
      const tipoAutorRecord = await TipoAutor.findOne({
        where: { valor: item.tipo }
      });

      const tipoAutorId = tipoAutorRecord?.id;
      if (!tipoAutorId) continue;

     
      if (Array.isArray(item.autor_id)) {
        for (const autor of item.autor_id) {
          await AnfitrionAgenda.create({
            agenda_id: agenda.id,
            tipo_autor_id: tipoAutorId,
            autor_id: autor.autor_id
          });
        }
      }

  
      else if (typeof item.autor_id === "string") {
        await AnfitrionAgenda.create({
          agenda_id: agenda.id,
          tipo_autor_id: tipoAutorId,
          autor_id: item.autor_id
        });
      }
    }

    return res.json({ response: "success", id: agenda.id });

  } catch (error) {
    console.error("Error al guardar la agenda:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};

export const getAgenda = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agenda = await Agenda.findByPk(id, {
      include: [
        {
          model: AnfitrionAgenda,
          as: "anfitrion_agendas"
        }
      ]
    });

    if (!agenda) {
      return res.status(404).json({ msg: "Agenda no encontrada" });
    }

    return res.json(agenda);

  } catch (error) {
    console.error("Error al obtener la agenda:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};


export const updateAgenda = async (req: Request, res: Response) => {
  try {
    const agendaId = req.params.id; 
    const body = req.body;
    const anfitriones = req.body.autores || [];
    const agenda = await Agenda.findByPk(agendaId);
    if (!agenda) {
      return res.status(404).json({ msg: "Agenda no encontrada" });
    }

    await agenda.update({
      descripcion: body.descripcion,
      fecha: body.fecha,
      sede_id: body.sede_id,
      tipo_evento_id: body.tipo_evento_id,
      transmision: body.transmite,
      liga: body.liga || null,
      fecha_hora_inicio: body.hora_inicio || null,
      fecha_hora_fin: body.hora_fin || null,
    });

    await AnfitrionAgenda.destroy({
      where: { agenda_id: agendaId }
    });

    for (const item of anfitriones) {
      const tipoAutorRecord = await TipoAutor.findOne({
        where: { valor: item.tipo }
      });

      const tipoAutorId = tipoAutorRecord?.id;
      if (!tipoAutorId) continue;

      if (Array.isArray(item.autor_id)) {
        for (const autor of item.autor_id) {
          await AnfitrionAgenda.create({
            agenda_id: agendaId,
            tipo_autor_id: tipoAutorId,
            autor_id: autor.autor_id
          });
        }
      }

      else if (typeof item.autor_id === "string") {
        await AnfitrionAgenda.create({
          agenda_id: agendaId,
          tipo_autor_id: tipoAutorId,
          autor_id: item.autor_id
        });
      }
    }

    return res.json({ response: "success", id: agendaId });

  } catch (error) {
    console.error("Error al actualizar la agenda:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};



const enviarWhatsIntervencion = async (intervencion: any) => {
  try {
   
    const datos = await Intervencion.findOne({
      where: { id: intervencion.id },
      attributes: ['id', 'id_diputado', 'mensaje', 'id_punto', 'id_evento'],
      include: [
        {
          model: PuntosOrden,
          as: "punto",
          attributes: ["nopunto", "punto"],
          required: false
        },
        {
          model: Agenda,
          as: "evento",
          attributes: ["descripcion", "fecha"],
          required: false
        }
      ],
      raw: false
    });

    if (!datos) return;

   
    const diputado = await Diputado.findOne({
      where: { id: datos.id_diputado },
      attributes: ["apaterno", "amaterno", "nombres"],
      raw: true,
    });

    const nombreCompleto = diputado
      ? [diputado.apaterno, diputado.amaterno, diputado.nombres]
          .filter(Boolean)
          .join(" ")
      : "Diputado";


    let titulo = "Intervención destacada";
    
    if (datos.punto) {
      titulo = `del punto ${datos.punto.nopunto}.- ${datos.punto.punto}`;
    } else if (datos.evento) {
      const fechaFormateada = format(
        new Date(datos.evento.fecha),
        "d 'de' MMMM 'de' yyyy",
        { locale: es }
      );
      titulo = `de la ${datos.evento.descripcion} (${fechaFormateada})`;
    }

 
    await axios.post(
      "https://api.ultramsg.com/instance144598/messages/chat",
      new URLSearchParams({
        token: "ml56a7d6tn7ha7cc",
        to: "+527222035605, +527224986377",
        body: `*Intervención destacada ${titulo}*\n*${nombreCompleto}*: ${datos.mensaje}\n`,
        priority: "1",
        referenceId: "",
        msgId: "",
        mentions: ""
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 5000 
      }
    );

  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error("Timeout enviando WhatsApp");
    } else {
      console.error("Error enviando WhatsApp:", error);
    }
  }
};



export const enviarWhatsPunto = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    const datos = await PuntosOrden.findOne({
      where: { id },
      include: [
        {
          model: PuntosPresenta,
          as: "presentan",
          required: false
        },
        {
          model: Agenda,
          as: "evento",
          attributes: ["descripcion", "fecha"],
          required: false
        }
      ],
      raw: false
    });

    if (!datos) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }

    const nopunto = datos.nopunto ?? datos.nopunto ?? "";
    const puntoTexto = datos.punto ?? datos.punto ?? "";
    const tituloPunto = `${nopunto}.- ${puntoTexto}`;

    const descripcion = datos.evento?.descripcion ?? "Sin descripción";

    let fechaFormateada = "";
    if (datos.evento?.fecha) {
      fechaFormateada = format(new Date(datos.evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
    }

    const mensaje = `*Punto número ${nopunto}:*\n${puntoTexto}\n\n*Descripción del evento:* ${descripcion}\n*Fecha:* ${fechaFormateada}`;
    const params = {
      token: "ml56a7d6tn7ha7cc",
      to: "+527222035605",
      body: mensaje,
      priority: "1",
      referenceId: "",
      msgId: "",
      mentions: ""
    };

    await axios.post(
      "https://api.ultramsg.com/instance144598/messages/chat",
      new URLSearchParams(params),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    return res.status(200).json({
      message: "WhatsApp enviado correctamente",
      enviado: true
    });

  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error("Timeout enviando WhatsApp");
    } else {
      console.error("Error enviando WhatsApp:", error);
    }
    return res.status(500).json({ message: "Error enviando WhatsApp" });
  }
};


export const generarPDFVotacion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const punto = await PuntosOrden.findOne({ where: { id } });
    if (!punto) {
      return res.status(404).json({ msg: "Punto no encontrado" });
    }

    const evento = await Agenda.findOne({
      where: { id: punto.id_evento },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    // Determinar tipo de evento
    const esSesion = evento.tipoevento?.nombre === "Sesión";

    let temavotos = await TemasPuntosVotos.findOne({ where: { id_punto: id } });
    if (!temavotos) {
      return res.status(404).json({ msg: "No hay votaciones para este punto" });
    }

    const votosRaw = await VotosPunto.findAll({
      where: { id_tema_punto_voto: temavotos.id },
      raw: true,
    });

    if (votosRaw.length === 0) {
      return res.status(404).json({ msg: "No hay votos registrados" });
    }

    // Obtener diputados
    const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
    const diputados = await Diputado.findAll({
      where: { id: diputadoIds },
      attributes: ["id", "apaterno", "amaterno", "nombres"],
      raw: true,
    });
    const diputadosMap = new Map(diputados.map(d => [d.id, d]));

    // Obtener partidos
    const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
    const partidos = await Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true,
    });
    const partidosMap = new Map(partidos.map(p => [p.id, p]));

    // Obtener comisiones y cargos (solo si es comisión)
    let comisionesMap = new Map();
    let cargosMap = new Map();
    
    if (!esSesion) {
      const comisionIds = votosRaw.map(v => v.id_comision_dip).filter(Boolean);
      if (comisionIds.length > 0) {
        const comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["id", "nombre", "importancia"],
          raw: true,
        });
        comisionesMap = new Map(comisiones.map(c => [c.id, c]));
      }

      const cargoIds = votosRaw.map(v => v.id_cargo_dip).filter(Boolean);
      if (cargoIds.length > 0) {
        const cargos = await TipoCargoComision.findAll({
          where: { id: cargoIds },
          attributes: ["id", "valor", "nivel"],
          raw: true,
        });
        cargosMap = new Map(cargos.map(c => [c.id, c]));
      }
    }

    const getSentidoTexto = (sentido: number): string => {
      switch (sentido) {
        case 1: return "A FAVOR";
        case 2: return "ABSTENCIÓN";
        case 3: return "EN CONTRA";
        case 0: return "PENDIENTE";
        default: return "PENDIENTE";
      }
    };

    // Mapear votos con detalles
    const votosConDetalles = votosRaw.map((voto) => {
      const diputado = diputadosMap.get(voto.id_diputado);
      const partido = partidosMap.get(voto.id_partido);
      const comision = comisionesMap.get(voto.id_comision_dip);
      const cargo = cargosMap.get(voto.id_cargo_dip);
      
      const nombreCompletoDiputado = diputado
        ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
        : "Sin nombre";
      
      return {
        ...voto,
        diputado: nombreCompletoDiputado,
        partido: partido?.siglas || "Sin partido",
        comision_nombre: comision?.nombre || null,
        comision_importancia: comision?.importancia || 999,
        cargo: cargo?.nombre || null,
        nivel_cargo: cargo?.nivel || 999,
        sentidoTexto: getSentidoTexto(voto.sentido),
        sentidoNumerico: voto.sentido
      };
    });

    // Calcular totales
    const totales = {
      favor: votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
      contra: votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
      abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
      pendiente: votosConDetalles.filter(v => v.mensaje === 'PENDIENTE' && v.sentidoNumerico === 0).length,
    };

    // Crear PDF
    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });

    const fileName = `votacion-punto-${id}-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../storage/pdfs', fileName);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);

    // ===== DISEÑO DEL PDF =====

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold').text('REGISTRO DE VOTACIÓN', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    // Información del Evento
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Tipo: ${evento.tipoevento?.nombre || 'N/A'}`);
    doc.text(`Sede: ${evento.sede?.sede || 'N/A'}`);
    doc.text(`Fecha: ${evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A'}`);
    doc.moveDown(1);

    // Información del Punto
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL PUNTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Número: ${punto.nopunto || 'N/A'}`);
    doc.text(`Descripción: ${punto.punto || 'N/A'}`, { width: 500 });
    doc.moveDown(1);

    // Resumen de Votación
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE VOTACIÓN');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [130, 100, 100, 100];
    const rowHeight = 25;

    // Encabezados de tabla
    doc.fontSize(10).font('Helvetica-Bold');

    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#1e40af', '#000');
    doc.fillColor('#fff').text('A FAVOR', 55, tableTop + 8, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#dc2626', '#000');
    doc.fillColor('#fff').text('EN CONTRA', 50 + colWidths[0] + 5, tableTop + 8, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('ABSTENCIÓN', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 8, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 8, { width: colWidths[3] - 10, align: 'center' });

    // Valores de totales
    const valuesTop = tableTop + rowHeight;
    doc.fontSize(14).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.favor.toString(), 55, valuesTop + 5, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.contra.toString(), 50 + colWidths[0] + 5, valuesTop + 5, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.abstencion.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 5, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 5, { width: colWidths[3] - 10, align: 'center' });

    doc.moveDown(3);

    const totalVotos = votosConDetalles.length;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
    doc.text(`TOTAL DE DIPUTADOS: ${totalVotos}`, 50, doc.y, { align: 'left' });
    doc.moveDown(1.5);

    // ===== DETALLE DE VOTACIÓN SEGÚN TIPO DE EVENTO =====
    
    if (esSesion) {
      // ===== SESIÓN: Lista plana ordenada alfabéticamente =====
      generarDetalleSesion(doc, votosConDetalles);
    } else {
      // ===== COMISIÓN: Agrupado por comisión y ordenado por cargo =====
      generarDetalleComision(doc, votosConDetalles);
    }

    // Agregar pie de página
    const range = doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8).font('Helvetica').fillColor('#666');
      doc.text(
        `Página ${i + 1} de ${range.count} | Generado: ${new Date().toLocaleString('es-MX')}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

  } catch (error: any) {
    console.error("Error al generar PDF:", error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: "Error al generar PDF de votación",
        error: error.message 
      });
    }
  }
};

// ===== FUNCIÓN PARA SESIÓN =====
function generarDetalleSesion(doc: any, votos: any[]) {
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE VOTACIÓN', 50, doc.y, { align: 'left' });
  doc.moveDown(0.5);

  const votosPorSentido = {
    favor: votos.filter(v => v.sentidoNumerico === 1),
    contra: votos.filter(v => v.sentidoNumerico === 3),
    abstencion: votos.filter(v => v.sentidoNumerico === 2),
    pendiente: votos.filter(v => v.mensaje === 'PENDIENTE' && v.sentidoNumerico === 0),
  };

  const crearTablaSesion = (titulo: string, votosLista: any[], color: string) => {
    if (votosLista.length === 0) return;

    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fontSize(11).font('Helvetica-Bold').fillColor(color);
    doc.text(`${titulo} (${votosLista.length})`, 50, doc.y, { align: 'left' });
    doc.moveDown(0.5);

    const startY = doc.y;
    const colX = { no: 50, diputado: 80, partido: 400 };

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(colX.no, startY, 470, 20).fillAndStroke(color, '#000');
    doc.fillColor('#fff');
    doc.text('No.', colX.no + 5, startY + 6, { width: 20 });
    doc.text('DIPUTADO', colX.diputado + 5, startY + 6, { width: 310 });
    doc.text('PARTIDO', colX.partido + 5, startY + 6, { width: 110 });

    let currentY = startY + 20;

    const votosOrdenados = [...votosLista].sort((a, b) => 
      a.diputado.localeCompare(b.diputado, 'es')
    );

    votosOrdenados.forEach((voto, index) => {
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.rect(colX.no, currentY, 470, 20).fillAndStroke(color, '#000');
        doc.fillColor('#fff');
        doc.text('No.', colX.no + 5, currentY + 6, { width: 20 });
        doc.text('DIPUTADO', colX.diputado + 5, currentY + 6, { width: 310 });
        doc.text('PARTIDO', colX.partido + 5, currentY + 6, { width: 110 });
        currentY += 20;
      }

      doc.rect(colX.no, currentY, 470, 18).stroke('#d1d5db');

      doc.fontSize(8).font('Helvetica').fillColor('#000');
      doc.text(`${index + 1}`, colX.no + 5, currentY + 5, { width: 20 });
      doc.text(voto.diputado, colX.diputado + 5, currentY + 5, { width: 310 });
      doc.text(voto.partido, colX.partido + 5, currentY + 5, { width: 110 });

      currentY += 18;
    });

    doc.moveDown(1.5);
  };

  crearTablaSesion('A FAVOR', votosPorSentido.favor, '#1e40af');
  crearTablaSesion('EN CONTRA', votosPorSentido.contra, '#dc2626');
  crearTablaSesion('ABSTENCIÓN', votosPorSentido.abstencion, '#f59e0b');
  crearTablaSesion('PENDIENTE', votosPorSentido.pendiente, '#6b7280');
}

// ===== FUNCIÓN PARA COMISIÓN =====
function generarDetalleComision(doc: any, votos: any[]) {
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE VOTACIÓN POR COMISIÓN', 50, doc.y, { align: 'left' });
  doc.moveDown(0.5);

  // Agrupar por comisión
  const votosPorComision = votos.reduce((grupos, voto) => {
    const comision = voto.comision_nombre || 'Sin comisión';
    if (!grupos[comision]) {
      grupos[comision] = {
        nombre: comision,
        importancia: voto.comision_importancia,
        votos: []
      };
    }
    grupos[comision].votos.push(voto);
    return grupos;
  }, {} as Record<string, any>);

  // Ordenar comisiones por importancia
  const comisionesOrdenadas = Object.values(votosPorComision).sort((a: any, b: any) => 
    a.importancia - b.importancia
  );

  comisionesOrdenadas.forEach((comision: any) => {
    if (doc.y > 650) {
      doc.addPage();
    }

    // Título de la comisión
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb');
    doc.text(`${comision.nombre.toUpperCase()}`, 50, doc.y, { align: 'left' });
    doc.moveDown(0.5);

    // Ordenar votos por nivel de cargo
    const votosOrdenados = [...comision.votos].sort((a, b) => a.nivel_cargo - b.nivel_cargo);

    const votosPorSentido = {
      favor: votosOrdenados.filter(v => v.sentidoNumerico === 1),
      contra: votosOrdenados.filter(v => v.sentidoNumerico === 3),
      abstencion: votosOrdenados.filter(v => v.sentidoNumerico === 2),
      pendiente: votosOrdenados.filter(v => v.mensaje === 'PENDIENTE' && v.sentidoNumerico === 0),
    };

    const crearTablaComision = (titulo: string, votosLista: any[], color: string) => {
      if (votosLista.length === 0) return;

      if (doc.y > 650) {
        doc.addPage();
      }

      doc.fontSize(10).font('Helvetica-Bold').fillColor(color);
      doc.text(`  ${titulo} (${votosLista.length})`, 50, doc.y, { align: 'left' });
      doc.moveDown(0.3);

      const startY = doc.y;
      const colX = { no: 50, diputado: 80, cargo: 300, partido: 420 };

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
      doc.rect(colX.no, startY, 470, 20).fillAndStroke(color, '#000');
      doc.fillColor('#fff');
      doc.text('No.', colX.no + 5, startY + 6, { width: 20 });
      doc.text('DIPUTADO', colX.diputado + 5, startY + 6, { width: 210 });
      doc.text('CARGO', colX.cargo + 5, startY + 6, { width: 110 });
      doc.text('PARTIDO', colX.partido + 5, startY + 6, { width: 90 });

      let currentY = startY + 20;

      votosLista.forEach((voto, index) => {
        if (currentY > 720) {
          doc.addPage();
          currentY = 50;
          
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
          doc.rect(colX.no, currentY, 470, 20).fillAndStroke(color, '#000');
          doc.fillColor('#fff');
          doc.text('No.', colX.no + 5, currentY + 6, { width: 20 });
          doc.text('DIPUTADO', colX.diputado + 5, currentY + 6, { width: 210 });
          doc.text('CARGO', colX.cargo + 5, currentY + 6, { width: 110 });
          doc.text('PARTIDO', colX.partido + 5, currentY + 6, { width: 90 });
          currentY += 20;
        }

        doc.rect(colX.no, currentY, 470, 18).stroke('#d1d5db');

        doc.fontSize(8).font('Helvetica').fillColor('#000');
        doc.text(`${index + 1}`, colX.no + 5, currentY + 5, { width: 20 });
        doc.text(voto.diputado, colX.diputado + 5, currentY + 5, { width: 210 });
        doc.text(voto.cargo || 'Sin cargo', colX.cargo + 5, currentY + 5, { width: 110 });
        doc.text(voto.partido, colX.partido + 5, currentY + 5, { width: 90 });

        currentY += 18;
      });

      doc.moveDown(0.8);
    };

    crearTablaComision('A FAVOR', votosPorSentido.favor, '#1e40af');
    crearTablaComision('EN CONTRA', votosPorSentido.contra, '#dc2626');
    crearTablaComision('ABSTENCIÓN', votosPorSentido.abstencion, '#f59e0b');
    crearTablaComision('PENDIENTE', votosPorSentido.pendiente, '#6b7280');

    doc.moveDown(1);
  });
}

export const gestionIntegrantes = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const evento = await Agenda.findOne({
      where: { id },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const esSesion = evento.tipoevento?.nombre === "Sesión";

    let cargos: any[] = [];
    let comisiones: any[] = [];

    if (!esSesion) {
      const anfitriones = await AnfitrionAgenda.findAll({
        where: { agenda_id: evento.id },
        attributes: ["autor_id"],
        raw: true
      });

      const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);

      if (comisionIds.length > 0) {
        comisiones = await Comision.findAll({
          where: { id: comisionIds }, 
          attributes: ['id', 'nombre'],
          raw: true,
        });
      }

      cargos = await TipoCargoComision.findAll({
        attributes: ['id', 'valor', 'nivel'],
        order: [['nivel', 'ASC']], 
        raw: true,
      });
    }

    const partidos = await Partidos.findAll({
      attributes: ['id', 'siglas'],
      raw: true,
    });

    const legislatura = await Legislatura.findOne({
      order: [["fecha_inicio", "DESC"]],
    });

    let diputadosArray: { id: string; nombre: string }[] = [];

    if (legislatura) {
      const diputados = await IntegranteLegislatura.findAll({
        where: { legislatura_id: legislatura.id },
        paranoid: false, 
        include: [
          {
            model: Diputado,
            as: "diputado",
            paranoid: false, 
            attributes: ["id", "nombres", "apaterno", "amaterno"],
          },
        ],
      });

      diputadosArray = diputados
        .filter(d => d.diputado)
        .map(d => ({
          id: d.diputado.id,
          nombre: `${d.diputado.nombres ?? ""} ${d.diputado.apaterno ?? ""} ${d.diputado.amaterno ?? ""}`.trim(),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)); 
    }

    console.log(diputadosArray.length); 

    return res.json({
      diputados: diputadosArray,
      partidos: partidos,
      cargos: cargos,
      comisiones: comisiones,
      esSesion: esSesion 
    });

  } catch (error) {
    console.error("Error en gestionIntegrantes:", error);
    return res.status(500).json({ 
      msg: "Error al obtener integrantes",
      error: (error as Error).message 
    });
  }
};

export const addDipLista = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    const mensaje = "PENDIENTE";
    const timestamp = new Date();

    const asistencia = await AsistenciaVoto.create({
      sentido_voto: 0,
      mensaje,
      timestamp,
      id_diputado: body.id_diputado,
      partido_dip: body.id_partido,
      comision_dip_id: body.comision_dip_id,
      id_agenda: body.id_agenda,
      id_cargo_dip: body.id_cargo_dip 
    });

    return res.json({
      msg: "Diputado agregado correctamente",
      estatus: 200,
    });

  } catch (error) {
    console.error("Error en guardar el nuevo diputado :", error);
    return res.status(500).json({ 
      msg: "Error en guardar el nuevo diputado",
      error: (error as Error).message 
    });
  }
};

export const Eliminarlista = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const integrante = await AsistenciaVoto.findOne({
      where: { id }
    });

    if (!integrante) {
      return res.status(404).json({
        msg: "El diputado no existe en la lista",
        estatus: 404
      });
    }
    await integrante.destroy();
    return res.json({
      msg: "Diputado eliminado de la lista correctamente",
      estatus: 200
    });

  } catch (error) {
    console.error("Error en Eliminarlista:", error);
    return res.status(500).json({
      msg: "Error al eliminar integrante",
      error: (error as Error).message
    });
  }
};


export const enviarWhatsVotacionPDF = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const punto = await PuntosOrden.findOne({ where: { id } });
    if (!punto) {
      return res.status(404).json({ msg: "Punto no encontrado" });
    }

    const evento = await Agenda.findOne({
      where: { id: punto.id_evento },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const esSesion = evento.tipoevento?.nombre === "Sesión";

    let temavotos = await TemasPuntosVotos.findOne({ where: { id_punto: id } });
    if (!temavotos) {
      return res.status(404).json({ msg: "No hay votaciones para este punto" });
    }

    const votosRaw = await VotosPunto.findAll({
      where: { id_tema_punto_voto: temavotos.id },
      raw: true,
    });

    if (votosRaw.length === 0) {
      return res.status(404).json({ msg: "No hay votos registrados" });
    }


    // Obtener diputados
    const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
    const diputados = await Diputado.findAll({
      where: { id: diputadoIds },
      attributes: ["id", "apaterno", "amaterno", "nombres"],
      raw: true,
    });
    const diputadosMap = new Map(diputados.map(d => [d.id, d]));

    // Obtener partidos
    const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
    const partidos = await Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true,
    });
    const partidosMap = new Map(partidos.map(p => [p.id, p]));

    // Obtener comisiones y cargos (solo si es comisión)
    let comisionesMap = new Map();
    let cargosMap = new Map();
    
    if (!esSesion) {
      const comisionIds = votosRaw.map(v => v.id_comision_dip).filter(Boolean);
      if (comisionIds.length > 0) {
        const comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["id", "nombre", "importancia"],
          raw: true,
        });
        comisionesMap = new Map(comisiones.map(c => [c.id, c]));
      }

      const cargoIds = votosRaw.map(v => v.id_cargo_dip).filter(Boolean);
      if (cargoIds.length > 0) {
        const cargos = await TipoCargoComision.findAll({
          where: { id: cargoIds },
          attributes: ["id", "valor", "nivel"],
          raw: true,
        });
        cargosMap = new Map(cargos.map(c => [c.id, c]));
      }
    }

    const getSentidoTexto = (sentido: number): string => {
      switch (sentido) {
        case 1: return "A FAVOR";
        case 2: return "ABSTENCIÓN";
        case 3: return "EN CONTRA";
        case 0: return "PENDIENTE";
        default: return "PENDIENTE";
      }
    };

    // Mapear votos con detalles
    const votosConDetalles = votosRaw.map((voto) => {
      const diputado = diputadosMap.get(voto.id_diputado);
      const partido = partidosMap.get(voto.id_partido);
      const comision = comisionesMap.get(voto.id_comision_dip);
      const cargo = cargosMap.get(voto.id_cargo_dip);
      
      const nombreCompletoDiputado = diputado
        ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
        : "Sin nombre";
      
      return {
        ...voto,
        diputado: nombreCompletoDiputado,
        partido: partido?.siglas || "Sin partido",
        comision_nombre: comision?.nombre || null,
        comision_importancia: comision?.importancia || 999,
        cargo: cargo?.nombre || null,
        nivel_cargo: cargo?.nivel || 999,
        sentidoTexto: getSentidoTexto(voto.sentido),
        sentidoNumerico: voto.sentido
      };
    });

    // Calcular totales
    const totales = {
      favor: votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
      contra: votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
      abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
      pendiente: votosConDetalles.filter(v => v.mensaje === 'PENDIENTE' && v.sentidoNumerico === 0).length,
    };

    // Crear PDF
    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });

    const fileName = `votacion-punto-${id}-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../storage/pdfs', fileName);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // ===== DISEÑO DEL PDF =====

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold').text('REGISTRO DE VOTACIÓN', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    // Información del Evento
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Tipo: ${evento.tipoevento?.nombre || 'N/A'}`);
    doc.text(`Sede: ${evento.sede?.sede || 'N/A'}`);
    doc.text(`Fecha: ${evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A'}`);
    doc.moveDown(1);

    // Información del Punto
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL PUNTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Número: ${punto.nopunto || 'N/A'}`);
    doc.text(`Descripción: ${punto.punto || 'N/A'}`, { width: 500 });
    doc.moveDown(1);

    // Resumen de Votación
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE VOTACIÓN');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [130, 100, 100, 100];
    const rowHeight = 25;

    // Encabezados de tabla
    doc.fontSize(10).font('Helvetica-Bold');

    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#1e40af', '#000');
    doc.fillColor('#fff').text('A FAVOR', 55, tableTop + 8, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#dc2626', '#000');
    doc.fillColor('#fff').text('EN CONTRA', 50 + colWidths[0] + 5, tableTop + 8, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('ABSTENCIÓN', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 8, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 8, { width: colWidths[3] - 10, align: 'center' });

    // Valores de totales
    const valuesTop = tableTop + rowHeight;
    doc.fontSize(14).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.favor.toString(), 55, valuesTop + 5, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.contra.toString(), 50 + colWidths[0] + 5, valuesTop + 5, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.abstencion.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 5, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 5, { width: colWidths[3] - 10, align: 'center' });

    doc.moveDown(3);

    const totalVotos = votosConDetalles.length;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
    doc.text(`TOTAL DE DIPUTADOS: ${totalVotos}`, 50, doc.y, { align: 'left' });
    doc.moveDown(1.5);

    // Detalle de votación según tipo
    if (esSesion) {
      generarDetalleSesion(doc, votosConDetalles);
    } else {
      generarDetalleComision(doc, votosConDetalles);
    }

    // Agregar pie de página
    const range = doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8).font('Helvetica').fillColor('#666');
      doc.text(
        `Página ${i + 1} de ${range.count} | Generado: ${new Date().toLocaleString('es-MX')}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();

    // Esperar a que el PDF se genere completamente
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log('PDF generado exitosamente en:', outputPath);

    // ===== ENVIAR POR WHATSAPP CON BASE64 =====

    // Preparar mensaje de texto
    let fechaFormateada = "";
    if (evento.fecha) {
      fechaFormateada = format(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
    }

    const mensajeTexto = `*VOTACION - Punto ${punto.nopunto}*\n\n` +
      `*Punto:* ${punto.punto || 'N/A'}\n` +
      `*Evento:* ${evento.tipoevento?.nombre || 'N/A'}\n` +
      `*Fecha:* ${fechaFormateada}\n\n` +
      `*Resultados:*\n` +
      `A favor: ${totales.favor}\n` +
      `En contra: ${totales.contra}\n` +
      `Abstencion: ${totales.abstencion}\n` +
      `Pendiente: ${totales.pendiente}\n\n` +
      `Adjunto PDF con detalle completo`;

    // Verificar que el archivo existe
    if (!fs.existsSync(outputPath)) {
      throw new Error('El archivo PDF no se generó correctamente');
    }

    // Leer el archivo y convertirlo a base64
    const pdfBuffer = fs.readFileSync(outputPath);
    const base64PDF = pdfBuffer.toString('base64');

    console.log('Tamaño del PDF:', pdfBuffer.length, 'bytes');
    console.log('Enviando PDF por WhatsApp...');

    // Enviar documento usando base64
    const params = {
      token: 'ml56a7d6tn7ha7cc',
      to: '+527222035605',
      filename: fileName,
      document: base64PDF,
      caption: mensajeTexto
    };

    const whatsappResponse = await axios.post(
      'https://api.ultramsg.com/instance144598/messages/document',
      new URLSearchParams(params),
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('Respuesta de WhatsApp API:', whatsappResponse.data);

    return res.status(200).json({
      message: "PDF de votación generado y enviado por WhatsApp correctamente",
      enviado: true,
      archivo: fileName,
      totales,
      whatsappResponse: whatsappResponse.data
    });

  } catch (error: any) {
    console.error("Error completo:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("Error de Axios:", {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
    }
    
    return res.status(500).json({ 
      message: "Error al generar y enviar PDF de votación por WhatsApp",
      error: error.message,
      details: axios.isAxiosError(error) ? error.response?.data : undefined
    });
  }
};

export const generarPDFAsistencia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; 
    
    const evento = await Agenda.findOne({
      where: { id },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const esSesion = evento.tipoevento?.nombre === "Sesión";

    const asistenciasRaw = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      raw: true,
    });

    if (asistenciasRaw.length === 0) {
      return res.status(404).json({ msg: "No hay asistencias registradas para este evento" });
    }

    // Obtener diputados
    const diputadoIds = asistenciasRaw.map(a => a.id_diputado).filter(Boolean);
    const diputados = await Diputado.findAll({
      where: { id: diputadoIds },
      attributes: ["id", "apaterno", "amaterno", "nombres"],
      raw: true,
    });
    const diputadosMap = new Map(diputados.map(d => [d.id, d]));

    // Obtener partidos
    const partidoIds = asistenciasRaw.map(a => a.partido_dip).filter(Boolean);
    const partidos = await Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true,
    });
    const partidosMap = new Map(partidos.map(p => [p.id, p]));

    let comisionesMap = new Map();
    let cargosMap = new Map();
    
    if (!esSesion) {
      const comisionIds = asistenciasRaw.map(a => a.comision_dip_id).filter(Boolean);
      if (comisionIds.length > 0) {
        const comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["id", "nombre", "importancia"],
          raw: true,
        });
        comisionesMap = new Map(comisiones.map(c => [c.id, c]));
      }

      const cargoIds = asistenciasRaw.map(a => a.id_cargo_dip).filter(Boolean);
      if (cargoIds.length > 0) {
        const cargos = await TipoCargoComision.findAll({
          where: { id: cargoIds },
          attributes: ["id", "valor", "nivel"],
          raw: true,
        });
        cargosMap = new Map(cargos.map(c => [c.id, c]));
      }
    }

    const getAsistenciaTexto = (sentido: number): string => {
      switch (sentido) {
        case 1: return "ASISTENCIA";
        case 2: return "ASISTENCIA ZOOM";
        case 0: return "PENDIENTE";
        default: return "PENDIENTE";
      }
    };

    // Mapear asistencias con detalles
    const asistenciasConDetalles = asistenciasRaw.map((asistencia) => {
      const diputado = diputadosMap.get(asistencia.id_diputado);
      const partido = partidosMap.get(asistencia.partido_dip);
      const comision = comisionesMap.get(asistencia.comision_dip_id);
      const cargo = cargosMap.get(asistencia.id_cargo_dip);
      
      const nombreCompletoDiputado = diputado
        ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
        : "Sin nombre";
      
      return {
        ...asistencia,
        diputado: nombreCompletoDiputado,
        partido: partido?.siglas || "Sin partido",
        comision_nombre: comision?.nombre || null,
        comision_importancia: comision?.importancia || 999,
        cargo_nombre: cargo?.valor || null,
        nivel_cargo: cargo?.nivel || 999,
        asistenciaTexto: getAsistenciaTexto(asistencia.sentido_voto),
        asistenciaNumerico: asistencia.sentido_voto
      };
    });

    // Calcular totales
    const totales = {
      asistencia: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 1).length,
      asistenciaZoom: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 2).length,
      pendiente: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 0).length,
    };

    // Crear PDF
    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });

    const fileName = `asistencia-evento-${id}-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../storage/pdfs', fileName);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);

    // ===== DISEÑO DEL PDF =====

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    // Información del Evento
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Tipo: ${evento.tipoevento?.nombre || 'N/A'}`);
    doc.text(`Sede: ${evento.sede?.sede || 'N/A'}`);
    doc.text(`Fecha: ${evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A'}`);
    doc.text(`Descripción: ${evento.descripcion || 'N/A'}`, { width: 500 });
    doc.moveDown(1);

    // Resumen de Asistencia
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE ASISTENCIA');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [170, 170, 140];
    const rowHeight = 25;

    // Encabezados de tabla
    doc.fontSize(9).font('Helvetica-Bold');

    // ASISTENCIA - Verde
    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
    doc.fillColor('#fff').text('ASISTENCIA', 55, tableTop + 8, { width: colWidths[0] - 10, align: 'center' });

    // ASISTENCIA ZOOM - Azul
    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#3b82f6', '#000');
    doc.fillColor('#fff').text('ASISTENCIA ZOOM', 50 + colWidths[0] + 5, tableTop + 8, { width: colWidths[1] - 10, align: 'center' });

    // PENDIENTE - Amarillo
    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 8, { width: colWidths[2] - 10, align: 'center' });

    // Valores de totales
    const valuesTop = tableTop + rowHeight;
    doc.fontSize(14).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistencia.toString(), 55, valuesTop + 5, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistenciaZoom.toString(), 50 + colWidths[0] + 5, valuesTop + 5, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 5, { width: colWidths[2] - 10, align: 'center' });

    doc.moveDown(3);

    const totalDiputados = asistenciasConDetalles.length;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
    doc.text(`TOTAL DE DIPUTADOS: ${totalDiputados}`, 50, doc.y, { align: 'left' });
    doc.moveDown(1.5);

    // ===== DETALLE DE ASISTENCIA SEGÚN TIPO DE EVENTO =====
    
    if (esSesion) {
      generarDetalleSesionAsistencia(doc, asistenciasConDetalles);
    } else {
      generarDetalleComisionAsistencia(doc, asistenciasConDetalles);
    }

    // Agregar pie de página
    const range = doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8).font('Helvetica').fillColor('#666');
      doc.text(
        `Página ${i + 1} de ${range.count} | Generado: ${new Date().toLocaleString('es-MX')}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

  } catch (error: any) {
    console.error("Error al generar PDF de asistencia:", error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: "Error al generar PDF de asistencia",
        error: error.message 
      });
    }
  }
};

function generarDetalleSesionAsistencia(doc: any, asistencias: any[]) {
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE ASISTENCIA');
  doc.moveDown(0.5);

  const asistenciasOrdenadas = [...asistencias].sort((a, b) => 
    a.diputado.localeCompare(b.diputado)
  );

  const startY = doc.y;
  const colX = {
    numero: 50,
    diputado: 80,
    partido: 380,
    asistencia: 450
  };

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
  doc.text('#', colX.numero, startY);
  doc.text('DIPUTADO', colX.diputado, startY);
  doc.text('PARTIDO', colX.partido, startY);
  doc.text('ASISTENCIA', colX.asistencia, startY);
  
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.3);

  doc.fontSize(9).font('Helvetica');
  
  asistenciasOrdenadas.forEach((asist, index) => {
    const currentY = doc.y;

    if (currentY > 700) {
      doc.addPage();
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
      doc.text('#', colX.numero, doc.y);
      doc.text('DIPUTADO', colX.diputado, doc.y);
      doc.text('PARTIDO', colX.partido, doc.y);
      doc.text('ASISTENCIA', colX.asistencia, doc.y);
      
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);
      
      doc.fontSize(9).font('Helvetica');
    }

    const rowY = doc.y;

    doc.fillColor('#000').text((index + 1).toString(), colX.numero, rowY, { width: 25 });
    doc.fillColor('#000').text(asist.diputado, colX.diputado, rowY, { width: 290 });
    doc.fillColor('#000').text(asist.partido, colX.partido, rowY, { width: 60 });
    
    const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
    doc.fillColor(colorAsistencia).text(asist.asistenciaTexto, colX.asistencia, rowY, { width: 90 });

    doc.moveDown(0.8);
  });
}

function generarDetalleComisionAsistencia(doc: any, asistencias: any[]) {
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE ASISTENCIA POR COMISIÓN');
  doc.moveDown(0.5);

  const asistenciasPorComision = asistencias.reduce((acc, asist) => {
    const comisionKey = asist.comision_nombre || 'Sin Comisión';
    if (!acc[comisionKey]) {
      acc[comisionKey] = {
        nombre: comisionKey,
        importancia: asist.comision_importancia || 999,
        asistencias: []
      };
    }
    acc[comisionKey].asistencias.push(asist);
    return acc;
  }, {} as Record<string, any>);

  const comisionesOrdenadas = Object.values(asistenciasPorComision).sort(
    (a: any, b: any) => a.importancia - b.importancia
  );

  comisionesOrdenadas.forEach((comision: any) => {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text(comision.nombre.toUpperCase(), 50, doc.y);
    doc.moveDown(0.3);

    const asistenciasOrdenadas = [...comision.asistencias].sort(
      (a: any, b: any) => a.nivel_cargo - b.nivel_cargo
    );

    const colX = {
      numero: 50,
      cargo: 80,
      diputado: 180,
      partido: 400,
      asistencia: 470
    };

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
    doc.text('#', colX.numero, doc.y);
    doc.text('CARGO', colX.cargo, doc.y);
    doc.text('DIPUTADO', colX.diputado, doc.y);
    doc.text('PARTIDO', colX.partido, doc.y);
    doc.text('ASISTENCIA', colX.asistencia, doc.y);
    
    doc.moveDown(0.2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.2);

    doc.fontSize(8).font('Helvetica');

    asistenciasOrdenadas.forEach((asist: any, index: number) => {
      const currentY = doc.y;

      if (currentY > 700) {
        doc.addPage();
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af');
        doc.text(`${comision.nombre.toUpperCase()} (continuación)`, 50, doc.y);
        doc.moveDown(0.3);
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
        doc.text('#', colX.numero, doc.y);
        doc.text('CARGO', colX.cargo, doc.y);
        doc.text('DIPUTADO', colX.diputado, doc.y);
        doc.text('PARTIDO', colX.partido, doc.y);
        doc.text('ASISTENCIA', colX.asistencia, doc.y);
        
        doc.moveDown(0.2);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.2);
        
        doc.fontSize(8).font('Helvetica');
      }

      const rowY = doc.y;

      doc.fillColor('#000').text((index + 1).toString(), colX.numero, rowY, { width: 25 });
      doc.fillColor('#000').text(asist.cargo_nombre || 'N/A', colX.cargo, rowY, { width: 90 });
      doc.fillColor('#000').text(asist.diputado, colX.diputado, rowY, { width: 210 });
      doc.fillColor('#000').text(asist.partido, colX.partido, rowY, { width: 60 });
      
      const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
      doc.fillColor(colorAsistencia).text(asist.asistenciaTexto, colX.asistencia, rowY, { width: 80 });

      doc.moveDown(0.7);
    });

    doc.moveDown(0.5);
  });
}

function getColorAsistencia(asistencia: number): string {
  switch (asistencia) {
    case 1: return '#22c55e'; // Verde - ASISTENCIA
    case 2: return '#3b82f6'; // Azul - ASISTENCIA ZOOM
    case 0: return '#f59e0b'; // Amarillo - PENDIENTE
    default: return '#f59e0b';
  }
}

// ===== FUNCIÓN PARA ENVIAR POR WHATSAPP =====

export const enviarWhatsAsistenciaPDF = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const evento = await Agenda.findOne({
      where: { id },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const esSesion = evento.tipoevento?.nombre === "Sesión";

    const asistenciasRaw = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      raw: true,
    });

    if (asistenciasRaw.length === 0) {
      return res.status(404).json({ msg: "No hay asistencias registradas para este evento" });
    }

    const diputadoIds = asistenciasRaw.map(a => a.id_diputado).filter(Boolean);
    const diputados = await Diputado.findAll({
      where: { id: diputadoIds },
      attributes: ["id", "apaterno", "amaterno", "nombres"],
      raw: true,
    });
    const diputadosMap = new Map(diputados.map(d => [d.id, d]));

    const partidoIds = asistenciasRaw.map(a => a.partido_dip).filter(Boolean);
    const partidos = await Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true,
    });
    const partidosMap = new Map(partidos.map(p => [p.id, p]));

    let comisionesMap = new Map();
    let cargosMap = new Map();
    
    if (!esSesion) {
      const comisionIds = asistenciasRaw.map(a => a.comision_dip_id).filter(Boolean);
      if (comisionIds.length > 0) {
        const comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["id", "nombre", "importancia"],
          raw: true,
        });
        comisionesMap = new Map(comisiones.map(c => [c.id, c]));
      }

      const cargoIds = asistenciasRaw.map(a => a.id_cargo_dip).filter(Boolean);
      if (cargoIds.length > 0) {
        const cargos = await TipoCargoComision.findAll({
          where: { id: cargoIds },
          attributes: ["id", "valor", "nivel"],
          raw: true,
        });
        cargosMap = new Map(cargos.map(c => [c.id, c]));
      }
    }

    const getAsistenciaTexto = (sentido: number): string => {
      switch (sentido) {
        case 1: return "ASISTENCIA";
        case 2: return "ASISTENCIA ZOOM";
        case 0: return "PENDIENTE";
        default: return "PENDIENTE";
      }
    };

    const asistenciasConDetalles = asistenciasRaw.map((asistencia) => {
      const diputado = diputadosMap.get(asistencia.id_diputado);
      const partido = partidosMap.get(asistencia.partido_dip);
      const comision = comisionesMap.get(asistencia.comision_dip_id);
      const cargo = cargosMap.get(asistencia.id_cargo_dip);
      
      const nombreCompletoDiputado = diputado
        ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
        : "Sin nombre";
      
      return {
        ...asistencia,
        diputado: nombreCompletoDiputado,
        partido: partido?.siglas || "Sin partido",
        comision_nombre: comision?.nombre || null,
        comision_importancia: comision?.importancia || 999,
        cargo_nombre: cargo?.valor || null,
        nivel_cargo: cargo?.nivel || 999,
        asistenciaTexto: getAsistenciaTexto(asistencia.sentido_voto),
        asistenciaNumerico: asistencia.sentido_voto
      };
    });

    const totales = {
      asistencia: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 1).length,
      asistenciaZoom: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 2).length,
      pendiente: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 0).length,
    };

    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });

    const fileName = `asistencia-evento-${id}-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../storage/pdfs', fileName);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // ===== DISEÑO DEL PDF =====

    doc.fontSize(18).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Tipo: ${evento.tipoevento?.nombre || 'N/A'}`);
    doc.text(`Sede: ${evento.sede?.sede || 'N/A'}`);
    doc.text(`Fecha: ${evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A'}`);
    doc.text(`Descripción: ${evento.descripcion || 'N/A'}`, { width: 500 });
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE ASISTENCIA');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [170, 170, 140];
    const rowHeight = 25;

    doc.fontSize(9).font('Helvetica-Bold');

    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
    doc.fillColor('#fff').text('ASISTENCIA', 55, tableTop + 8, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#3b82f6', '#000');
    doc.fillColor('#fff').text('ASISTENCIA ZOOM', 50 + colWidths[0] + 5, tableTop + 8, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 8, { width: colWidths[2] - 10, align: 'center' });

    const valuesTop = tableTop + rowHeight;
    doc.fontSize(14).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistencia.toString(), 55, valuesTop + 5, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistenciaZoom.toString(), 50 + colWidths[0] + 5, valuesTop + 5, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 5, { width: colWidths[2] - 10, align: 'center' });

    doc.moveDown(3);

    const totalDiputados = asistenciasConDetalles.length;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
    doc.text(`TOTAL DE DIPUTADOS: ${totalDiputados}`, 50, doc.y, { align: 'left' });
    doc.moveDown(1.5);

    if (esSesion) {
      generarDetalleSesionAsistencia(doc, asistenciasConDetalles);
    } else {
      generarDetalleComisionAsistencia(doc, asistenciasConDetalles);
    }

    const range = doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8).font('Helvetica').fillColor('#666');
      doc.text(
        `Página ${i + 1} de ${range.count} | Generado: ${new Date().toLocaleString('es-MX')}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log('PDF de asistencia generado exitosamente en:', outputPath);

    // ===== ENVIAR POR WHATSAPP =====

    let fechaFormateada = "";
    if (evento.fecha) {
      fechaFormateada = format(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
    }

    const mensajeTexto = `*ASISTENCIA - ${evento.tipoevento?.nombre || 'Evento'}*\n\n` +
      `*Descripcion:* ${evento.descripcion || 'N/A'}\n` +
      `*Sede:* ${evento.sede?.sede || 'N/A'}\n` +
      `*Fecha:* ${fechaFormateada}\n\n` +
      `*Resumen:*\n` +
      `Asistencia: ${totales.asistencia}\n` +
      `Asistencia Zoom: ${totales.asistenciaZoom}\n` +
      `Pendiente: ${totales.pendiente}\n\n` +
      `Total de diputados: ${totalDiputados}\n\n` +
      `Adjunto PDF con detalle completo`;

    if (!fs.existsSync(outputPath)) {
      throw new Error('El archivo PDF no se generó correctamente');
    }

    const pdfBuffer = fs.readFileSync(outputPath);
    const base64PDF = pdfBuffer.toString('base64');

    console.log('Tamaño del PDF:', pdfBuffer.length, 'bytes');
    console.log('Enviando PDF por WhatsApp...');

    const params = {
      token: 'ml56a7d6tn7ha7cc',
      to: '+527222035605',
      filename: fileName,
      document: base64PDF,
      caption: mensajeTexto
    };

    const whatsappResponse = await axios.post(
      'https://api.ultramsg.com/instance144598/messages/document',
      new URLSearchParams(params),
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('Respuesta de WhatsApp API:', whatsappResponse.data);

    return res.status(200).json({
      message: "PDF de asistencia generado y enviado por WhatsApp correctamente",
      enviado: true,
      archivo: fileName,
      totales,
      whatsappResponse: whatsappResponse.data
    });

  } catch (error: any) {
    console.error("Error completo al generar y enviar PDF de asistencia:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("Error de Axios:", {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
    }
    
    return res.status(500).json({ 
      message: "Error al generar y enviar PDF de asistencia por WhatsApp",
      error: error.message,
      details: axios.isAxiosError(error) ? error.response?.data : undefined
    });
  }
};