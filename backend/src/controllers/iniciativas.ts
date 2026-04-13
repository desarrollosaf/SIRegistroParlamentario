import { Request, Response } from "express";
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";
import IniciativasPresenta from "../models/iniciativaspresenta";
import Proponentes from "../models/proponentes";
import Diputado from "../models/diputado";
import Comision from "../models/comisions";
import MunicipiosAg from "../models/municipiosag";
import Partidos from "../models/partidos";
import Legislatura from "../models/legislaturas";
import Secretarias from "../models/secretarias";
import CatFunDep from "../models/cat_fun_dep";
import Agenda from "../models/agendas";
import TipoEventos from "../models/tipo_eventos";
import IniciativaEstudio from "../models/iniciativas_estudio";
import PuntosOrden from "../models/puntos_ordens";
import ExpedienteEstudiosPuntos from "../models/expedientes_estudio_puntos";
import PuntosComisiones from "../models/puntos_comisiones";
import { Op } from "sequelize";
import Decreto from "../models/decreto";
import path from "path";
import fs from "fs";
import TemasPuntosVotos from "../models/temas_puntos_votos";
import VotosPunto from "../models/votos_punto";
import AsistenciaVoto from "../models/asistencia_votos";
import TipoCargoComision from "../models/tipo_cargo_comisions";
import Sedes from "../models/sedes";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import AnfitrionAgenda from "../models/anfitrion_agendas";
import IntegranteComision from "../models/integrante_comisions";


type ReporteBaseItem = {
  no: number;
  id: string;
//   autor: string;
//   autor_detalle: string;
  iniciativa: string;
  materia: string;
  presentac: string;
  fecha_evento_raw: string | null;
  comisiones: string;
  expedicion: string;
  observac: string;
//   diputado: string;
//   grupo_parlamentario: string;
//   diputado_ids: string[];
//   grupo_parlamentario_ids: string[];
  periodo: string;
  tipo: number | null;
  publico: number | null;
};


