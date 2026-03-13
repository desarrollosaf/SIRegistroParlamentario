import { Request, Response } from "express";
import Agenda from '../models/agendas';
import Sedes from "../models/sedes";
import AsistenciaVoto from "../models/asistencia_votos";
import VotosPunto from "../models/votos_punto";
import IntegranteComision from "../models/integrante_comisions";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import { Op } from "sequelize";
import TemasPuntosVotos from "../models/temas_puntos_votos";
import PuntosOrden from "../models/puntos_ordens";
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";
import IniciativaEstudio from "../models/iniciativas_estudio";
import TipoEventos from "../models/tipo_eventos";
import Comision from "../models/comisions";
import ComisionUsuario from "../models/comision_usuarios";
import { comisiones } from "../models/init-models";
import AnfitrionAgenda from "../models/anfitrion_agendas";
import PuntosComisiones from "../models/puntos_comisiones";
import TipoAutor from "../models/tipo_autors";
import PuntosPresenta from "../models/puntos_presenta";
import Proponentes from "../models/proponentes";
import CatFunDep from "../models/cat_fun_dep";
import Secretarias from "../models/secretarias";
import Legislatura from "../models/legislaturas";
import Partidos from "../models/partidos";
import MunicipiosAg from "../models/municipiosag";
import Diputado from "../models/diputado";
import ExpedienteEstudiosPuntos from "../models/expedientes_estudio_puntos";
import IniciativasPresenta from "../models/iniciativaspresenta";
import { Sequelize } from "sequelize";
import Decreto from "../models/decreto";


export const cargoDiputados = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('holi')
    const diputados = await VotosPunto.findAll({
        where: {
            id_comision_dip: {
                [Op.ne]: null
            }
        }
    });
    
    for (const dips of diputados) {
       const integrante = await IntegranteLegislatura.findOne({
            where: {
                diputado_id: dips.id_diputado
            }
       });
       const comision = await IntegranteComision.findOne({
            where: {
                comision_id: dips.id_comision_dip,
                integrante_legislatura_id: integrante?.id
            }
       })
       if(comision){
            await dips.update({ id_cargo_dip: comision.tipo_cargo_comision_id });
            console.log('entre comision')
       }

    }


   return res.status(200).json({
      msg: "Exito",
    });
    
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener los eventos",
      error: (error as Error).message
    });
  }
};


export const actualizartodos = async (req: Request, res: Response): Promise<any> => {
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

    const voto = await AsistenciaVoto.findAll({
      where: {
        id_agenda: body.id,
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
        id_agenda: body.id,
        },
      }
    );

    return res.status(200).json({
      msg: "Actualizados correctamente",
      estatus: 200,

    });

  } catch (error) {
    console.error('Error al actualizar toda la asistencia:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      estatus: 500,
      error: (error as Error).message 
    });
  }
};

