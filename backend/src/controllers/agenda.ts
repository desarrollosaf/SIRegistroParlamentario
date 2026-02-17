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
import TipoAutor from "../models/tipo_autors";
import { comisiones, sedes } from "../models/init-models";
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
import TipoCargoComision from "../models/tipo_cargo_comisions";
import ExcelJS from 'exceljs';
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";





export const geteventos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    console.log(id)
    const uuidSesion = 'd5687f72-a328-4be1-a23c-4c3575092163';

    let whereTipoEvento;

    if (id === '1') {
      whereTipoEvento = { id: uuidSesion };
    } else if (id === '0') {
      whereTipoEvento = {
        id: {
          [Op.ne]: uuidSesion 
        }
      };
    } else {
      whereTipoEvento = {};
    }

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
            attributes: ["id", "nombre"],
            where: whereTipoEvento
          }
        ],
        order: [['fecha', 'DESC']]  
      }
    );


    const eventosConComisiones = [];

    for (const evento of eventos) {
      const anfitriones = await AnfitrionAgenda.findAll({
        where: { agenda_id: evento.id },
        attributes: ["autor_id"],
        raw: true
      });

      const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);

     let comisiones: any[] = [];


      let titulo: string = '';


      if (comisionIds.length > 0) {
        comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["id", "nombre"],
          raw: true
        });

        titulo = comisiones.map(c => c.nombre).join(", ");
      }


      eventosConComisiones.push({
        ...evento.toJSON(),
        comisiones,
        titulo
      });
    }

    return res.status(200).json({
      msg: "listoooo :v ",
      citas: eventosConComisiones
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
    
    // 3. Obtener título y puntos según tipo de evento
    let titulo = "";
    let puntos: any[] = []; // ✅ Declarar aquí, fuera del if/else
    
    if (esSesion) {
      titulo = evento.descripcion ?? "";
    } else {
      const anfitriones = await AnfitrionAgenda.findAll({
        where: { agenda_id: evento.id },
        attributes: ["autor_id"],
        raw: true
      });
      
      if (anfitriones.length > 0) { // ✅ Validar antes de continuar
        const puntosturnados = await PuntosComisiones.findAll({
          where: Sequelize.literal(
            `(${anfitriones.map(a => 
              `FIND_IN_SET('${a.autor_id}', REPLACE(REPLACE(id_comision, '[', ''), ']', ''))`
            ).join(' OR ')})`
          )
        });
        
        if (puntosturnados.length > 0) { // ✅ Validar antes de buscar puntos
          puntos = await PuntosOrden.findAll({
            where: { 
              id: puntosturnados.map(p => p.id_punto) 
            },
            attributes: ["id", "punto"],
            raw: true
          });
        }
        
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
    }
    
    // 4. Verificar si existen asistencias
    const asistenciasExistentes = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      order: [['created_at', 'DESC']],
      raw: true,
    });
    console.log(evento.fecha)
    
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
        tipoEvento,
        puntos
      });
    }
    
    // 6. Si SÍ existen asistencias, procesarlas
    const integrantes = await procesarAsistencias(asistenciasExistentes, esSesion);
    
    return res.status(200).json({
      msg: "Evento con asistencias existentes",
      evento,
      integrantes,
      titulo,
      tipoEvento, // ✅ Faltaba la coma aquí
      puntos
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
    const { Op } = require('sequelize');
    const fechaEvento = new Date(evento.fecha).toISOString().split('T')[0];
    if (!fechaEvento) {
      throw new Error('El evento no tiene fecha válida');
    }
    // Para sesiones: todos los diputados de la legislatura actual
    const legislatura = await Legislatura.findOne({
      order: [["fecha_inicio", "DESC"]],
    });

    if (legislatura) {
      const diputados = await IntegranteLegislatura.findAll({
          where: { 
            legislatura_id: legislatura.id,
            fecha_inicio: {
              [Op.lte]: fechaEvento // El diputado ya estaba en la legislatura
            },
            [Op.or]: [
              {
                fecha_fin: {
                  [Op.gte]: fechaEvento // Aún no había terminado su periodo
                }
              },
              {
                fecha_fin: null // O está activo (sin fecha fin)
              }
            ]
          },
          include: [
            { 
              model: Diputado, 
              as: "diputado",
              paranoid: false // Incluir diputados eliminados también
            }
          ],
          paranoid: false // Si también quieres incluir diputados eliminados
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
      raw: true,
      paranoid: false
    }),
    Partidos.findAll({
      where: { id: partidoIds },
      attributes: ["id", "siglas"],
      raw: true,
      paranoid: false
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
        
        const dictamenes = await PuntosOrden.findAll({
          where: { id_tipo: 6 },
          include: [
            {
              model: TemasPuntosVotos,
              as: 'temasVotos',
              include: [
                {
                  model: VotosPunto,
                  as: 'votospuntos',
                  where: { sentido: 1 },
                  required: false,
                }
              ],
              required: false
            }
          ]
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
            partidos:partidos,
            dictamenes: dictamenes

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
        
      }   else if (proponente.valor === 'Ayuntamientos') {
        const municipios = await MunicipiosAg.findAll();
        dtSlctTemp = municipios.map(l => ({
          id: `${proponente.id}/${l.id}`,
          id_original: l.id,
          valor: l.nombre,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'municipio'
        }));
        
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
      }else{
        const catalogo = await CatFunDep.findAll({
          where: {
            tipo: proponente.id,

          },
        });

        dtSlctTemp = catalogo.map(data => ({
          id: `${proponente.id}/${data.id}`,
          id_original: data.id,
          valor: data.nombre_titular,
          proponente_id: proponente.id,
          proponente_valor: proponente.valor,
          tipo: 'funcionario'
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
    
    console.log(body);
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

    const idPuntoTurnado = body.id_punto_turnado;
    let punto: string;

    if (idPuntoTurnado != 'null') {
      const data = await PuntosOrden.findOne({
        where: { id: idPuntoTurnado },
      });
      if (!data) {
        throw new Error('Punto turnado no encontrado');
      }
      punto = data.punto;
    } else {
      punto = body.punto;
    }

    const puntonuevo = await PuntosOrden.create({
      id_evento: evento!.id,
      nopunto: body.numpunto,
      id_tipo: body.tipo,
      tribuna: body.tribuna,
      path_doc: file ? `storage/puntos/${file.filename}` : null,
      punto,
      observaciones: body.observaciones,
      se_turna_comision: body.tipo_evento == 0 ? body.se_turna_comision:0,
    });


    if (idPuntoTurnado != 'null') {
      if(body.tipo_evento != 0){
        const puntoTurnado = await PuntosComisiones.findOne({
          where: { id_punto: idPuntoTurnado },
        });
        if (!puntoTurnado) {
          throw new Error('Relación de punto-comisión no encontrada');
        }
        await puntoTurnado.update({
          id_punto_turno: puntonuevo.id,
        });
      }else{
        await puntonuevo.update({
          id_dictamen: idPuntoTurnado,
        });
      }  
    }

    if (body.reservas) {
      const temasArray = typeof body.reservas === 'string' 
        ? JSON.parse(body.reservas) 
        : body.reservas;
      
      for (const item of temasArray) {
        await TemasPuntosVotos.create({
          id_punto: puntonuevo.id,
          id_evento: evento!.id,
          tema_votacion: item.descripcion,
          fecha_votacion: null,
        });
      }
    }

    if (body.iniciativas) {
      const IniciativasArray = typeof body.iniciativas === 'string' 
        ? JSON.parse(body.iniciativas) 
        : body.iniciativas;
      
      for (const item of IniciativasArray) {
        await IniciativaPuntoOrden.create({
          id_punto: puntonuevo.id,
          id_evento: evento!.id,
          tema_votacion: item.descripcion,
          fecha_votacion: null,
        });
      }
    }

    for (const item of presentaArray) {
      await PuntosPresenta.create({
        id_punto: puntonuevo.id,
        id_tipo_presenta: item.proponenteId,
        id_presenta: item.autorId 
      });
    }

    if(body.tipo_evento == 0){
      const comisionesString = `[${turnocomision.join(',')}]`;
      await PuntosComisiones.create({
        id_punto: puntonuevo.id,
        id_comision: comisionesString,
      });
    }

    // if(body.tipo_evento == 0){
    //   for (const item of turnocomision) {
    //     await PuntosComisiones.create({
    //       id_punto: puntonuevo.id,
    //       id_comision: item,
    //     });
    //   }
    // }
    


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

      const puntosRaw = await PuntosOrden.findAll({
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
          {
            model: PuntosComisiones,
            as: "turnocomision",
            attributes: ["id", "id_punto", "id_comision", "id_punto_turno"]
          },
          {
            model: PuntosComisiones,
            as: "puntoTurnoComision",
            attributes: ["id", "id_punto", "id_comision", "id_punto_turno"]
          },
          {
            model: TemasPuntosVotos,
            as: "reservas",
            attributes: ["id", "tema_votacion"]
          },
          {
            model: IniciativaPuntoOrden,
            as: "iniciativas",
            attributes: ["id", "iniciativa"]
          }
        ]
      });

      if (!puntosRaw) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      const puntos = puntosRaw.map(punto => {
        const data = punto.toJSON();
        
        const turnosNormalizados =
          data.turnocomision?.length
            ? data.turnocomision
            : data.puntoTurnoComision ?? [];
        
        delete data.puntoTurnoComision;
        
        // Expandir cada turno en múltiples registros según las comisiones
        const turnosExpandidos: any[] = [];
        
        turnosNormalizados.forEach((turno: any) => {
          if (turno.id_comision && typeof turno.id_comision === 'string') {
            // Convertir "[id1,id2,id3]" a ["id1", "id2", "id3"]
            const comisionesArray = turno.id_comision
              .replace(/[\[\]]/g, '')
              .split(',')
              .map((id: string) => id.trim())
              .filter((id: string) => id);
            
            // Crear un registro por cada comisión
            comisionesArray.forEach(comisionId => {
              turnosExpandidos.push({
                id: turno.id,
                id_punto: turno.id_punto,
                id_comision: comisionId,
                id_punto_turno: turno.id_punto_turno
              });
            });
          } else {
            // Si no tiene el formato string, mantener el original
            turnosExpandidos.push(turno);
          }
        });
        
        return {
          ...data,
          turnocomision: turnosExpandidos
        };
      });

      const selects = await IniciativaPuntoOrden.findAll({
        where: { 
          id_evento: id,
          id_punto: {
            [Op.or]: [
              null,
              '',
              '0'
            ]
          }
        },
        attributes: ["id", "iniciativa"]
      });
      return res.status(201).json({
        message: "Se encontraron registros",
        data: puntos,
        selectini: selects
      });


    } catch (error: any) {
      console.error("Error al guardar el punto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const crearreserva = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    const punto = await PuntosOrden.findOne({
      where: { id: body.punto },
    });
    
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    
    const nuevoTema = await TemasPuntosVotos.create({
      id_punto: punto.id,
      id_evento: punto.id_evento,
      tema_votacion: body.descripcion,
      fecha_votacion: null,
    });
    
    return res.status(200).json({ 
      message: "Reserva creada exitosamente",
    });
    
  } catch (error: any) {
    console.error("Error al crear la reserva:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const eliminarreserva = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const reserva = await TemasPuntosVotos.findOne({ 
      where: { id }
    });
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    await VotosPunto.destroy({
      where: { id_tema_punto_voto: id }
    });
    await reserva.destroy();
    return res.status(200).json({
      message: "Reserva eliminada correctamente",
    });  
  } catch (error: any) {
    console.error("Error al eliminar la reserva:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const getreservas = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const reserva = await TemasPuntosVotos.findAll({ 
      where: { id_punto: id },
      attributes: ["id", "tema_votacion"]
    });

    const iniciativa = await IniciativaPuntoOrden.findAll({ 
      where: { id_punto: id },
      attributes: ["id", "iniciativa"]
    });
    
    return res.status(200).json({
      data: {
        reservas: reserva,
        iniciativas: iniciativa
      }
    });  
  } catch (error: any) {
    console.error("Error al obtener las reserva:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};


export const actualizarPunto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { body } = req;
    const file = req.file;
    console.log(body);


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

    
    console.log(turnocomision);

    const punto = await PuntosOrden.findOne({ where: { id } });
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }

    const nuevoPath = file ? `storage/puntos/${file.filename}` : punto.path_doc;

    const idPuntoTurnado = body.id_punto_turnado;
    let puntoDesc: string;

    if (idPuntoTurnado != 'null') {
      const puntoTurnado = await PuntosComisiones.findOne({
        where: { id_punto_turno: punto.id },
      });

      if (puntoTurnado) {
        puntoTurnado.update({
          id_punto_turno: null
        })

      }

      const puntoTurnadoCreate = await PuntosOrden.findOne({
        where: { id: idPuntoTurnado },
      });
      if (!puntoTurnadoCreate || !puntoTurnadoCreate.punto) {
        throw new Error('No se encontró la descripción del punto turnado');
      }
      puntoDesc = puntoTurnadoCreate.punto;
      
    } else {
      const puntoTurnado = await PuntosComisiones.findOne({
        where: { id_punto_turno: punto.id },
      });
      if (puntoTurnado) {
        puntoTurnado.update({
          id_punto_turno: null
        })

      }
      puntoDesc = body.punto;
    }

    await punto.update({
      nopunto: body.numpunto ?? punto.nopunto,
      id_tipo: body.tipo ?? punto.id_tipo,
      tribuna: body.tribuna ?? punto.tribuna,
      path_doc: nuevoPath,
      punto: puntoDesc,
      observaciones: body.observaciones ?? punto.observaciones,
      editado: 1,
      se_turna_comision: body.tipo_evento == 0 ? body.se_turna_comision:0,
    });
    console.log("Holaaaaaaaaaaa", idPuntoTurnado)
    // if (idPuntoTurnado != 'null') {
    //   const puntoTurnado = await PuntosComisiones.findOne({
    //     where: { id_punto: idPuntoTurnado },
    //   });

    //   if (!puntoTurnado) {
    //     throw new Error('Relación de punto-comisión no encontrada');
    //   }

    //   await puntoTurnado.update({
    //     id_punto_turno: punto.id,
    //   });
    // }

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

    if(body.tipo_evento == 0){
      await PuntosComisiones.destroy({
        where: { id_punto: punto.id }
      });
      
      const comisionesString = `[${turnocomision.join(',')}]`;
      await PuntosComisiones.create({
        id_punto: punto.id,
        id_comision: comisionesString,
      });
   

      // for (const item of turnocomision) {
      //   await PuntosComisiones.create({
      //     id_punto: punto.id,
      //     id_comision: item,
      //   });
      // }

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
    const body = req.body;
    let tema: string | null;
    let puntoa: string | null;
    let votos;
    
    if(body.idPunto && body.idReserva) {
      tema = body.idReserva;
      puntoa = null;
      votos = await VotosPunto.findOne({ where: { id_tema_punto_voto: body.idReserva } });
    } else {
      tema = null;
      puntoa = body.idPunto;
      votos = await VotosPunto.findOne({ where: { id_punto: body.idPunto } });
    }
    
    console.log("tema:", tema, "punto:", puntoa);
    
    const punto = await PuntosOrden.findOne({ where: { id: body.idPunto } });
    
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
    const tipovento = esSesion ? 1 : 2;
    
    let mensajeRespuesta = "Punto con votos existentes";
    
    if (!votos) {
      const listadoDiputados = await obtenerListadoDiputados(evento);
      const votospunto = listadoDiputados.map((dip) => ({
        sentido: 0,
        mensaje: "PENDIENTE",
        id_punto: puntoa,
        id_tema_punto_voto: tema,
        id_diputado: dip.id_diputado,
        id_partido: dip.id_partido,
        id_comision_dip: dip.comision_dip_id,
        id_cargo_dip: dip.id_cargo_dip,
      }));
      
      await VotosPunto.bulkCreate(votospunto);
      mensajeRespuesta = "Votacion creada correctamente";
    }
    
    
    const integrantes = await obtenerResultadosVotacionOptimizado(
      tema,
      puntoa,
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
  
    const dipasociados = await TipoCargoComision.findOne({
      where: { valor: "Diputado Asociado" }
    });

    const diputados = await AsistenciaVoto.findAll({
      where: {
        id_agenda: evento.id,
      }
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
  idTemaPuntoVoto: string | null,
  idPunto: string | null,
  tipoEvento: 'sesion' | 'comision'
): Promise<ResultadoVotacion[] | ComisionAgrupada[]> {
    
    const dipasociados = await TipoCargoComision.findOne({
      where: { valor: "Diputado Asociado" }
    });

    const whereConditions: any = {};
    
    if (idTemaPuntoVoto) {
      whereConditions.id_tema_punto_voto = idTemaPuntoVoto;
    } else if (idPunto) {
      whereConditions.id_punto = idPunto;
    } else {
      return []; // No hay nada que buscar
    }

    const votosRaw = await VotosPunto.findAll({
      where: whereConditions,
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
        cargos.map(c => [c.id, c] )
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
    
    
    if (!body.idPunto) {
      return res.status(400).json({
        msg: "Falta el parámetro requerido: idPunto",
      });
    }
    
   
    let whereCondition: any;
    
    if (body.idReserva) {
      const temavotos = await TemasPuntosVotos.findOne({ 
        where: { id: body.idReserva } 
      });
      
      if (!temavotos) {
        return res.status(404).json({
          msg: "No se encontró el tema de votación",
        });
      }
      
      whereCondition = { id_tema_punto_voto: temavotos.id };
      
    } else {
      const punto = await PuntosOrden.findOne({ 
        where: { id: body.idPunto } 
      });
      
      if (!punto) {
        return res.status(404).json({
          msg: "No se encontró el punto",
        });
      }
      
      whereCondition = { id_punto: punto.id };
    }
    
    const [cantidadActualizada] = await VotosPunto.update(
      {
        sentido: 0,
        mensaje: "PENDIENTE",
      },
      {
        where: whereCondition
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
    
    interface SelectOption {
      id: number;
      name: string;
    }

    interface SelectOption {
      id: number;
      name: string;
    }

    interface SelectOption {
      id: number;
      name: string;
    }

    let permanente: SelectOption[] = [];
    if (idPermanente) {
      const dips = await Comision.findAll({
        where: { tipo_comision_id: idPermanente.id },
        attributes: ['id', 'nombre']
      });
      console.log(dips)
      permanente = dips.map(item => ({
        id: item.id,
        name: item.nombre
      }));
      console.log('permanente:', permanente)
    }
      // console.log("holaaa:1",permanente)
      // return 500;
    const legisla = await Legislatura.findOne({
      order: [["fecha_inicio", "DESC"]],
    });

    let diputadosArray: { id: string; name: string }[] = [];

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
              name: `${d.diputado.nombres ?? ""} ${d.diputado.apaterno ?? ""} ${d.diputado.amaterno ?? ""}`.trim(),
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
        to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
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
      to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
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

    const temavotos = await TemasPuntosVotos.findAll({
      where: { id_evento: body.id_agenda }
    });

    for (const tema of temavotos) {
      await (tema as any).createVotospunto({
        sentido: 0,
        mensaje,
        id_diputado: body.id_diputado,
        id_partido: body.id_partido,
        id_comision_dip: body.comision_dip_id,
        id_cargo_dip: body.id_cargo_dip
      });
    }



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

    const integrante = await AsistenciaVoto.findOne({ where: { id } });

    if (!integrante) {
      return res.status(404).json({
        msg: "El diputado no existe en la lista",
        estatus: 404
      });
    }

    const temas = await TemasPuntosVotos.findAll({
      where: { id_evento: integrante.id_agenda },
      attributes: ["id"]
    });

    const temasIds = temas.map(t => t.id);

    if (temasIds.length > 0) {
      await VotosPunto.destroy({
        where: {
          id_diputado: integrante.id_diputado,
          id_comision_dip: integrante.comision_dip_id, 
          id_tema_punto_voto: temasIds
        }
      });
    }

 
    await integrante.destroy();

    return res.json({
      msg: "Diputado y votos correspondientes eliminados correctamente",
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


/////////////////////////////////

export const generarPDFVotacion = async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body;
    // console.log("punto",body);
    // return 500;
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

    const getColorSentido = (sentido: number): string => {
      switch (sentido) {
        case 1: return '#22c55e'; // Verde - A FAVOR
        case 3: return '#dc2626'; // Rojo - EN CONTRA
        case 2: return '#f59e0b'; // Amarillo - ABSTENCIÓN
        case 0: return '#6b7280'; // Gris - PENDIENTE
        default: return '#6b7280';
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
        cargo: cargo?.valor || null,
        nivel_cargo: cargo?.nivel || 999,
        sentidoTexto: getSentidoTexto(voto.sentido),
        sentidoNumerico: voto.sentido,
        mensaje: voto.mensaje
      };
    });

    // Calcular totales
    const totales = {
      favor: votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
      contra: votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
      abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
      pendiente: votosConDetalles.filter(v => v.mensaje === 'PENDIENTE' && v.sentidoNumerico === 0).length,
    };

    const totalVotos = votosConDetalles.length;

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

    // Ruta de la imagen de fondo
    const bgPath = path.join(__dirname, "../assets/membretesecretariaejecutiva.jpg");

    // Función para dibujar fondo de página
    const drawBackground = () => {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.y = 106;
    };

    // Dibujar fondo en la primera página
    drawBackground();

    // ===== DISEÑO DEL PDF =====

    // Encabezado
    doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE VOTACIÓN', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    // Información del Evento
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);

    // Tipo
    doc.fontSize(11).font('Helvetica-Bold').text('Tipo: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.tipoevento?.nombre || 'N/A');

    // Sede
    doc.fontSize(11).font('Helvetica-Bold').text('Sede: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.sede?.sede || 'N/A');

    // Fecha
    doc.fontSize(11).font('Helvetica-Bold').text('Fecha: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A');
    
    doc.moveDown(1);

    // Información del Punto
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL PUNTO');
    doc.moveDown(0.3);

    // Número
    doc.fontSize(11).font('Helvetica-Bold').text('Número: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(punto.nopunto || 'N/A');

    // Descripción (justificada)
    doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(punto.punto || 'N/A', { width: 500, align: "justify" });
    
    doc.moveDown(1);

    // Resumen de Votación
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE VOTACIÓN');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [110, 90, 90, 90, 80];
    const rowHeight = 25;

    // Encabezados de tabla
    doc.fontSize(11).font('Helvetica-Bold');

    // A FAVOR - Verde
    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
    doc.fillColor('#fff').text('A FAVOR', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });

    // EN CONTRA - Rojo
    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#dc2626', '#000');
    doc.fillColor('#fff').text('EN CONTRA', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });

    // ABSTENCIÓN - Amarillo
    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('ABSTENCIÓN', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });

    // PENDIENTE - Gris
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });

    // TOTAL - Azul
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, colWidths[4], rowHeight).fillAndStroke('#1e40af', '#000');
    doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, tableTop + 7, { width: colWidths[4] - 10, align: 'center' });

    // Valores de totales
    const valuesTop = tableTop + rowHeight;
    doc.fontSize(11).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.favor.toString(), 55, valuesTop + 7, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.contra.toString(), 50 + colWidths[0] + 5, valuesTop + 7, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.abstencion.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 7, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 7, { width: colWidths[3] - 10, align: 'center' });

    // TOTAL
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], valuesTop, colWidths[4], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totalVotos.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, valuesTop + 7, { width: colWidths[4] - 10, align: 'center' });

    doc.moveDown(2);
    doc.x = doc.page.margins.left;

    // ===== DETALLE DE VOTACIÓN SEGÚN TIPO DE EVENTO =====
    
    if (esSesion) {
      generarDetalleSesion(doc, votosConDetalles, drawBackground, getColorSentido);
    } else {
      generarDetalleComision(doc, votosConDetalles, drawBackground, getColorSentido);
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

function generarDetalleSesion(doc: any, votos: any[], drawBackground: () => void, getColorSentido: (sentido: number) => string) {
  // TÍTULO CENTRADO
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE VOTACIÓN', { align: 'center' });
  doc.moveDown(0.5);

  // Ordenar alfabéticamente
  const votosOrdenados = [...votos].sort((a, b) => 
    a.diputado.localeCompare(b.diputado, 'es')
  );

  const startY = doc.y;
  const colX = { no: 50, diputado: 75, partido: 390, sentido: 455 };

  // Encabezado guinda #96134b
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
  doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b', '#000');
  doc.fillColor('#fff');
  doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
  doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 305 });
  doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 60 });
  doc.text('SENTIDO', colX.sentido + 3, startY + 6, { width: 85 });

  let currentY = startY + 20;

  votosOrdenados.forEach((voto, index) => {
    if (currentY > 700) {
      doc.addPage();
      drawBackground();
      currentY = 106;
      
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
      doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b', '#000');
      doc.fillColor('#fff');
      doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
      doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 305 });
      doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 60 });
      doc.text('SENTIDO', colX.sentido + 3, currentY + 6, { width: 85 });
      currentY += 20;
    }

    doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');

    doc.fontSize(8).font('Helvetica').fillColor('#000');
    doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
    doc.text(voto.diputado, colX.diputado + 3, currentY + 5, { width: 305, ellipsis: true });
    doc.text(voto.partido, colX.partido + 3, currentY + 5, { width: 60 });
    
    // Sentido con color
    doc.fillColor(getColorSentido(voto.sentidoNumerico));
    doc.text(voto.sentidoTexto, colX.sentido + 3, currentY + 5, { width: 85 });

    currentY += 18;
  });

  doc.moveDown(1.5);
}

