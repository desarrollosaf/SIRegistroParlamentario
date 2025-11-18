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
import { tipo_cargo_comisions } from "../models/tipo_cargo_comisions";
import TipoAutor from "../models/tipo_autors";
import { comisiones } from "../models/init-models";
import Municipios from "../models/municipios";
import OtrosAutores from "../models/otros_autores";

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

    const asistenciasExistentes = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      raw: true,
    });

    if (asistenciasExistentes.length > 0) {

      const asistenciasExistentes2 = Object.values(
        asistenciasExistentes.reduce<Record<string, any>>((acc, curr) => {
          if (!acc[curr.id_diputado]) acc[curr.id_diputado] = curr;
          return acc;
        }, {})
      );

      const resultados = await Promise.all(
        asistenciasExistentes2.map(async (inte) => {
          const diputado = await Diputado.findOne({
            where: { id: inte.id_diputado },
            attributes: ["apaterno", "amaterno", "nombres"],
            raw: true,
          });

          const partido = await Partidos.findOne({
            where: { id: inte.partido_dip },
            attributes: ["siglas"],
            raw: true,
          });

          const nombreCompletoDiputado = diputado
            ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
            : null;

          return {
            ...inte,
            diputado: nombreCompletoDiputado,
            partido: partido ? partido.siglas : null,
          };
        })
      );

      return res.status(200).json({
        msg: "Evento con asistencias existentes",
        evento,
        integrantes: resultados,
      });
    }

    const listadoDiputados: { id_diputado: string; id_partido: string; comision_dip_id: string | null; bandera: number }[] = [];
    let bandera = 1;

    if (evento.tipoevento?.nombre === "Sesión") {
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
              bandera,
            });
          }
        }
      }
    } else {
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

        for (const comId of comisionIds) {
          const deEstaComision = integrantes.filter(
            (i) => i.comision_id === comId && i.integranteLegislatura?.diputado
          );
          for (const inte of deEstaComision) {
            listadoDiputados.push({
              id_diputado: inte.integranteLegislatura!.diputado!.id,
              id_partido: inte.integranteLegislatura!.partido_id,
              comision_dip_id: inte.comision_id,
              bandera,
            });
          }
          bandera++;
        }
      }
    }

    const mensaje = "PENDIENTE";
    const timestamp = new Date();

    const asistencias = listadoDiputados.map((diputado) => ({
      sentido_voto: 0,
      mensaje,
      timestamp,
      id_diputado: diputado.id_diputado,
      partido_dip: diputado.id_partido,
      comision_dip_id: diputado.comision_dip_id,
      id_agenda: evento.id,
    }));
    await AsistenciaVoto.bulkCreate(asistencias);


    const asistenciasRaw = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      order: [['created_at', 'DESC']],
      raw: true,
    });

    const nuevasAsistencias = Object.values(
      asistenciasRaw.reduce<Record<string, any>>((acc, curr) => {
        if (!acc[curr.id_diputado]) acc[curr.id_diputado] = curr;
        return acc;
      }, {})
    );

    const resultados = await Promise.all(
      nuevasAsistencias.map(async (inte) => {
        const diputado = await Diputado.findOne({
          where: { id: inte.id_diputado },
          attributes: ["apaterno", "amaterno", "nombres"],
          raw: true,
        });

        const partido = await Partidos.findOne({
          where: { id: inte.partido_dip },
          attributes: ["siglas"],
          raw: true,
        });

        const nombreCompletoDiputado = diputado
          ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
          : null;

        return {
          ...inte,
          diputado: nombreCompletoDiputado,
          partido: partido ? partido.siglas : null,
        };
      })
    );

    return res.status(200).json({
      msg: "Evento generado correctamente",
      evento,
      integrantes: resultados,
    });
  } catch (error) {
    console.error("Error obteniendo evento:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener el evento",
      error: (error as Error).message,
    });
  }
};