export const actvototodos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    if (!body.idpunto || body.sentido === undefined) {
      return res.status(400).json({
        msg: "Faltan datos requeridos: idpunto y sentido",
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
        where: { id: body.idpunto } 
      });
      
      if (!punto) {
        return res.status(404).json({
          msg: "No se encontró el punto",
        });
      }
      
      whereCondition = { id_punto: punto.id };
    }
    
    let nuevoSentido: number;
    let nuevoMensaje: string;
    
    switch (body.sentido) {
      case 0:
        nuevoSentido = 0;
        nuevoMensaje = "PENDIENTE";
        break;
      case 1:
        nuevoSentido = 1;
        nuevoMensaje = "A FAVOR";
        break;
      case 2:
        nuevoSentido = 2;
        nuevoMensaje = "ABSTENCIÓN";
        break;
      case 3:
        nuevoSentido = 3;
        nuevoMensaje = "EN CONTRA";
        break;
      default:
        return res.status(400).json({
          msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (A FAVOR), 2 (ABSTENCIÓN) o 3 (EN CONTRA)",
        });
    }
    
    const [cantidadActualizada] = await VotosPunto.update(
      {
        sentido: nuevoSentido,
        mensaje: nuevoMensaje,
      },
      {
        where: whereCondition
      }
    );
    
    if (cantidadActualizada === 0) {
      return res.status(404).json({
        msg: "No se encontraron votos para actualizar",
      });
    }
    
    return res.status(200).json({
      msg: "Voto(s) actualizado(s) correctamente",
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

export const creariniciativa = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    const punto = await PuntosOrden.findOne({
      where: { id: body.punto },
    });
     
    const presentaArray = (Array.isArray(body.id_presenta) 
      ? body.id_presenta 
      : (body.id_presenta || "").split(",")
    )
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .map((item: string) => {
        const [proponenteId, autorId] = item.split('/');
        return {
          proponenteId: parseInt(proponenteId),
          autorId: autorId
        };
      });
    // console.log(presentaArray)
    // return 500
    
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    
    const iniciativa = await IniciativaPuntoOrden.create({
      id_punto: punto.id,
      id_evento: punto.id_evento,
      iniciativa: body.descripcion,
      fecha_votacion: null,
      status: 1,
    });

    for (const item of presentaArray) {
          await IniciativasPresenta.create({
            id_iniciativa: iniciativa.id,
            id_tipo_presenta: item.proponenteId, 
            id_presenta: item.autorId
          });
    }
    
    return res.status(200).json({ 
      message: "Iniciativa creada exitosamente",
    });
    
  } catch (error: any) {
    console.error("Error al crear la iniciativa:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const eliminariniciativa = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const iniciativa = await IniciativaPuntoOrden.findOne({ 
      where: { id }
    });
    if (!iniciativa) {
      return res.status(404).json({ message: "Iniciativa no encontrada" });
    }
    // await VotosPunto.destroy({
    //   where: { id_tema_punto_voto: id }
    // });
    await iniciativa.destroy();
    return res.status(200).json({
      message: "Iniciativa eliminada correctamente",
    });  
  } catch (error: any) {
    console.error("Error al eliminar la iniciativa:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

const procesarPresentan = async (presentan: any[]) => {
  const proponentesUnicos = new Map<string, string>();
  const presentanData: any[] = [];

  for (const p of presentan) {
    const tipoValor = p.tipo_presenta?.valor ?? '';
    let valor = '';

    if (tipoValor === 'Diputadas y Diputados') {
      const dip = await Diputado.findOne({ where: { id: p.id_presenta } });
      valor = `${dip?.apaterno ?? ''} ${dip?.amaterno ?? ''} ${dip?.nombres ?? ''}`.trim();
    } else if (['Mesa Directiva en turno', 'Junta de Coordinación Politica', 'Comisiones Legislativas', 'Diputación Permanente'].includes(tipoValor)) {
      const comi = await Comision.findOne({ where: { id: p.id_presenta } });
      valor = comi?.nombre ?? '';
    } else if (['Ayuntamientos', 'Municipios'].includes(tipoValor)) {
      const muni = await MunicipiosAg.findOne({ where: { id: p.id_presenta } });
      valor = muni?.nombre ?? '';
    } else if (tipoValor === 'Grupo Parlamentario') {
      const partido = await Partidos.findOne({ where: { id: p.id_presenta } });
      valor = partido?.nombre ?? '';
    } else if (tipoValor === 'Legislatura') {
      const leg = await Legislatura.findOne({ where: { id: p.id_presenta } });
      valor = leg?.numero ?? '';
    } else if (tipoValor === 'Secretarías del GEM') {
      const sec = await Secretarias.findOne({ where: { id: p.id_presenta } });
      valor = `${sec?.nombre ?? ''} / ${sec?.titular ?? ''}`;
    } else {
      const cat = await CatFunDep.findOne({ where: { id: p.id_presenta } });
      valor = cat?.nombre_titular ?? '';
    }

    if (!proponentesUnicos.has(tipoValor)) {
      proponentesUnicos.set(tipoValor, tipoValor);
    }
    presentanData.push({ proponente: tipoValor, valor, id_presenta: p.id_presenta });
  }

  return {
    proponentesString: Array.from(proponentesUnicos.keys()).join(", "),
    presentaString: presentanData.map(p => p.valor).join(', ')
  };
};

export const getiniciativas = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const iniciativasRaw = await IniciativaPuntoOrden.findAll({ 
      where: { id_punto: id },
      attributes: ["id", "iniciativa"],
      include: [
        {
          model: IniciativasPresenta,
          as: "presentan",
          attributes: ["id_tipo_presenta", "id_presenta"],
          include: [
            {
              model: Proponentes,
              as: "tipo_presenta",
              attributes: ["id", "valor"]
            }
          ]
        }
      ]
    });

    if (!iniciativasRaw) {
      return res.status(404).json({ message: "No tiene iniciativas" });
    }

    // 👇 Procesar cada iniciativa con sus presentan
    const iniciativas = await Promise.all(
      iniciativasRaw.map(async (ini: any) => {
        const data = ini.toJSON();
        const { proponentesString, presentaString } = data.presentan?.length
          ? await procesarPresentan(data.presentan)
          : { proponentesString: '', presentaString: '' };

        return {
          id: data.id,
          iniciativa: data.iniciativa,
          proponente: proponentesString,
          presenta: presentaString
        };
      })
    );

    return res.status(200).json({
      data: iniciativas,
    });  

  } catch (error: any) {
    console.error("Error al obtener las iniciativas:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const crariniidits = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
   
    const punto = await PuntosOrden.findOne({
      where: { id: body.punto },
    });
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    const iniciativa = await IniciativaPuntoOrden.findOne({
      where: { id: body.iniciativa },
    });

    if(iniciativa){
            await iniciativa.update({ id_punto: punto.id });
    }
    const presentaArray = (Array.isArray(body.id_presenta) 
      ? body.id_presenta 
      : (body.id_presenta || "").split(",")
    )
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .map((item: string) => {
        const [proponenteId, autorId] = item.split('/');
        return {
          proponenteId: parseInt(proponenteId),
          autorId: autorId
        };
      });
    for (const item of presentaArray) {
          await IniciativasPresenta.create({
            id_iniciativa: iniciativa.id,
            id_tipo_presenta: item.proponenteId, 
            id_presenta: item.autorId
          });
    }
    
    return res.status(200).json({ 
      message: "Iniciativa actualizada correctamente",
    });
    
  } catch (error: any) {
    console.error("Error al actualizar la iniciativa:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// export const selectiniciativas = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const iniciativa = await IniciativaPuntoOrden.findAll({ 
//       attributes: ["id", "iniciativa"],
//       include: [
//                   {
//                     model: IniciativasPresenta,
//                     as: "presentan",
//                     attributes: ["id_tipo_presenta", "id_presenta"],
//                     include: [
//                       {
//                         model: Proponentes,
//                         as: "tipo_presenta",
//                         attributes: ["id", "valor"]
//                       }
//                     ]
//                   },
//                   {
//                     model: Agenda,
//                     as: "evento",
//                     attributes: ["id", "fecha"],
//                   }
//                 ]
//     });
//     console.log(iniciativa)
//     return res.status(200).json({
//       data: iniciativa,
//     });  
//   } catch (error: any) {
//     console.error("Error al obtener las iniciativas:", error);
//     return res.status(500).json({ 
//       message: "Error interno del servidor",
//       error: error.message 
//     });
//   }
// };
export const selectiniciativas = async (req: Request, res: Response): Promise<any> => {
  try {
    const iniciativas = await IniciativaPuntoOrden.findAll({ 
      attributes: ["id", "iniciativa"],
      include: [
        {
          model: IniciativasPresenta,
          as: "presentan",
          attributes: ["id_tipo_presenta", "id_presenta"],
          include: [
            {
              model: Proponentes,
              as: "tipo_presenta",
              attributes: ["id", "valor"]
            }
          ]
        },
        {
          model: Agenda,
          as: "evento",
          attributes: ["id", "fecha"],
        }
      ]
    });

    // Procesamos cada iniciativa para construir el label del select
    const data = await Promise.all(
      iniciativas.map(async (ini: any) => {
        const { presentaString } = await procesarPresentan(ini.presentan ?? []);
        
        const fecha = ini.evento?.fecha 
          ? new Date(ini.evento.fecha).toLocaleDateString('es-MX', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            }) 
          : 'Sin fecha';

        return {
          id: ini.id,
          // Formato: "iniciativa \n fecha - presentaString"
          // iniciativa: `${ini.iniciativa}\n${fecha} - ${presentaString}`,
          // Por si necesitas los campos por separado también
          iniciativa: ini.iniciativa,
          datos: `${fecha} - ${presentaString}`,
        };
      })
    );

    return res.status(200).json({ data });

  } catch (error: any) {
    console.error("Error al obtener las iniciativas:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

const formatearFecha = (fecha: string): string => {
  if (!fecha) return '';
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const date = new Date(fecha);
  const dia = date.getUTCDate();
  const mes = meses[date.getUTCMonth()];
  const anio = date.getUTCFullYear();
  return `${dia} de ${mes} de ${anio}`;
};

const getAnfitriones = async (eventoId: string, tipoEventoNombre: string) => {
  if (!eventoId || tipoEventoNombre === 'Sesión') return {};

  const anfitriones = await AnfitrionAgenda.findAll({
    where: { agenda_id: eventoId },
    attributes: ["autor_id"],
    raw: true
  });

  const comisionIds = anfitriones.map((a: any) => a.autor_id).filter(Boolean);
  if (comisionIds.length === 0) return { comisiones: null };

  const comisiones = await Comision.findAll({
    where: { id: comisionIds },
    attributes: ['nombre'],
    raw: true,
  });

  return {
    comisiones: comisiones.map((c: any) => c.nombre).join(', ')
  };
};

const getComisionesTurnado = async (puntoId: string) => {
  if (!puntoId) return { turnado: false, comisiones_turnado: null };

  const puntosComisiones = await PuntosComisiones.findAll({
    where: { id_punto: puntoId },
    attributes: ["id_comision"],
    raw: true
  });

  if (puntosComisiones.length === 0) return { turnado: false, comisiones_turnado: null };

  const idsRaw = (puntosComisiones[0] as any).id_comision || '';
  const comisionIds = idsRaw
    .replace(/[\[\]]/g, '')
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean);

  if (comisionIds.length === 0) return { turnado: false, comisiones_turnado: null };

  const comisiones = await Comision.findAll({
    where: { id: comisionIds },
    attributes: ['nombre'],
    raw: true,
  });

  return {
    turnado: true,
    comisiones_turnado: comisiones.map((c: any) => c.nombre).join(', ')
  };
};

export const getifnini = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const iniciativas = await IniciativaPuntoOrden.findAll({
      where: { id: id },
      attributes: ["id", "iniciativa", "createdAt", "id_punto","expediente","path_doc"],
      include: [
        {
          model: PuntosOrden,
          as: 'punto',
          attributes: ["id", "punto", "nopunto","tribuna","dispensa"],
          include: [
            {
              model: IniciativaEstudio,
              as: 'estudio',
              attributes: ["id", "status", "createdAt", "punto_origen_id","punto_destino_id","type"], // 👈 cambió de id_punto_evento
              required: false,
              where: {
                type: 1
              },
              include: [
                {
                  model: PuntosOrden,
                  as: 'iniciativa', // 👈 cambió de 'puntoEvento'
                  attributes: ["id", "punto", "nopunto","tribuna","dispensa"],
                  include: [
                    {
                      model: Agenda,
                      as: 'evento',
                      attributes: ["id", "fecha", "descripcion", "liga"],
                      include: [
                        {
                          model: TipoEventos,
                          as: 'tipoevento',
                          attributes: ["nombre"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: ExpedienteEstudiosPuntos,
          as: 'expedienteturno',
          attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
          include: [
            {
              model: IniciativaEstudio,
              as: 'estudio',
              attributes: ["id", "status", "createdAt", "punto_origen_id","punto_destino_id","type"], // 👈 cambió de id_punto_evento
              required: false,
              include: [
                {
                  model: PuntosOrden,
                  as: 'iniciativa', // 👈 cambió de 'puntoEvento'
                  attributes: ["id", "punto", "nopunto","tribuna","dispensa"],
                  include: [
                    {
                      model: Agenda,
                      as: 'evento',
                      attributes: ["id", "fecha", "descripcion", "liga"],
                      include: [
                        {
                          model: TipoEventos,
                          as: 'tipoevento',
                          attributes: ["nombre"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Agenda,
          as: 'evento',
          attributes: ["id", "fecha", "descripcion", "liga"],
          include: [
            {
              model: TipoEventos,
              as: 'tipoevento',
              attributes: ["nombre"]
            }
          ]
        },
        {
          model: IniciativasPresenta,
            as: "presentan",
            attributes: ["id_tipo_presenta", "id_presenta"],
              include: [
                {
                  model: Proponentes,
                  as: "tipo_presenta",
                  attributes: ["id", "valor"]
                }
              ]
        },
        {
          model: Decreto,
            as: "decretos",
            attributes: ["nombre_decreto", "decreto"],
  
        }
      ]
    });

    let proponentesString = '';
    let presentaString = '';
    

    const presentanIniciativa = iniciativas[0]?.presentan ?? [];
    let inidoc = iniciativas[0]?.path_doc;
    
    if (presentanIniciativa.length > 0) {
      const resultado = await procesarPresentan(presentanIniciativa);
      proponentesString = resultado.proponentesString;
      presentaString = resultado.presentaString;
    }
    
    const trazaIniciativas = await Promise.all(
      iniciativas.map(async (iniciativa) => {
        const data = iniciativa.toJSON();
        let decretos = data.decretos ?? [];

        console.log("DATA INICIATIVA:");
        console.log(data);

        const todosEstudios = [
          ...(Array.isArray(data.punto?.estudio) ? data.punto.estudio : []),
          ...(Array.isArray(data.expedienteturno)
            ? data.expedienteturno.flatMap((exp: any) =>
                Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : []
              )
            : [])
        ];

        console.log("TODOS ESTUDIOS:");
        console.log(todosEstudios);

        const fuenteEstudios = todosEstudios.filter(
          (e: any, index: number, self: any[]) =>
            index === self.findIndex((x: any) => x.id === e.id)
        );

        const estudios       = fuenteEstudios.filter((e: any) => e.status === "1");
        const dictamenes     = fuenteEstudios.filter((e: any) => e.status === "2");
        const rechazadocomi  = fuenteEstudios.filter((e: any) => e.status === "4");
        const rechazosesion  = fuenteEstudios.filter((e: any) => e.status === "5");

        // -----------------------------
        // NUEVO: buscar cierres por varios puntos
        // -----------------------------
        const posiblesPuntosIds = [
          data.punto?.id,
          ...fuenteEstudios.map((e: any) => e.punto_destino_id).filter(Boolean)
        ];

        const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds)];

        console.log("POSIBLES PUNTOS PARA CIERRE:");
        console.log(posiblesPuntosUnicos);

        // 1. Buscar si alguno de esos puntos está en expedientes_estudio_puntos
        const expedientesRelacionados = await ExpedienteEstudiosPuntos.findAll({
          where: {
            punto_origen_sesion_id: {
              [Op.in]: posiblesPuntosUnicos
            }
          },
          attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
        });

        console.log("EXPEDIENTES RELACIONADOS:");
        console.log(expedientesRelacionados.map((e: any) => e.toJSON()));

        // 2. Sacar los expediente_id encontrados
        const expedienteIds = [
          ...new Set(
            expedientesRelacionados
              .map((e: any) => e.expediente_id)
              .filter(Boolean)
          )
        ];

        console.log("EXPEDIENTE IDS:");
        console.log(expedienteIds);

        // 3. Buscar cierres:
        //    a) directos por punto_origen_id = 201, etc.
        //    b) o por expediente_id encontrado = 49, etc.
        const cierresDB = await IniciativaEstudio.findAll({
          where: {
            status: "3",
            [Op.or]: [
              {
                punto_origen_id: {
                  [Op.in]: posiblesPuntosUnicos
                },
                type: 1
              },
              {
                punto_origen_id: {
                  [Op.in]: expedienteIds
                },
                type: 2
              }
            ]
          },
          include: [
            {
              model: PuntosOrden,
              as: "iniciativa",
              attributes: ["id", "punto", "nopunto", "tribuna"],
              include: [
                {
                  model: Agenda,
                  as: "evento",
                  attributes: ["id", "fecha", "descripcion", "liga"],
                  include: [
                    {
                      model: TipoEventos,
                      as: "tipoevento",
                      attributes: ["nombre"]
                    }
                  ]
                }
              ]
            }
          ]
        });

        console.log("CIERRES DB:");
        console.log(cierresDB.map((c: any) => c.toJSON()));

        // 4. Unir con los que ya venían en fuenteEstudios
        const cierresMerge = [
          ...fuenteEstudios.filter((e: any) => e.status === "3"),
          ...cierresDB.map((c: any) => c.toJSON())
        ];

        // 5. Quitar duplicados por id
        const cierres = cierresMerge.filter(
          (e: any, index: number, self: any[]) =>
            index === self.findIndex((x: any) => x.id === e.id)
        );

        console.log("CIERRES FINALES:");
        console.log(cierres);

        // -----------------------------
        // resto de tu lógica
        // -----------------------------
        const anfitrionesNacio = await getAnfitriones(
          data.evento?.id,
          data.evento?.tipoevento?.nombre
        );

        const tribunainicio = await Diputado.findOne({
          where: { id: data.punto?.tribuna },
        });

        const tribuna = tribunainicio
          ? [tribunainicio.nombres, tribunainicio.apaterno, tribunainicio.amaterno]
              .filter(Boolean)
              .join(" ")
          : null;

        const turnadoInfo = await getComisionesTurnado(data.punto?.id);

        const estudiosConInfo = await Promise.all(
          estudios.map(async (e: any) => {
            const eventoEstudio = e.iniciativa?.evento;
            const anfitriones = await getAnfitriones(
              eventoEstudio?.id,
              eventoEstudio?.tipoevento?.nombre
            );

            return {
              id: e.id,
              evento: eventoEstudio?.id,
              fecha: formatearFecha(e.createdAt),
              tipo_evento: eventoEstudio?.tipoevento?.nombre,
              fecha_evento: formatearFecha(eventoEstudio?.fecha),
              liga: eventoEstudio?.liga,
              descripcion_evento: eventoEstudio?.descripcion,
              numpunto: e.iniciativa?.nopunto,
              punto: e.iniciativa?.punto,
              ...anfitriones
            };
          })
        );

        const dictamenesConInfo = await Promise.all(
          dictamenes.map(async (d: any) => {
            const eventoDict = d.iniciativa?.evento;
            const anfitriones = await getAnfitriones(
              eventoDict?.id,
              eventoDict?.tipoevento?.nombre
            );

            return {
              id: d.id,
              evento: eventoDict?.id,
              fecha: formatearFecha(d.createdAt),
              tipo_evento: eventoDict?.tipoevento?.nombre,
              fecha_evento: formatearFecha(eventoDict?.fecha),
              liga: eventoDict?.liga,
              votacionid: d.iniciativa?.id,
              descripcion_evento: eventoDict?.descripcion,
              numpunto: d.iniciativa?.nopunto,
              punto: d.iniciativa?.punto,
              ...anfitriones
            };
          })
        );

        const cierresConInfo = await Promise.all(
          cierres.map(async (c: any) => {
            const eventoCierre = c.iniciativa?.evento;

            const tribuna1 = c.iniciativa?.tribuna
              ? await Diputado.findOne({
                  where: { id: c.iniciativa.tribuna },
                })
              : null;

            const tribuna = tribuna1
              ? [tribuna1.nombres, tribuna1.apaterno, tribuna1.amaterno]
                  .filter(Boolean)
                  .join(" ")
              : null;

            return {
              id: c.id,
              punto_origen_id: c.punto_origen_id,
              punto_destino_id: c.punto_destino_id,
              evento: eventoCierre?.id,
              tipo_evento: eventoCierre?.tipoevento?.nombre,
              fecha: formatearFecha(eventoCierre?.fecha),
              descripcion_evento: eventoCierre?.descripcion,
              liga: eventoCierre?.liga,
              votacionid: c.iniciativa?.id,
              numpunto: c.iniciativa?.nopunto,
              punto: c.iniciativa?.punto,
              tribuna,
            };
          })
        );

        console.log("CIERRE INFO:");
        console.log(cierresConInfo);

        const ReSesion = await Promise.all(
          rechazosesion.map(async (s: any) => {
            const eventoCierre = s.iniciativa?.evento;

            const tribuna1 = await Diputado.findOne({
              where: { id: s.iniciativa?.tribuna },
            });

            const tribuna = tribuna1
              ? [tribuna1.nombres, tribuna1.apaterno, tribuna1.amaterno]
                  .filter(Boolean)
                  .join(" ")
              : null;

            return {
              evento: eventoCierre?.id,
              tipo_evento: eventoCierre?.tipoevento?.nombre,
              fecha: formatearFecha(eventoCierre?.fecha),
              descripcion_evento: eventoCierre?.descripcion,
              liga: eventoCierre?.liga,
              votacionid: s.iniciativa?.id,
              numpunto: s.iniciativa?.nopunto,
              punto: s.iniciativa?.punto,
              tribuna,
            };
          })
        );

        return {
          nacio: {
            dispensa: data.punto?.dispensa,
            evento: data.evento?.id,
            tipo_evento: data.evento?.tipoevento?.nombre,
            fecha: formatearFecha(data.evento?.fecha),
            descripcion_evento: data.evento?.descripcion,
            numpunto: data.punto?.nopunto,
            punto: data.punto?.punto,
            votacionid: data.punto?.id,
            liga: data.evento?.liga,
            tribuna,
            ...turnadoInfo,
            ...anfitrionesNacio
          },
          estudio: estudiosConInfo,
          dictamen: dictamenesConInfo,
          cierre: cierresConInfo.length > 0 ? cierresConInfo[0] : null,
          rechazadose: ReSesion,
          decretos: decretos.map((d: any) => ({
                nombre_decreto: d.nombre_decreto,
                decreto: d.decreto,
              })),
        };
      })
    );
    // console.log(trazaIniciativas);
    // return 500;
    return res.status(200).json({
      inidoc,
      proponentesString,
      presentaString,
      data: trazaIniciativas,
      
    });

  } catch (error: any) {
    console.error("Error al obtener las iniciativas:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const terminarvotacion = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      
      const iniestudio = await IniciativaEstudio.findOne({
        where: { punto_destino_id: id },
      })
      console.log("Lo encontreeeeeeeeeeeeeeeeeeeeeeeee:", iniestudio)
      if (!iniestudio) {
        return res.status(404).json({ message: "No tiene ninguna iniciativa" });
      }

      const punto = await PuntosOrden.findOne({
        where: { id: id },
        include: [
           {
              model: Agenda,
              as: 'evento',
              include: [
                {
                  model: TipoEventos,
                  as: 'tipoevento', 
                  attributes: ['nombre']
                }
              ]
            }
        ]
      }) as any; 
      
      const votos = await VotosPunto.findAll({
        where: { 
          id_punto: id,
          id_tema_punto_voto: null
        }
      })
      
      if(votos.length > 0 && punto){
        let condicion: number;
        const totalVotos = votos.length;
        const votosAFavor = votos.filter((v: any) => v.sentido === 1).length;
        const mayoria = Math.floor(totalVotos / 2) + 1;
        const aprobado = votosAFavor >= mayoria;
           
        if(punto.evento.tipoevento.nombre == "Comisión"){
          condicion = aprobado ? 2 : 4;
        } else {
          condicion = aprobado ? 3 : 5;
        }

        await iniestudio.update({ status: condicion });
        return res.status(200).json("actualizado");
      }

      return res.status(404).json({ message: "Sin votos" });

    } catch (error) {
      console.error('Error al terminar la votacion:', error);
      return res.status(500).json({ 
        msg: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

export const deleteEvento = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const puntos = await PuntosOrden.findAll({
      where: { id_evento: id },
      attributes: ['id']
    });

    const puntoIds = puntos.map((p: any) => p.id);

    if (puntoIds.length > 0) {
      await IniciativaPuntoOrden.destroy({ where: { id_punto: puntoIds } });
      await IniciativaEstudio.destroy({ where: { punto_origen_id: puntoIds } });
      await IniciativaEstudio.destroy({ where: { punto_destino_id: puntoIds } });
      await PuntosPresenta.destroy({ where: { id_punto: puntoIds } });
      await PuntosComisiones.destroy({ where: { id_punto: puntoIds } });
      await PuntosOrden.destroy({ where: { id_evento: id } });
    }
    await AnfitrionAgenda.destroy({ where: { agenda_id: id } });
    const deleted = await Agenda.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    return res.status(200).json({ message: "Evento eliminado correctamente" });

  } catch (error: any) {
    console.error("Error al eliminar el evento:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const exporpuntos = async (req: Request, res: Response) => {
  try {
    const eventos = await Agenda.findAll({  // 👈 findAll
      where: { tipo_evento_id: "0e772516-bbc2-402f-afa0-022489752d33" },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({ msg: "Eventos no encontrados" });
    }

    const filas: any[] = [];

    for (const evento of eventos) {
      // Obtener comisiones del evento
      const anfitriones = await AnfitrionAgenda.findAll({
        where: { agenda_id: evento.id },
        attributes: ["autor_id"],
        raw: true
      });

      const comisionIds = anfitriones.map((a: any) => a.autor_id).filter(Boolean);
      let comisiones: any[] = [];

      if (comisionIds.length > 0) {
        comisiones = await Comision.findAll({
          where: { id: comisionIds },
          attributes: ["id", "nombre"],
          raw: true
        });
      }

      const comisionesTexto = comisiones.map((c: any) => c.nombre).join(", ");

      // Obtener puntos del evento
      const puntosRaw = await PuntosOrden.findAll({
        where: { id_evento: evento.id },  // 👈 ahora sí está en scope
        order: [['nopunto', 'ASC']],
      });

      // Una fila por cada punto
      for (const punto of puntosRaw) {
        filas.push({
          id_evento: evento.id,
          fecha_evento: evento.fecha,
          id_punto: punto.id,
          no_punto: punto.nopunto,
          texto: punto.punto,
          comisiones: comisionesTexto
        });
      }
    }

    // Generar Excel con ExcelJS
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Puntos');

    // Encabezados
    sheet.columns = [
      { header: 'ID Evento',    key: 'id_evento',    width: 40 },
      { header: 'Fecha Evento', key: 'fecha_evento', width: 20 },
      { header: 'ID Punto',     key: 'id_punto',     width: 40 },
      { header: 'No. Punto',    key: 'no_punto',     width: 12 },
      { header: 'Texto',        key: 'texto',        width: 60 },
      { header: 'Comisiones',   key: 'comisiones',   width: 50 },
    ];

    // Estilo encabezados
    sheet.getRow(1).eachCell((cell: any) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Agregar filas
    filas.forEach(fila => sheet.addRow(fila));

    // Responder con el archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=puntos.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error al exportar puntos:", error);
    return res.status(500).json({
      msg: "Error al generar el archivo Excel",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};