function generarDetalleComision(doc: any, votos: any[], drawBackground: () => void, getColorSentido: (sentido: number) => string) {
  // TÍTULO CENTRADO
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE VOTACIÓN POR COMISIÓN', { align: 'center' });
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
      drawBackground();
      doc.y = 106;
    }

    // Título de la comisión en NEGRO
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
    doc.text(`${comision.nombre.toUpperCase()}`, 50, doc.y, { align: 'left' });
    doc.moveDown(0.5);

    // Ordenar votos por nivel de cargo
    const votosOrdenados = [...comision.votos].sort((a, b) => a.nivel_cargo - b.nivel_cargo);

    const startY = doc.y;
    const colX = { no: 50, diputado: 75, cargo: 310, partido: 410, sentido: 465 };

    // Encabezado guinda #96134b
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b', '#000');
    doc.fillColor('#fff');
    doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
    doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 225 });
    doc.text('CARGO', colX.cargo + 3, startY + 6, { width: 90 });
    doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 50 });
    doc.text('SENTIDO', colX.sentido + 3, startY + 6, { width: 75 });

    let currentY = startY + 20;

    votosOrdenados.forEach((voto, index) => {
      if (currentY > 700) {
        doc.addPage();
        drawBackground();
        currentY = 106;
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
        doc.text(`${comision.nombre.toUpperCase()}`, 50, currentY);
        currentY += 25;
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b', '#000');
        doc.fillColor('#fff');
        doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
        doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 225 });
        doc.text('CARGO', colX.cargo + 3, currentY + 6, { width: 90 });
        doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 50 });
        doc.text('SENTIDO', colX.sentido + 3, currentY + 6, { width: 75 });
        currentY += 20;
      }

      doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');

      doc.fontSize(8).font('Helvetica').fillColor('#000');
      doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
      doc.text(voto.diputado, colX.diputado + 3, currentY + 5, { width: 225, ellipsis: true });
      doc.text(voto.cargo || 'Sin cargo', colX.cargo + 3, currentY + 5, { width: 90, ellipsis: true });
      doc.text(voto.partido, colX.partido + 3, currentY + 5, { width: 50 });

      // Sentido con color
      doc.fillColor(getColorSentido(voto.sentidoNumerico));
      doc.text(voto.sentidoTexto, colX.sentido + 3, currentY + 5, { width: 75 });

      currentY += 18;
    });

    doc.moveDown(1.5);
  });
}