export const actualizar = async (req: Request, res: Response): Promise<any> => {
    try {
        const { body } = req
      
        const votos = await AsistenciaVoto.findAll({
          where: {
            id_agenda: body.idagenda,
            id_diputado: body.iddiputado,
          },
        });

        if (votos && votos.length > 0) {
          let nuevoSentido;
          let nuevoMensaje;
          
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
              break;
          }

          await AsistenciaVoto.update(
            {
              sentido_voto: nuevoSentido,
              mensaje: nuevoMensaje,
            },
            {
              where: {
                id_agenda: body.idagenda,
                id_diputado: body.iddiputado,
              }
            }
          );

          return res.status(200).json({
            msg: `${votos.length} registro(s) actualizado(s) correctamente`,
            estatus: 200
          });
        } else {
          return res.status(404).json({
            msg: "No se encontró el registro de asistencia para este diputado y agenda",
          });
        }

    } catch (error) {
        console.error('Error al generar consulta:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
}


export const catalogos = async (req: Request, res: Response): Promise<any> => {
    try {
        const proponentes = await Proponentes.findAll({
          attributes: ['id', 'valor'],
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
            tipointer: tipointer

        });

    } catch (error) {
        console.error('Error al generar consulta:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
}

export const getTiposPuntos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const proponente = await Proponentes.findByPk(id);

    if (!proponente) {
      return res.status(404).json({ message: 'Proponente no encontrado' });
    }
  
    const arr: any = {proponente};
    let tiposRelacionados = await proponente.getTipos({ attributes: ['id', 'valor'], joinTableAttributes: [] });
   
    arr.tipos = tiposRelacionados;

   
    if (proponente.valor === 'Diputadas y Diputados') {

      const legis = await Legislatura.findOne({
          order: [["fecha_inicio", "DESC"]],
        });

      if (legis) {
        const dips = await IntegranteLegislatura.findAll({
          where: { legislatura_id: legis.id },
          include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
        });

        const dipss = dips
          .filter((d) => d.diputado)
          .map((item) => ({
            id: item.diputado.id,
            diputado: `${item.diputado.apaterno ?? ''} ${item.diputado.amaterno ?? ''} ${item.diputado.nombres ?? ''}`.trim(),
          }));

        arr.diputados = dipss;
      }
      
    } else if (proponente.valor === 'Mesa Directiva en turno') {
      const idMesa = await TipoComisions.findOne({ where: { valor: 'Mesa Directiva' } });
      if (idMesa) {
        const mesa = await Comision.findOne({
          where: { tipo_comision_id: idMesa.id },
          order: [['created_at', 'DESC']],
        });
        if (mesa) arr.mesa = { id: mesa.id, valor: mesa.nombre };
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
        if (mesa) arr.mesa = { id: mesa.id, valor: mesa.nombre };
      }
      
    } else if (proponente.valor === 'Secretarías del GEM') {
  
    } else if (proponente.valor === 'Gobernadora o Gobernador del Estado') {
      // no acciones extra aparte de tipos
    } else if (
      proponente.valor === 'Tribunal Superior de Justicia' ||
      proponente.valor === 'Ayuntamientos' ||
      proponente.valor === 'Ciudadanas y ciudadanos del Estado' ||
      proponente.valor === 'Comición de Derechos Humanos del Estado de México' ||
      proponente.valor === 'Fiscalía General de Justicia del Estado de México'
    ) {
      // no acciones extra aparte de tipos
    } else if (proponente.valor === 'Comisiones Legislativas') {
      const idMesa = await TipoComisions.findOne({ where: { valor: 'Comisiones Legislativas' } });
      if (idMesa) {
        const comi = await Comision.findAll({ where: { tipo_comision_id: idMesa.id } });
        const comisiones = comi.map((item) => ({ id: item.id, comision: item.nombre }));
        arr.comisiones = comisiones;
      }
       
    } else if (proponente.valor === 'Comisión instaladora') {
      // no acciones extra aparte de tipos
    } else if (proponente.valor === 'Municipios') {
      // no actions extra
    } else if (proponente.valor === 'Diputación Permanente') {
      const idMesa = await TipoComisions.findOne({ where: { valor: 'Diputación Permanente' } });
      if (idMesa) {
        const mesa = await Comision.findOne({
          where: { tipo_comision_id: idMesa.id },
          order: [['created_at', 'DESC']],
        });
        if (mesa) arr.mesa = { id: mesa.id, valor: mesa.nombre };
      }
    } else if (
      proponente.valor === 'Cámara de Diputados del H. Congreso de la Unión' ||
      proponente.valor === 'Cámara de Senadores del H. Congreso de la Unión'
    ) {
      // no actions extra
    } else if (proponente.valor === 'Grupo Parlamentario') {
      const partidos = await Partidos.findAll();
      arr.partidos = partidos;
      //  console.log(arr.partidos)
      // return(500)
    } else if (proponente.valor === 'Legislatura') {
      const legislaturas = await Legislatura.findAll();
      arr.legislaturas = legislaturas;
    }

    const combo = await AdminCat.findAll({ where: { id_presenta: proponente.id } });
    arr.combo = combo;
    arr.tipoCombo = proponente;
    return res.json(arr);
  } catch (error) {
    console.error('Error en getTiposPuntos:', error);
    return res.status(500).json({ message: 'Error al obtener tipos de puntos', error: error.message });
  }
};

export const guardarpunto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { body } = req;
    const file = req.file;
    console.log(file);
    const evento = await Agenda.findOne({ where: { id } });

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const puntonuevo = await PuntosOrden.create({
      id_evento: evento.id,
      nopunto: body.numpunto,
      id_proponente: body.proponente,
      id_tipo: body.tipo,
      tribuna: body.tribuna,
      path_doc: file ? `storage/puntos/${file.filename}` : null,
      punto: body.punto,
      observaciones: body.observaciones,
    });

    return res.status(201).json({
      message: "Punto creado correctamente",
      data: puntonuevo,
    });
  } catch (error: any) {
    console.error("Error al guardar el punto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getpuntos = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const puntos = await PuntosOrden.findAll({
        where: { id_evento: id },
        order: [['nopunto', 'DESC']] 
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

    const punto = await PuntosOrden.findOne({ where: { id } });

    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }

    const nuevoPath = file ? `storage/puntos/${file.filename}` : punto.path_doc;

    await punto.update({
      nopunto: body.numpunto ?? punto.nopunto,
      id_proponente: body.proponente ?? punto.id_proponente,
      id_tipo: body.tipo ?? punto.id_tipo,
      tribuna: body.tribuna ?? punto.tribuna,
      path_doc: nuevoPath,
      punto: body.punto ?? punto.punto,
      observaciones: body.observaciones ?? punto.observaciones,
      editado: 1, 
    });

    return res.status(200).json({
      message: "Punto actualizado correctamente",
      data: punto,
    });
  } catch (error: any) {
    console.error("Error al actualizar el punto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
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

      await Intervencion.bulkCreate(registros);

      return res.status(200).json({
        message: "Intervenciones guardadas correctamente",
      });
  } catch (error: any) {
    console.error("Error al guardar evento:", error);
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
      }));

      await VotosPunto.bulkCreate(votospunto);
      mensajeRespuesta = "Votacion creada correctamente";
    }

    const integrantes = await obtenerResultadosVotacionOptimizado(temavotos.id);
    return res.status(200).json({
      msg: mensajeRespuesta,
      evento,
      integrantes,
    });

  } catch (error: any) {
    console.error("Error al traer los votos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

async function obtenerListadoDiputados(evento: any) {
  const listadoDiputados: { id_diputado: string; id_partido: string; comision_dip_id: string | null }[] = [];

  if (evento.tipoevento?.nombre === "Sesión") {
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
          });
        }
      }
    }
  } else {
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
          });
        }
      }
    }
  }

  return listadoDiputados;
}

