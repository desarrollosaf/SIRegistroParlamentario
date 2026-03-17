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
    attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida"],
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
        periodo: obtenerPeriodo(fechaEventoRaw)
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