export const enviarWhatsVotacionPDF = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    // Validación inicial
    if (!body.idPunto) {
      return res.status(400).json({
        msg: "Falta el parámetro requerido: idPunto",
      });
    }
    
    const punto = await PuntosOrden.findOne({ where: { id: body.idPunto } });
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

    // ✅ Lógica modificada para soportar ambos casos
    let whereCondition: any;
    let temaInfo: any = null;
    
    if (body.idReserva) {
      // Caso 1: Buscar por id_tema_punto_voto
      const temavotos = await TemasPuntosVotos.findOne({ 
        where: { id: body.idReserva } 
      });
      
      if (!temavotos) {
        return res.status(404).json({ msg: "No se encontró el tema de votación" });
      }
      
      whereCondition = { id_tema_punto_voto: temavotos.id };
      temaInfo = temavotos;
      
    } else {
      // Caso 2: Buscar por id_punto
      whereCondition = { id_punto: body.idPunto };
    }

    const dipasociados = await TipoCargoComision.findOne({
      where: { valor: "Diputado Asociado" }
    });
    
    const votosRaw = await VotosPunto.findAll({
      where: whereCondition,
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
        case 0: return "PENDIENTE";
        case 1: return "A FAVOR";
        case 2: return "ABSTENCIÓN";
        case 3: return "EN CONTRA";
        default: return "PENDIENTE";
      }
    };

    const getColorSentido = (sentido: number): string => {
      switch (sentido) {
        case 1: return '#22c55e'; // Verde - A FAVOR
        case 3: return '#dc2626'; // Rojo - EN CONTRA
        case 2: return '#f59e0b'; // Amarillo - ABSTENCIÓN
        case 0: return '#6b7280'; // Gris - PENDIENTE
        default: return '#6b7280';
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
        cargo: cargo?.valor || null,
        nivel_cargo: cargo?.nivel || 999,
        sentidoTexto: getSentidoTexto(voto.sentido),
        sentidoNumerico: voto.sentido,
        mensaje: voto.mensaje
      };
    });

    // Calcular totales
    const totales = {
      favor: votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
      contra: votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
      abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
      pendiente: votosConDetalles.filter(v => v.sentidoNumerico === 0).length,
    };

    const totalVotos = votosConDetalles.length;

    // Crear PDF
    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });

    const fileName = `votacion-punto-${body.idPunto}-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../storage/pdfs', fileName);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Ruta de la imagen de fondo
    const bgPath = path.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");

    // Función para dibujar fondo de página
    const drawBackground = () => {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.y = 106;
    };

    // Dibujar fondo en la primera página
    drawBackground();

    // ===== DISEÑO DEL PDF =====

    // Encabezado
    doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE VOTACIÓN', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    // Información del Evento
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);

    // Tipo
    doc.fontSize(11).font('Helvetica-Bold').text('Tipo: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.tipoevento?.nombre || 'N/A');

    // Sede
    doc.fontSize(11).font('Helvetica-Bold').text('Sede: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.sede?.sede || 'N/A');

    // Fecha
    doc.fontSize(11).font('Helvetica-Bold').text('Fecha: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A');
    
    doc.moveDown(1);

    // Información del Punto
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL PUNTO');
    doc.moveDown(0.3);

    // Número
    doc.fontSize(11).font('Helvetica-Bold').text('Número: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(punto.nopunto || 'N/A');

    // Descripción (justificada)
    doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(punto.punto || 'N/A', { width: 500, align: "justify" });
    
    // ✅ Si hay tema de votación, mostrarlo
    if (temaInfo) {
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica-Bold').text('Reserva: ', { continued: true });
      doc.fontSize(11).font('Helvetica').text(temaInfo.tema_votacion || 'N/A', { width: 500, align: "justify" });
    }
    
    doc.moveDown(1);

    // Resumen de Votación
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE VOTACIÓN');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [110, 90, 90, 90, 80];
    const rowHeight = 25;

    // Encabezados de tabla
    doc.fontSize(11).font('Helvetica-Bold');

    // A FAVOR - Verde
    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
    doc.fillColor('#fff').text('A FAVOR', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });

    // EN CONTRA - Rojo
    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#dc2626', '#000');
    doc.fillColor('#fff').text('EN CONTRA', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });

    // ABSTENCIÓN - Amarillo
    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('ABSTENCIÓN', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });

    // PENDIENTE - Gris
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });

    // TOTAL - Azul
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, colWidths[4], rowHeight).fillAndStroke('#1e40af', '#000');
    doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, tableTop + 7, { width: colWidths[4] - 10, align: 'center' });

    // Valores de totales
    const valuesTop = tableTop + rowHeight;
    doc.fontSize(11).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.favor.toString(), 55, valuesTop + 7, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.contra.toString(), 50 + colWidths[0] + 5, valuesTop + 7, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.abstencion.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 7, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 7, { width: colWidths[3] - 10, align: 'center' });

    // TOTAL
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], valuesTop, colWidths[4], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totalVotos.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, valuesTop + 7, { width: colWidths[4] - 10, align: 'center' });

    doc.moveDown(2);
    doc.x = doc.page.margins.left;

    // Detalle de votación según tipo
    if (esSesion) {
      generarDetalleSesion(doc, votosConDetalles, drawBackground, getColorSentido);
    } else {
      generarDetalleComision(doc, votosConDetalles, drawBackground, getColorSentido);
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

    // Obtener listado de comisiones únicas si NO es sesión
    let infoComisiones = "";
    if (!esSesion) {
      const comisionesUnicas = [...new Set(
        votosConDetalles
          .map(v => v.comision_nombre)
          .filter(nombre => nombre && nombre !== 'Sin comisión')
      )].sort();

      if (comisionesUnicas.length > 0) {
        infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
      }
    }

    // ✅ Construir mensaje con tema de votación si existe
    const mensajeTexto = (temaInfo 
      ? `*VOTACION - RESERVA* ${punto.nopunto}\n\n`
      : `*VOTACION - PUNTO ${punto.nopunto}*\n\n`) +
      `*Punto:* ${punto.punto || 'N/A'}\n` +
      (temaInfo ? `*Reserva:* ${temaInfo.tema_votacion || 'N/A'}\n` : '') +
      `*Evento:* ${evento.tipoevento?.nombre || 'N/A'}\n` +
      `*Fecha:* ${fechaFormateada}${infoComisiones}\n` +
      `*Resultados:*\n` +
      `A favor: ${totales.favor}\n` +
      `En contra: ${totales.contra}\n` +
      `Abstencion: ${totales.abstencion}\n` +
      `Pendiente: ${totales.pendiente}\n\n` +
      `Total de votos: ${totalVotos}\n\n` +
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
      to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
      // to: "+527222035605,",
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



//////////////////////////////////

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

    const totalDiputados = asistenciasConDetalles.length;

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


    // Ruta de la imagen de fondo
    const bgPath = path.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");


    // Función para dibujar fondo de página
    const drawBackground = () => {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.y = 106; // Fijar posición inicial después del fondo
    };

    // Dibujar fondo en la primera página
    drawBackground();

    // ===== DISEÑO DEL PDF =====

    // Encabezado
    doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    // Información del Evento
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);

    // Tipo
    doc.fontSize(11).font('Helvetica-Bold').text('Tipo: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.tipoevento?.nombre || 'N/A');

    // Sede
    doc.fontSize(11).font('Helvetica-Bold').text('Sede: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.sede?.sede || 'N/A');

    // Fecha
    doc.fontSize(11).font('Helvetica-Bold').text('Fecha: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A');

    // Descripción (justificada)
    doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.descripcion || 'N/A', { width: 500, align: "justify" });
    doc.moveDown(1);

    // Resumen de Asistencia
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE ASISTENCIA');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [120, 120, 120, 100];
    const rowHeight = 25;

    // Encabezados de tabla
    doc.fontSize(11).font('Helvetica-Bold');

    // ASISTENCIA - Verde
    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
    doc.fillColor('#fff').text('ASISTENCIA', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });

    // ASISTENCIA ZOOM - Azul
    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#3b82f6', '#000');
    doc.fillColor('#fff').text('ASISTENCIA ZOOM', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });

    // PENDIENTE - Amarillo
    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });

    // TOTAL - Gris
    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
    doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });

    // Valores
    const valuesTop = tableTop + rowHeight;
    doc.fontSize(11).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistencia.toString(), 55, valuesTop + 7, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistenciaZoom.toString(), 50 + colWidths[0] + 5, valuesTop + 7, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 7, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totalDiputados.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 7, { width: colWidths[3] - 10, align: 'center' });

    doc.moveDown(2);
    doc.x = doc.page.margins.left;

    // ===== DETALLE DE ASISTENCIA SEGÚN TIPO DE EVENTO =====
    
    if (esSesion) {
      generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
    } else {
      generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground);
    }

    doc.end();

    // Esperar a que se generen todas las páginas
    await new Promise((resolve) => setTimeout(resolve, 100));

    // DESPUÉS agregar pie de página a TODAS las páginas ya generadas
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

function generarDetalleSesionAsistencia(doc: any, asistencias: any[], drawBackground: () => void) {
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE ASISTENCIA', { align: 'center' });
  doc.moveDown(0.5);

  // Ordenar alfabéticamente
  const asistenciasOrdenadas = [...asistencias].sort((a, b) => 
    a.diputado.localeCompare(b.diputado, 'es')
  );

  const startY = doc.y;
  const colX = { no: 50, diputado: 75, partido: 390, asistencia: 455 };

  // Encabezado con estilo de votaciones
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
  doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b');
  doc.fillColor('#fff');
  doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
  doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 305 });
  doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 60 });
  doc.text('ASISTENCIA', colX.asistencia + 3, startY + 6, { width: 85 });

  let currentY = startY + 20;

  asistenciasOrdenadas.forEach((asist, index) => {
    if (currentY > 700) {
      doc.addPage();
      drawBackground(); // Dibujar fondo en nueva página
      currentY = 106; // Posición inicial después del fondo
      
      // Re-dibujar encabezado
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
      doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b');
      doc.fillColor('#fff');
      doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
      doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 305 });
      doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 60 });
      doc.text('ASISTENCIA', colX.asistencia + 3, currentY + 6, { width: 85 });
      currentY += 20;
    }

    // Borde de fila
    doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');

    doc.fontSize(8).font('Helvetica').fillColor('#000');
    doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
    doc.text(asist.diputado, colX.diputado + 3, currentY + 5, { width: 305, ellipsis: true });
    doc.text(asist.partido, colX.partido + 3, currentY + 5, { width: 60 });
    
    // Asistencia con color
    const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
    doc.fillColor(colorAsistencia);
    doc.text(asist.asistenciaTexto, colX.asistencia + 3, currentY + 5, { width: 85 });

    currentY += 18;
  });

  doc.moveDown(1.5);
}

function generarDetalleComisionAsistencia(doc: any, asistencias: any[], drawBackground: () => void) {
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE ASISTENCIA POR COMISIÓN', { align: 'center' });
  doc.moveDown(0.5);

  // Agrupar por comisión
  const asistenciasPorComision = asistencias.reduce((grupos, asist) => {
    const comision = asist.comision_nombre || 'Sin comisión';
    if (!grupos[comision]) {
      grupos[comision] = {
        nombre: comision,
        importancia: asist.comision_importancia,
        asistencias: []
      };
    }
    grupos[comision].asistencias.push(asist);
    return grupos;
  }, {} as Record<string, any>);

  // Ordenar comisiones por importancia
  const comisionesOrdenadas = Object.values(asistenciasPorComision).sort((a: any, b: any) => 
    a.importancia - b.importancia
  );

  comisionesOrdenadas.forEach((comision: any) => {
    // Verificar espacio para título + tabla (necesita al menos 100px)
    if (doc.y > 650) {
      doc.addPage();
      drawBackground(); // Dibujar fondo en nueva página
      doc.y = 106; // Posición inicial después del fondo
    }

    // Título de la comisión
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
    doc.text(comision.nombre.toUpperCase(), 50, doc.y, { align: 'left' });
    doc.moveDown(0.5);

    // Ordenar asistencias por nivel de cargo
    const asistenciasOrdenadas = [...comision.asistencias].sort((a, b) => a.nivel_cargo - b.nivel_cargo);

    const startY = doc.y;
    const colX = { no: 50, diputado: 75, cargo: 310, partido: 410, asistencia: 465 };

    // Encabezado con estilo de votaciones
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b');
    doc.fillColor('#fff');
    doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
    doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 225 });
    doc.text('CARGO', colX.cargo + 3, startY + 6, { width: 90 });
    doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 50 });
    doc.text('ASISTENCIA', colX.asistencia + 3, startY + 6, { width: 75 });

    let currentY = startY + 20;

    asistenciasOrdenadas.forEach((asist, index) => {
      // Verificar espacio para nueva fila
      if (currentY > 700) {
        doc.addPage();
        drawBackground(); // Dibujar fondo en nueva página
        
        currentY = 106; // Empezar después del fondo
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`${comision.nombre.toUpperCase()}`, 50, currentY);
        
        currentY += 25;
        
        // Re-dibujar encabezado
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b');
        doc.fillColor('#fff');
        doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
        doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 225 });
        doc.text('CARGO', colX.cargo + 3, currentY + 6, { width: 90 });
        doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 50 });
        doc.text('ASISTENCIA', colX.asistencia + 3, currentY + 6, { width: 75 });
        currentY += 20;
      }

      // Borde de fila
      doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');

      doc.fontSize(8).font('Helvetica').fillColor('#000');
      doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
      doc.text(asist.diputado, colX.diputado + 3, currentY + 5, { width: 225, ellipsis: true });
      doc.text(asist.cargo_nombre || 'Sin cargo', colX.cargo + 3, currentY + 5, { width: 90, ellipsis: true });
      doc.text(asist.partido, colX.partido + 3, currentY + 5, { width: 50 });

      // Asistencia con color
      const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
      doc.fillColor(colorAsistencia);
      doc.text(asist.asistenciaTexto, colX.asistencia + 3, currentY + 5, { width: 75 });

      currentY += 18;
    });

    doc.moveDown(1.5);
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

    const totalDiputados = asistenciasConDetalles.length;

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

    // Ruta de la imagen de fondo
    const bgPath = path.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");

    // Función para dibujar fondo de página
    const drawBackground = () => {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.y = 106;
    };

    // Dibujar fondo en la primera página
    drawBackground();

    // ===== DISEÑO DEL PDF =====

    doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
    doc.moveDown(0.3);

    doc.fontSize(11).font('Helvetica-Bold').text('Tipo: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.tipoevento?.nombre || 'N/A');

    doc.fontSize(11).font('Helvetica-Bold').text('Sede: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.sede?.sede || 'N/A');

    doc.fontSize(11).font('Helvetica-Bold').text('Fecha: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A');

    doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
    doc.fontSize(11).font('Helvetica').text(evento.descripcion || 'N/A', { width: 500, align: "justify" });
    doc.moveDown(1);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE ASISTENCIA');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [120, 120, 120, 100];
    const rowHeight = 25;

    doc.fontSize(11).font('Helvetica-Bold');

    doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
    doc.fillColor('#fff').text('ASISTENCIA', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#3b82f6', '#000');
    doc.fillColor('#fff').text('ASISTENCIA ZOOM', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
    doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
    doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });

    const valuesTop = tableTop + rowHeight;
    doc.fontSize(11).font('Helvetica-Bold');

    doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistencia.toString(), 55, valuesTop + 7, { width: colWidths[0] - 10, align: 'center' });

    doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.asistenciaZoom.toString(), 50 + colWidths[0] + 5, valuesTop + 7, { width: colWidths[1] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 7, { width: colWidths[2] - 10, align: 'center' });

    doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
    doc.fillColor('#000').text(totalDiputados.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 7, { width: colWidths[3] - 10, align: 'center' });

    doc.moveDown(2);
    doc.x = doc.page.margins.left;

    if (esSesion) {
      generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
    } else {
      generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground);
    }

    // FINALIZAR PDF
    doc.end();

    // ESPERAR A QUE EL ARCHIVO SE ESCRIBA COMPLETAMENTE
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

    let infoComisiones = "";
    if (!esSesion) {
      const comisionesUnicas = [...new Set(
        asistenciasConDetalles
          .map(a => a.comision_nombre)
          .filter(nombre => nombre && nombre !== 'Sin Comisión')
      )].sort();

      if (comisionesUnicas.length > 0) {
        infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
      }
    }

    const mensajeTexto = `*ASISTENCIA - ${evento.tipoevento?.nombre || 'Evento'}*\n\n` +
      `*Descripcion:* ${evento.descripcion || 'N/A'}\n` +
      `*Sede:* ${evento.sede?.sede || 'N/A'}\n` +
      `*Fecha:* ${fechaFormateada}${infoComisiones}\n` +
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
      to: "+527222035605, +527224986377, +527151605569",
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

export const exportdatos = async (req: Request, res: Response) => {
  try {
    // 1. Obtener los datos de la base de datos con las relaciones necesarias
    const agendas = await Agenda.findAll({
      order: [['fecha', 'DESC']],
      include: [
        {
          model: Sedes,
          as: 'sede', // Verifica que este sea el alias correcto en tu modelo
          attributes: ['sede']
        },
        {
          model: TipoEventos,
          as: 'tipoevento', // ⬅️ Cambiado a 'tipoevento' según el error
          attributes: ['nombre']
        },
        {
          model: AnfitrionAgenda,
          as: 'anfitrion_agendas',
          include: [
            {
              model: TipoAutor,
              as: 'tipo_autor',
              attributes: ['valor']
            }
          ]
        }
      ]
    });
    
    // 2. Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Agendas');
    
    // 3. Definir todas las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora', key: 'hora', width: 12 },
      { header: 'Fecha Hora', key: 'fecha_hora', width: 20 },
      { header: 'Fecha Hora Inicio', key: 'fecha_hora_inicio', width: 20 },
      { header: 'Fecha Hora Fin', key: 'fecha_hora_fin', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Sede', key: 'sede', width: 30 },
      { header: 'Tipo Evento', key: 'tipo_evento', width: 25 },
      { header: 'Transmisión', key: 'transmision', width: 15 },
      { header: 'Estatus Transmisión', key: 'estatus_transmision', width: 20 },
      { header: 'Inicio Programado', key: 'inicio_programado', width: 20 },
      { header: 'Fin Programado', key: 'fin_programado', width: 20 },
      { header: 'Liga', key: 'liga', width: 30 },
      { header: 'Documentación ID', key: 'documentacion_id', width: 18 },
      { header: 'Tipo Sesión', key: 'tipo_sesion', width: 15 },
      { header: 'Tipo Autor', key: 'tipo_autor', width: 20 },
      { header: 'Autor', key: 'autor', width: 30 },
    ];
    
    // 4. Estilizar el encabezado
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // 5. Procesar y agregar los datos
    for (const agenda of agendas) {
      // Obtener tipo autor y autor
      let tipoAutorValor = '';
      let autorNombre = '';
      
      if (agenda.anfitrion_agendas && agenda.anfitrion_agendas.length > 0) {
        const anfitrion = agenda.anfitrion_agendas[0];
        tipoAutorValor = anfitrion.tipo_autor?.valor || '';
        
        // Obtener nombre del autor según el tipo
        if (anfitrion.autor_id) {
          // Verificar si es una comisión
          const comision = await Comision.findOne({
            where: { id: anfitrion.autor_id },
            attributes: ["id", "nombre"]
          });
          
          if (comision) {
            autorNombre = comision.nombre;
          } else {
            // Si no es comisión, es sesión
            autorNombre = 'Sesion';
          }
        }
      }
      
      worksheet.addRow({
        id: agenda.id,
        fecha: agenda.fecha,
        hora: agenda.hora,
        fecha_hora: agenda.fecha_hora,
        fecha_hora_inicio: agenda.fecha_hora_inicio,
        fecha_hora_fin: agenda.fecha_hora_fin,
        descripcion: agenda.descripcion,
        status: agenda.status,
        sede: agenda.sede?.sede || '',
        tipo_evento: agenda.tipoevento?.nombre || '', // ⬅️ Cambiado a 'tipoevento'
        transmision: agenda.transmision,
        estatus_transmision: agenda.estatus_transmision,
        inicio_programado: agenda.inicio_programado,
        fin_programado: agenda.fin_programado,
        liga: agenda.liga,
        documentacion_id: agenda.documentacion_id,
        tipo_sesion: agenda.tipo_sesion,
        tipo_autor: tipoAutorValor,
        autor: autorNombre,
      });
    }
    
    // 6. Aplicar bordes a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // 7. Generar el buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // 8. Generar el nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `agendas_${fecha}.xlsx`;
    
    // 9. Configurar headers y enviar
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
    
  } catch (error) {
    console.error("Error al exportar agendas:", error);
    return res.status(500).json({
      msg: "Error al generar el archivo Excel",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};