async function obtenerResultadosVotacionOptimizado(idTemaPuntoVoto: string) {
  const votosRaw = await VotosPunto.findAll({
    where: { id_tema_punto_voto: idTemaPuntoVoto },
    raw: true,
  });
  const votosUnicos = Object.values(
    votosRaw.reduce<Record<string, any>>((acc, curr) => {
      if (!curr.id_diputado) return acc;
      acc[curr.id_diputado] = curr;
      return acc;
    }, {})
  );

  if (votosUnicos.length === 0) {
    return [];
  }

  const diputadoIds = votosUnicos.map(v => v.id_diputado).filter(Boolean);
  const diputados = await Diputado.findAll({
    where: { id: diputadoIds },
    attributes: ["id", "apaterno", "amaterno", "nombres"],
    raw: true,
  });

  const diputadosMap = new Map(
    diputados.map(d => [d.id, d])
  );

  const partidoIds = votosUnicos.map(v => v.id_partido).filter(Boolean);
  const partidos = await Partidos.findAll({
    where: { id: partidoIds },
    attributes: ["id", "siglas"],
    raw: true,
  });

  const partidosMap = new Map(
    partidos.map(p => [p.id, p])
  );


  return votosUnicos.map((voto) => {
    const diputado = diputadosMap.get(voto.id_diputado);
    const partido = partidosMap.get(voto.id_partido);

    const nombreCompletoDiputado = diputado
      ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
      : null;

    return {
      ...voto,
      diputado: nombreCompletoDiputado,
      partido: partido?.siglas || null,
    };
  });
}


export const actualizarvoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;

    if (!body.idpunto || !body.iddiputado || body.sentido === undefined) {
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
          id_tema_punto_voto: temavotos.id,  
          id_diputado: body.iddiputado,
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

    const municipios = await Municipios.findAll({
      attributes: ['id', ['cabecera', 'name']],
      order: [['cabecera', 'ASC']]
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
      hora_inicio: agendaBody.hora_inicio,
      hora_fin: agendaBody.hora_fin,
      sede_id: agendaBody.sede_id,
      tipo_evento_id: agendaBody.tipo_evento_id
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
      fecha_hora_inicio: body.hora_inicio,
      fecha_hora_fin: body.hora_fin,
      sede_id: body.sede_id,
      tipo_evento_id: body.tipo_evento_id
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