export const getiniciativas = async (req: Request, res: Response): Promise<any> => {
  try {
    const iniciativasRaw = await construirReporteBase();

    if (!iniciativasRaw) {
      return res.status(404).json({ message: "No tiene iniciativas" });
    } 

    return res.status(200).json({
      data: iniciativasRaw,
    });  

  } catch (error: any) {
    console.error("Error al obtener las iniciativas:", error);
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

const obtenerIniciativasBase = async () => {
  return await IniciativaPuntoOrden.findAll({
    attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida","tipo", "publico"],
    include: [
      {
        model: PuntosOrden,
        as: "punto",
        attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
        include: [
          {
            model: IniciativaEstudio,
            as: "estudio",
            attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
            required: false,
            where: { type: 1 },
            include: [
              {
                model: PuntosOrden,
                as: "iniciativa",
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
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
          }
        ]
      },
      {
        model: ExpedienteEstudiosPuntos,
        as: "expedienteturno",
        attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
        include: [
          {
            model: IniciativaEstudio,
            as: "estudio",
            attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
            required: false,
            include: [
              {
                model: PuntosOrden,
                as: "iniciativa",
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
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
          }
        ]
      },
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
    ],
    order: [["createdAt", "ASC"]]
  });
};

const construirReporteBase = async (): Promise<ReporteBaseItem[]> => {
  const iniciativas = await obtenerIniciativasBase();

  const reporte = await Promise.all(
    iniciativas.map(async (iniciativa, index) => {
      const data: any = iniciativa.toJSON();
    //   const {
    //     proponentesString,
    //     presentaString,
    //     diputados,
    //     diputadoIds,
    //     gruposParlamentarios,
    //     grupoParlamentarioIds
    //   } = await procesarPresentan(data.id);
          
      const todosEstudios = [
        ...(Array.isArray(data.punto?.estudio) ? data.punto.estudio : []),
        ...(Array.isArray(data.expedienteturno)
          ? data.expedienteturno.flatMap((exp: any) =>
              Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : []
            )
          : [])
      ];

      const fuenteEstudios = deduplicarPorId(todosEstudios);

      const estudios = fuenteEstudios.filter((e: any) => e.status === "1");
      const dictamenes = fuenteEstudios.filter((e: any) => e.status === "2");
      const rechazadocomi = fuenteEstudios.filter((e: any) => e.status === "4");
      const rechazosesion = fuenteEstudios.filter((e: any) => e.status === "5");
      const dispensa = String(data.punto?.dispensa) === "1";
      const precluida = String(data.precluida) === "1";

      const posiblesPuntosIds = [
        data.punto?.id,
        ...fuenteEstudios.map((e: any) => e.punto_destino_id).filter(Boolean)
      ];

      const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds)];

      const expedientesRelacionados = await ExpedienteEstudiosPuntos.findAll({
        where: {
          punto_origen_sesion_id: {
            [Op.in]: posiblesPuntosUnicos
          }
        },
        attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
        raw: true
      });

      const expedienteIds = [
        ...new Set(
          expedientesRelacionados
            .map((e: any) => e.expediente_id)
            .filter(Boolean)
        )
      ];

      const whereCierres: any = {
        status: "3"
      };

      if (posiblesPuntosUnicos.length > 0 || expedienteIds.length > 0) {
        whereCierres[Op.or] = [];

        if (posiblesPuntosUnicos.length > 0) {
          whereCierres[Op.or].push({
            punto_origen_id: {
              [Op.in]: posiblesPuntosUnicos
            }
          });
        }

        if (expedienteIds.length > 0) {
          whereCierres[Op.or].push({
            punto_origen_id: {
              [Op.in]: expedienteIds
            }
          });
        }
      }

      const cierresDB =
        whereCierres[Op.or]?.length > 0
          ? await IniciativaEstudio.findAll({
              where: whereCierres,
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
            })
          : [];

      const cierresMerge = [
        ...fuenteEstudios.filter((e: any) => e.status === "3"),
        ...cierresDB.map((c: any) => c.toJSON())
      ];

      const cierres = deduplicarPorId(cierresMerge);
      const cierrePrincipal = cierres.length > 0 ? cierres[0] : null;

      let observacion = "En estudio";
      if(precluida){
        observacion = "Precluida";

      }else if(dispensa) {
        observacion = "Aprobada";
        
      }else{

        if (cierrePrincipal) {
          observacion = "Aprobada";
        } else if (rechazosesion.length > 0) {
          observacion = "Rechazada en sesión";
        } else if (rechazadocomi.length > 0) {
          observacion = "Rechazada en comisión";
        } else if (dictamenes.length > 0) {
          observacion = "En estudio";
        } else if (estudios.length > 0) {
          observacion = "En estudio";
        }


      }  

      

      const turnadoInfo = await getComisionesTurnado(data.punto?.id);
      const fechaExpedicion =
        cierrePrincipal?.iniciativa?.evento?.fecha
          ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
          : "-";

    //   const diputado = diputados.length > 0 ? diputados.join(", ") : "-";
    //   const grupoParlamentario = gruposParlamentarios.length > 0 ? gruposParlamentarios.join(", ") : "-";
      const fechaEventoRaw = data.evento?.fecha ?? null;

      return {
        no: index + 1,
        id: normalizarTexto(data.id),
        // autor: normalizarTexto(proponentesString),
        // autor_detalle: normalizarTexto(presentaString),
        iniciativa: normalizarTexto(data.iniciativa),
        materia: normalizarTexto(data.punto?.punto),
        presentac: formatearFechaCorta(fechaEventoRaw),
        fecha_evento_raw: fechaEventoRaw,
        comisiones: normalizarTexto(turnadoInfo.comisiones_turnado),
        expedicion: fechaExpedicion,
        observac: observacion,
        // diputado,
        // grupo_parlamentario: grupoParlamentario,
        // diputado_ids: diputadoIds,
        // grupo_parlamentario_ids: grupoParlamentarioIds,
        periodo: obtenerPeriodo(fechaEventoRaw),
        tipo: data.tipo,
        publico: data.publico,

      };
    })
  );
  return reporte;

};

const formatearFechaCorta = (fecha?: string | null): string => {
  if (!fecha) return "-";

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const date = new Date(fecha);

  const dia = String(date.getUTCDate()).padStart(2, "0");
  const mes = meses[date.getUTCMonth()];
  const anio = String(date.getUTCFullYear()).slice(-2);

  return `${dia}-${mes}-${anio}`;
};

const obtenerPeriodo = (fecha?: string | null): string => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  const anio = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${anio}-${mes}`;
};

const normalizarTexto = (valor: any): string => {
  if (!valor) return "-";
  return String(valor).trim() || "-";
};

const getComisionesTurnado = async (puntoId: string) => {
  if (!puntoId) {
    return { turnado: false, comisiones_turnado: null };
  }

  const puntosComisiones = await PuntosComisiones.findAll({
    where: { id_punto: puntoId },
    attributes: ["id_comision"],
    raw: true
  });

  if (puntosComisiones.length === 0) {
    return { turnado: false, comisiones_turnado: null };
  }

  const todosIds = puntosComisiones
    .map((item: any) => item.id_comision || "")
    .join(",");

  const comisionIds = todosIds
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((id: string) => id.trim())
    .filter(Boolean);

  const comisionIdsUnicos = [...new Set(comisionIds)];

  if (comisionIdsUnicos.length === 0) {
    return { turnado: false, comisiones_turnado: null };
  }

  const comisiones = await Comision.findAll({
    where: { id: comisionIdsUnicos },
    attributes: ["nombre"],
    raw: true
  });

  return {
    turnado: true,
    comisiones_turnado: comisiones.map((c: any) => c.nombre).join(", ")
  };
};

const deduplicarPorId = (items: any[]) => {
  return items.filter(
    (e: any, index: number, self: any[]) =>
      index === self.findIndex((x: any) => x.id === e.id)
  );
};



/////////////////////////////////////////////////////////////////// funciones para los decretos 

export const guardardecreto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    const file = req.file;

    // 👇 Consultas el tipo de la iniciativa
    const iniciativa = await IniciativaPuntoOrden.findOne({
      where: { id: body.id_iniciativa },
      attributes: ["tipo"]
    });

    const tipoNombre: Record<string, string> = {
      "1": "decreto",
      "2": "acuerdo",
      "3": "acuerdo"
    };

    const prefijo = tipoNombre[iniciativa?.tipo ?? "1"] ?? "decreto";

    // 👇 Renombras el archivo ya guardado
    let pathDoc = null;
    if (file) {
      const ext = path.extname(file.originalname);
      const nuevoNombre = `${prefijo}_${crypto.randomUUID()}${ext}`;
      const dirBase = path.join(process.cwd(), "storage/decretos");
      
      fs.renameSync(
        path.join(dirBase, file.filename),    
        path.join(dirBase, nuevoNombre)            
      );

      pathDoc = `storage/decretos/${nuevoNombre}`;
    }

    await Decreto.create({
      nombre_decreto: body.nombre_decreto,
      decreto: pathDoc,
      id_iniciativa: body.id_iniciativa
    });

    return res.status(201).json({
      message: "Decreto creado correctamente",
    });

  } catch (error: any) {
    console.error("Error al guardar el decreto:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const getdecretos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const decretetos = await Decreto.findAll({ 
      where: { id_iniciativa: id },
      attributes: ["id", "nombre_decreto","decreto","id_iniciativa"],
    });

    if (!decretetos) {
      return res.status(404).json({ message: "No tiene decretos" });
    }

    return res.status(200).json({
      data: decretetos,
    });  

  } catch (error: any) {
    console.error("Error al obtener los decretos:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const eliminardecreto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const decreto = await Decreto.findOne({ 
      where: { id }
    });
    if (!decreto) {
      return res.status(404).json({ message: "decreto no encontrado" });
    }
    await decreto.destroy();
    return res.status(200).json({
      message: "Decreto eliminado correctamente",
    });  
  } catch (error: any) {
    console.error("Error al eliminar el decreto:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const actualizarIniciativa = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { publico } = req.body;

    await IniciativaPuntoOrden.update(
      { publico },
      { where: { id } }
    );

    return res.status(200).json({ message: 'Actualizado correctamente' });

  } catch (error: any) {
    console.error('Error al actualizar iniciativa:', error);
    return res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

export const publicarAgenda = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { publico } = req.body;

    await Agenda.update(
      { publico },
      { where: { id } }
    );

    return res.status(200).json({ message: 'Actualizado correctamente' });

  } catch (error: any) {
    console.error('Error al actualizar iniciativa:', error);
    return res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

export const eliminarAsistencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 
    const total = await AsistenciaVoto.count({
      where: { id_agenda: id, deletedAt: null },
    });
 
    if (total === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No hay registros de asistencia para este evento',
      });
    }
    await AsistenciaVoto.destroy({
      where: { id_agenda: id },
    });
 
    return res.status(200).json({
      ok: true,
      msg: `Se eliminaron ${total} registros de asistencia`,
      eliminados: total,
    });
 
  } catch (error) {
    console.error('Error eliminarAsistencia:', error);
    return res.status(500).json({ ok: false, msg: 'Error al eliminar la asistencia' });
  }
};
 
export const eliminarVotacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 
    let totalVotos = 0;
 
    // ── 1. Votos de temas directos del evento (sin punto) 
    const temasEvento = await TemasPuntosVotos.findAll({
      where: { id_evento: id, deletedAt: null },
    });
 
    for (const tema of temasEvento) {
      const eliminados = await VotosPunto.destroy({
        where: { id_tema_punto_voto: tema.id },
      });
      totalVotos += eliminados;
    }
 
    // ── 2. Puntos del evento 
    const puntos = await PuntosOrden.findAll({
      where: { id_evento: id, deletedAt: null },
    });
 
    for (const punto of puntos) {
      // 2a. Votos directos del punto (sin tema)
      const votosPuntoDirecto = await VotosPunto.destroy({
        where: { id_punto: punto.id },
      });
      totalVotos += votosPuntoDirecto;
 
      // 2b. Temas del punto → sus votos
      const temasPunto = await TemasPuntosVotos.findAll({
        where: { id_punto: punto.id, deletedAt: null },
      });
 
      for (const tema of temasPunto) {
        const votosTema = await VotosPunto.destroy({
          where: { id_tema_punto_voto: tema.id },
        });
        totalVotos += votosTema;
      }
    }
 
    return res.status(200).json({
      ok: true,
      msg: 'Votación eliminada correctamente',
      votos_eliminados: totalVotos,
    });
 
  } catch (error) {
    console.error('Error eliminarVotacion:', error);
    return res.status(500).json({ ok: false, msg: 'Error al eliminar la votación' });
  }
};

const getVotacionPorPunto = async (idPunto: string, res: Response): Promise<Response> => {
  const punto = await PuntosOrden.findOne({
    where: { id: idPunto },
    attributes: ['id', 'nopunto', 'punto', 'id_evento'],
  });
 
  if (!punto) {
    return res.status(404).json({ msg: 'Punto no encontrado' });
  }
 
  const evento = await Agenda.findOne({
    where: { id: punto.id_evento },
    include: [
      { model: Sedes,       as: 'sede',       attributes: ['id', 'sede'] },
      { model: TipoEventos, as: 'tipoevento', attributes: ['id', 'nombre'] },
    ],
  });
 
  if (!evento) {
    return res.status(404).json({ msg: 'Evento no encontrado' });
  }
 
  const esSesion   = evento.tipoevento?.nombre === 'Sesión';
  const tipoEvento = esSesion ? 'sesion' : 'comision';
  const tipovento  = esSesion ? 1 : 2;
 
  let mensajeRespuesta = 'Punto con votos existentes';
 
  const votosExistentes = await VotosPunto.findOne({ where: { id_punto: idPunto } });
 
  if (!votosExistentes) {
    const listadoDiputados = await obtenerListadoDiputados(evento);
    const votospunto = listadoDiputados.map((dip: any) => ({
      sentido:            0,
      mensaje:            'PENDIENTE',
      id_punto:           idPunto,
      id_tema_punto_voto: null,
      id_diputado:        dip.id_diputado,
      id_partido:         dip.id_partido,
      id_comision_dip:    dip.comision_dip_id,
      id_cargo_dip:       dip.id_cargo_dip,
    }));
    await VotosPunto.bulkCreate(votospunto);
    mensajeRespuesta = 'Votacion creada correctamente';
  }
 
  const integrantes = await obtenerResultadosVotacionOptimizado(
    null,
    idPunto,
    tipoEvento
  );
 
  return res.status(200).json({
    msg: mensajeRespuesta,
    // ── Información del punto destino (donde se votó) ──
    punto: {
      id:      punto.id,
      nopunto: punto.nopunto,
      punto:   punto.punto,
    },
    evento,
    integrantes,
    tipovento,
  });
};
 
const getPuntoDestino = async (
  idPunto: string,
  status: '2' | '3'
): Promise<string | null> => {
 
  // Type 1: búsqueda directa
  const estudioType1 = await IniciativaEstudio.findOne({
    where: { status, punto_origen_id: idPunto, type: 1 },
    order: [['createdAt', 'DESC']],
  });
 
  if (estudioType1?.punto_destino_id) {
    return String(estudioType1.punto_destino_id);
  }
 
  // Type 2: búsqueda por expediente
  const expedientes = await ExpedienteEstudiosPuntos.findAll({
    where: { punto_origen_sesion_id: idPunto },
    attributes: ['expediente_id'],
  });
 
  const expedienteIds = [
    ...new Set(expedientes.map((e: any) => e.expediente_id).filter(Boolean))
  ];
 
  if (expedienteIds.length === 0) return null;
 
  const estudioType2 = await IniciativaEstudio.findOne({
    where: {
      status,
      type: 2,
      punto_origen_id: { [Op.in]: expedienteIds },
    },
    order: [['createdAt', 'DESC']],
  });
 
  if (estudioType2?.punto_destino_id) {
    return String(estudioType2.punto_destino_id);
  }
 
  return null;
};
 
const getIdPuntoDeIniciativa = async (idIniciativa: string): Promise<string | null> => {
  const iniciativa = await IniciativaPuntoOrden.findOne({
    where: { id: idIniciativa },
    attributes: ['id_punto'],
  });
  return iniciativa?.id_punto ? String(iniciativa.id_punto) : null;
};
 
export const getVotosCierre = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // 1. Obtener el punto de la iniciativa
    const iniciativa = await IniciativaPuntoOrden.findOne({
      where: { id },
      attributes: ['id_punto'],
    });

    if (!iniciativa?.id_punto) {
      return res.status(404).json({ msg: 'No se encontró el punto de la iniciativa' });
    }

    const idPunto = String(iniciativa.id_punto);

    // 2. Determinar el punto a usar para la votación
    const puntoOrigen = await PuntosOrden.findOne({
      where: { id: idPunto },
      attributes: ['id', 'dispensa'],
    });

    if (!puntoOrigen) {
      return res.status(404).json({ msg: 'Punto origen no encontrado' });
    }

    const tieneDispensa = puntoOrigen.dispensa === 1;

    let puntoDestino: string;

    if (tieneDispensa) {
      // Si tiene dispensa, se votó en el mismo punto
      puntoDestino = idPunto;
    } else {
      // Si no tiene dispensa, buscar el punto destino (cierre)
      const destinoEncontrado = await getPuntoDestino(idPunto, '3');
      if (!destinoEncontrado) {
        return res.status(404).json({ msg: 'No hay cierre registrado para esta iniciativa' });
      }
      puntoDestino = destinoEncontrado;
    }

    // 3. Obtener info del punto destino y su evento
    const punto = await PuntosOrden.findOne({
      where: { id: puntoDestino },
      attributes: ['id', 'nopunto', 'punto', 'id_evento'],
    });

    if (!punto) {
      return res.status(404).json({ msg: 'Punto destino no encontrado' });
    }

    const evento = await Agenda.findOne({
      where: { id: punto.id_evento },
      include: [
        { model: Sedes,       as: 'sede',       attributes: ['id', 'sede'] },
        { model: TipoEventos, as: 'tipoevento', attributes: ['id', 'nombre'] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    const esSesion   = evento.tipoevento?.nombre === 'Sesión';
    const tipoEvento = esSesion ? 'sesion' : 'comision';
    const tipovento  = esSesion ? 1 : 2;

    // 4. Verificar si existe asistencia; si no, crearla
    const asistenciasExistentes = await AsistenciaVoto.findAll({
      where: { id_agenda: evento.id },
      order: [['created_at', 'DESC']],
      raw: true,
    });

    if (asistenciasExistentes.length === 0) {
      await crearAsistencias(evento, esSesion);
    }

    // 5. Verificar si existe votación del punto; si no, crearla
    let mensajeRespuesta = 'Punto con votos existentes';

    const votosExistentes = await VotosPunto.findOne({ where: { id_punto: puntoDestino } });

    if (!votosExistentes) {
      const listadoDiputados = await obtenerListadoDiputados(evento);
      const votospunto = listadoDiputados.map((dip: any) => ({
        sentido:            0,
        mensaje:            'PENDIENTE',
        id_punto:           puntoDestino,
        id_tema_punto_voto: null,
        id_diputado:        dip.id_diputado,
        id_partido:         dip.id_partido,
        id_comision_dip:    dip.comision_dip_id,
        id_cargo_dip:       dip.id_cargo_dip,
      }));
      await VotosPunto.bulkCreate(votospunto);
      mensajeRespuesta = 'Votacion creada correctamente';
    }

    // 6. Obtener y retornar resultados
    const integrantes = await obtenerResultadosVotacionOptimizado(
      null,
      puntoDestino,
      tipoEvento
    );

    return res.status(200).json({
      msg: mensajeRespuesta,
      punto: {
        id:      punto.id,
        nopunto: punto.nopunto,
        punto:   punto.punto,
      },
      evento,
      integrantes,
      tipovento,
      dispensa: tieneDispensa,
    });

  } catch (error: any) {
    console.error('Error getVotosCierre:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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
    paranoid: false
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

export const eliminarAsistenciaYVotacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // ── Asistencia ──
    const totalAsistencia = await AsistenciaVoto.count({
      where: { id_agenda: id, deletedAt: null },
    });

    if (totalAsistencia === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No hay registros de asistencia para este evento',
      });
    }

    await AsistenciaVoto.destroy({
      where: { id_agenda: id },
    });

    // ── Votación ──
    let totalVotos = 0;

    // 1. Votos de temas directos del evento (sin punto)
    const temasEvento = await TemasPuntosVotos.findAll({
      where: { id_evento: id, deletedAt: null },
    });

    for (const tema of temasEvento) {
      totalVotos += await VotosPunto.destroy({
        where: { id_tema_punto_voto: tema.id },
      });
    }

    // 2. Puntos del evento
    const puntos = await PuntosOrden.findAll({
      where: { id_evento: id, deletedAt: null },
    });

    for (const punto of puntos) {
      // 2a. Votos directos del punto (sin tema)
      totalVotos += await VotosPunto.destroy({
        where: { id_punto: punto.id },
      });

      // 2b. Temas del punto → sus votos
      const temasPunto = await TemasPuntosVotos.findAll({
        where: { id_punto: punto.id, deletedAt: null },
      });

      for (const tema of temasPunto) {
        totalVotos += await VotosPunto.destroy({
          where: { id_tema_punto_voto: tema.id },
        });
      }
    }

    return res.status(200).json({
      ok: true,
      msg: `Se eliminaron ${totalAsistencia} registros de asistencia y ${totalVotos} votos`,
      eliminados_asistencia: totalAsistencia,
      votos_eliminados: totalVotos,
    });

  } catch (error) {
    console.error('Error eliminarAsistenciaYVotacion:', error);
    return res.status(500).json({ ok: false, msg: 'Error al eliminar asistencia y votación' });
  }
};

export const getVotosDictamen = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
 
    const idPunto = await getIdPuntoDeIniciativa(id);
    if (!idPunto) {
      return res.status(404).json({ msg: 'No se encontró el punto de la iniciativa' });
    }
 
    const puntoDestino = await getPuntoDestino(idPunto, '2');
    if (!puntoDestino) {
      return res.status(404).json({ msg: 'No hay dictamen registrado para esta iniciativa' });
    }
 
    return await getVotacionPorPunto(puntoDestino, res);
 
  } catch (error: any) {
    console.error('Error getVotosDictamen:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
