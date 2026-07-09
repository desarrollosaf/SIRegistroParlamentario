import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import Comision from '../models/comisions';
import IntegranteComision from '../models/integrante_comisions';
import TipoCargoComision from '../models/tipo_cargo_comisions';
import TipoComisions from '../models/tipo_comisions';
import Agenda from '../models/agendas';
import TipoEventos from '../models/tipo_eventos';
import Sedes from '../models/sedes';
import VotosPunto from '../models/votos_punto';
import PuntosOrden from '../models/puntos_ordens';
import IniciativaPuntoOrden from '../models/inciativas_puntos_ordens';
import { construirReporteBase } from './estadistico';
import '../models/associations';

// Un registro (integrante_legislatura / integrante_comision) está vigente cuando su
// fecha_fin está "vacía": null, undefined o cadena vacía. Así lo maneja el resto del sistema.
const esVigente = (fechaFin: unknown): boolean => fechaFin == null || fechaFin === '';

// Id del tipo de comisión "Diputación Permanente" (tabla tipo_comisions).
const TIPO_DIPUTACION_PERMANENTE_ID = 'e41e1bea-c646-11f0-9230-fa163e5be1f8';

type CoordinadorDef = { apaterno: string; amaterno: string; nombres: string } | null;

const PARTIDOS: Record<string, { id: string; coordinador: CoordinadorDef }> = {
  morena: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480', coordinador: { apaterno: 'Vázquez',    amaterno: 'Rodríguez', nombres: 'José Francisco' } },
  verde:  { id: '1342c104-d5ec-4eda-b5ca-7d653b440a5e', coordinador: { apaterno: 'Couttolenc', amaterno: 'Buentello', nombres: 'José Alberto'   } },
  pan:    { id: '16db3ac6-ca98-4d5f-b00a-d5ff6e8d828c', coordinador: { apaterno: 'Fernández de Cevallos', amaterno: 'González', nombres: 'Pablo' } },
  pri:    { id: '7d2af11b-ed98-43f9-b7a9-a449c459cdf5', coordinador: { apaterno: 'Rescala', amaterno: 'Jiménez', nombres: 'Elías' } },
  pna:    { id: '136c3dbb-10a6-4aad-8c5f-bae3f72444ec', coordinador: null },
  pt:     { id: '3ed5f80b-f675-4c0b-b922-f9bdadce0fe0', coordinador: { apaterno: 'González', amaterno: 'Yáñez', nombres: 'Óscar' } },
  prd:    { id: 'c1fdb97c-2880-4268-8789-6a95d3769092', coordinador: { apaterno: 'Ortega', amaterno: 'Álvarez', nombres: 'Omar' } },
  mc:     { id: 'c6981a10-cc1f-4e3a-a08d-603485b0fc7c', coordinador: { apaterno: 'Zepeda', amaterno: 'Hernández', nombres: 'Juan Manuel' } },
};

export const getIntegrantesPartido = async (req: Request, res: Response): Promise<Response> => {
  const slug = req.params.slug.toLowerCase().trim();
  const config = PARTIDOS[slug];

  if (!config) {
    return res.status(404).json({ msg: `Partido '${slug}' no configurado` });
  }

  try {
    const partido = await Partidos.findOne({
      where: { id: config.id },
      include: [
        {
          model: IntegranteLegislatura,
          as: 'integrante_legislaturas',
          where: { fecha_fin: null },
          include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
        },
      ],
    });

    if (!partido) {
      return res.status(404).json({ msg: 'Partido no encontrado en base de datos' });
    }

    const integrantes = ((partido as any).integrante_legislaturas ?? []).map((i: any) => {
      const d = i.diputado;
      const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
      const esCoordinador =
        config.coordinador !== null &&
        d?.apaterno === config.coordinador.apaterno &&
        d?.amaterno === config.coordinador.amaterno &&
        d?.nombres  === config.coordinador.nombres;

      return { id: i.id, nombre, coordinador: esCoordinador };
    });

    return res.status(200).json({
      msg: 'Exito',
      partido: { id: partido.id, nombre: partido.nombre, siglas: partido.siglas },
      total: integrantes.length,
      integrantes,
    });
  } catch (error) {
    console.error('Error obteniendo integrantes:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: (error as Error).message });
  }
};


export const getIntegrante = async (req: Request, res: Response): Promise<Response> => {
  const q = ((req.query.q ?? req.params.q) as string ?? '').trim();

  if (!q || q.length < 3) {
    return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
  }

  try {
    const palabras = quitarAcentos(q).toLowerCase().split(/[\s\-]+/).filter(Boolean);

    const condiciones = palabras.map((p) => ({
      [Op.or]: [
        { apaterno: { [Op.like]: `%${p}%` } },
        { amaterno: { [Op.like]: `%${p}%` } },
        { nombres:  { [Op.like]: `%${p}%` } },
      ],
    }));

    // Cada cambio de partido genera un NUEVO registro en `diputados` (mismo nombre, distinto id),
    // y su correspondiente registro en `integrante_legislaturas`. Por eso buscamos TODOS los
    // registros que coincidan con el nombre, no solo uno.
    const diputados = await Diputado.findAll({
      where: { [Op.and]: condiciones },
      attributes: ['id', 'apaterno', 'amaterno', 'nombres', 'descripcion', 'email', 'telefono', 'facebook', 'twitter', 'instagram'],
    }) as any[];

    if (!diputados.length) {
      return res.status(404).json({ msg: `No se encontró diputado con '${q}'` });
    }

    let partido = null;
    let comisiones: { id: string; nombre: string; cargo: string | null }[] = [];

    // Traemos los periodos de TODOS los registros encontrados. El vigente es el que tiene
    // fecha_fin "vacía" (null o ''); de ahí sale el partido y las comisiones actuales.
    const diputadoIds = diputados.map((d) => d.id);
    const periodos = await IntegranteLegislatura.findAll({
      where: { diputado_id: diputadoIds },
      attributes: ['id', 'diputado_id', 'partido_id', 'legislatura_id', 'fecha_ingreso', 'fecha_inicio', 'fecha_fin'],
    }) as any[];

    const registroActual = periodos.find((p) => esVigente(p.fecha_fin)) ?? null;

    // El "diputado vigente" es el dueño del registro activo; si no hay activo, el primero.
    const diputado =
      (registroActual && diputados.find((d) => d.id === registroActual.diputado_id)) || diputados[0];

    // Nos quedamos solo con los periodos de la MISMA persona (mismo nombre completo),
    // por si la búsqueda por nombre trajo homónimos.
    const mismaPersona = (d: any) =>
      d.apaterno === diputado.apaterno &&
      d.amaterno === diputado.amaterno &&
      d.nombres === diputado.nombres;
    const idsPersona = new Set(diputados.filter(mismaPersona).map((d) => d.id));
    const periodosVigentes = periodos.filter((p) => idsPersona.has(p.diputado_id));

    // Cargamos todos los partidos involucrados (historial) en una sola consulta.
    const partidoIds = [...new Set(periodosVigentes.map((p) => p.partido_id).filter(Boolean))];
    const partidosInvolucrados = partidoIds.length
      ? (await Partidos.findAll({ where: { id: partidoIds }, attributes: ['id', 'nombre', 'siglas'] }) as any[])
      : [];
    const partidoPorId = new Map(
      partidosInvolucrados.map((p) => [p.id, { id: p.id, nombre: p.nombre, siglas: p.siglas }])
    );

    const claveFecha = (p: any) => String(p.fecha_inicio ?? p.fecha_ingreso ?? '');
    const historial_partidos = [...periodosVigentes]
      .sort((a, b) => claveFecha(a).localeCompare(claveFecha(b)))
      .map((p) => ({
        partido:      partidoPorId.get(p.partido_id) ?? null,
        fecha_inicio: p.fecha_inicio ?? p.fecha_ingreso ?? null,
        fecha_fin:    esVigente(p.fecha_fin) ? null : p.fecha_fin,
        actual:       esVigente(p.fecha_fin),
      }));

    if (registroActual?.partido_id) {
      partido = partidoPorId.get(registroActual.partido_id)
        ?? await Partidos.findOne({
          where: { id: registroActual.partido_id },
          attributes: ['id', 'nombre', 'siglas'],
        });
    }

    if (registroActual?.id) {
      const memberships = await IntegranteComision.findAll({
        where: { integrante_legislatura_id: registroActual.id, [Op.or]: [{ fecha_fin: null }, { fecha_fin: '' }] },
        include: [
          { model: Comision, as: 'comision', attributes: ['id', 'nombre'] },
          { model: TipoCargoComision, as: 'tipo_cargo', attributes: ['valor', 'nivel'] },
        ],
        order: [['orden', 'ASC']],
      }) as any[];

      comisiones = memberships
        .sort((a: any, b: any) => (a.tipo_cargo?.nivel ?? 99) - (b.tipo_cargo?.nivel ?? 99))
        .map((m: any) => ({
          id:     m.comision?.id ?? null,
          nombre: m.comision?.nombre ?? null,
          cargo:  m.tipo_cargo?.valor ?? null,
        }));
    }

    return res.status(200).json({
      msg: 'Exito',
      data: {
        id:          diputado.id,
        nombre:      `${diputado.apaterno} ${diputado.amaterno} ${diputado.nombres}`.trim(),
        descripcion: diputado.descripcion ?? null,
        email:       diputado.email,
        telefono:    diputado.telefono,
        facebook:    diputado.facebook,
        twitter:     diputado.twitter,
        instagram:   diputado.instagram,
        partido:     partido ? { id: (partido as any).id, nombre: (partido as any).nombre, siglas: (partido as any).siglas } : null,
        historial_partidos,
        comisiones,
      },
    });
  } catch (error) {
    console.error('Error obteniendo diputado:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener el diputado', error: (error as Error).message });
  }
};

export const getTodosLosIntegrantes = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const partidos = await Partidos.findAll({
      include: [
        {
          model: IntegranteLegislatura,
          as: 'integrante_legislaturas',
          where: { fecha_fin: null },
          required: false,
          include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
        },
      ],
    });

    const grupos = partidos
      .map((p: any) => {
        const config = Object.values(PARTIDOS).find((c) => c.id === p.id);
        const integrantes = (p.integrante_legislaturas ?? []).map((i: any) => {
          const d = i.diputado;
          const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
          const esCoordinador =
            !!config?.coordinador &&
            d?.apaterno === config.coordinador.apaterno &&
            d?.amaterno === config.coordinador.amaterno &&
            d?.nombres  === config.coordinador.nombres;
          return { id: i.id, nombre, coordinador: esCoordinador };
        });
        return { id: p.id, nombre: p.nombre, siglas: p.siglas, total: integrantes.length, integrantes };
      })
      .filter((g) => g.total > 0);

    const totalDiputados = grupos.reduce((acc, g) => acc + g.total, 0);

    return res.status(200).json({ msg: 'Exito', total: totalDiputados, grupos });
  } catch (error) {
    console.error('Error obteniendo todos los integrantes:', error);
    return res.status(500).json({ msg: 'Ocurrió un error', error: (error as Error).message });
  }
};

// ─── Alias de partidos para búsqueda ─────────────────────────────────────────

const ALIAS_PARTIDOS: Record<string, string> = {
  pvem:   'verde',
  pan:    'accion nacional',
  pri:    'revolucionario institucional',
  pt:     'partido del trabajo',
  prd:    'revolución democrática',
  mc:     'movimiento ciudadano',
  pna:    'nueva alianza',
  morena: 'morena'
};

function expandirAliases(terminos: string[]): string[] {
  return terminos.flatMap((t) =>
    ALIAS_PARTIDOS[t] ? ALIAS_PARTIDOS[t].split(' ') : [t]
  );
}

const quitarAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const MESES_CORTO = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

function expandirFechas(terminos: string[]): string[] {
  return terminos.flatMap((t) => {
    // DD/MM/YYYY o DD-MM-YYYY
    const m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [, d, mo, y] = m;
      const dia  = d.padStart(2, '0');
      const mes  = mo.padStart(2, '0');
      const mesN = MESES_CORTO[parseInt(mo, 10) - 1];
      return [
        `${dia}-${mesN}-${y.slice(-2)}`, // 06-Feb-25
        `${y}-${mes}-${dia}`,            // 2025-02-06
        `${y}-${mes}`,                   // 2025-02
      ];
    }
    return [t];
  });
}

// ─── Helpers para construir el timeline ──────────────────────────────────────

function construirTimeline(item: any): { paso: number; evento: string; fecha: string; detalle: string }[] {
  const pasos: { paso: number; evento: string; fecha: string; detalle: string }[] = [];
  let paso = 1;

  pasos.push({
    paso: paso++,
    evento: 'Presentación',
    fecha: item.presentac ?? '-',
    detalle: item.materia ?? '-',
  });

  if (item.comisiones && item.comisiones !== '-') {
    pasos.push({
      paso: paso++,
      evento: 'Turno a comisión',
      fecha: item.presentac ?? '-',
      detalle: item.comisiones,
    });
  }

  const estadosIntermedios = ['En estudio', 'Rechazada en comisión'];
  if (estadosIntermedios.includes(item.observac)) {
    pasos.push({
      paso: paso++,
      evento: item.observac,
      fecha: '-',
      detalle: item.comisiones && item.comisiones !== '-' ? item.comisiones : 'En proceso',
    });
  }

  if (item.observac === 'Precluida') {
    pasos.push({ paso: paso++, evento: 'Precluida', fecha: '-', detalle: 'Iniciativa precluida' });
  }

  if (item.observac === 'Aprobada' || item.observac === 'Rechazada en sesión') {
    pasos.push({
      paso: paso++,
      evento: item.observac,
      fecha: item.expedicion ?? '-',
      detalle: item.observac === 'Aprobada'
        ? `Expedición: ${item.expedicion ?? '-'}`
        : 'Rechazada en sesión plenaria',
    });
  }

  return pasos;
}

export const listarComisiones = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [comisiones, tipos] = await Promise.all([
      Comision.findAll({ attributes: ['id', 'nombre', 'alias', 'tipo_comision_id'] }),
      TipoComisions.findAll({ attributes: ['id', 'valor'] }),
    ]);

    const tipoMap = new Map((tipos as any[]).map((t) => [t.id, t.valor]));

    const lista = (comisiones as any[]).map((c) => ({
      id:     c.id,
      nombre: c.nombre,
      alias:  c.alias ?? null,
      tipo:   tipoMap.get(c.tipo_comision_id) ?? null,
    }));

    return res.status(200).json({ msg: 'Exito', total: lista.length, comisiones: lista });
  } catch (error) {
    console.error('Error listando comisiones:', error);
    return res.status(500).json({ msg: 'Ocurrió un error', error: (error as Error).message });
  }
};

export const buscarComision = async (req: Request, res: Response): Promise<Response> => {
  const q = ((req.query.q as string) ?? '').trim();

  if (!q || q.length < 3) {
    return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
  }

  try {
    const terminos = q.toLowerCase().split(/\s+/).filter(Boolean);

    const condiciones = terminos.map((t) => ({ nombre: { [Op.like]: `%${t}%` } }));

    const comisiones = await Comision.findAll({
      where: { [Op.and]: condiciones },
      attributes: ['id', 'nombre', 'alias', 'tipo_comision_id'],
    }) as any[];

    if (!comisiones.length) {
      return res.status(200).json({ msg: 'Sin resultados', total: 0, resultados: [] });
    }

    const resultados = await Promise.all(
      comisiones.map(async (comision) => {
        const miembros = await IntegranteComision.findAll({
          where: { comision_id: comision.id, fecha_fin: null },
          include: [
            {
              model: IntegranteLegislatura,
              as: 'integranteLegislatura',
              include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
            },
            { model: TipoCargoComision, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
          ],
          order: [['orden', 'ASC']],
        }) as any[];

        const integrantes = miembros
          .map((m) => {
            const d = m.integranteLegislatura?.diputado;
            return {
              id:     m.id,
              nombre: d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '',
              cargo:  m.tipo_cargo?.valor ?? null,
              _nivel: m.tipo_cargo?.nivel ?? 99,
              _orden: m.orden ?? 99,
            };
          })
          .sort((a, b) => a._nivel - b._nivel || a._orden - b._orden)
          .map(({ _nivel, _orden, ...rest }) => rest);

        return {
          id:          comision.id,
          nombre:      comision.nombre,
          alias:       comision.alias ?? null,
          total:       integrantes.length,
          integrantes,
        };
      })
    );

    return res.status(200).json({ msg: 'Exito', total: resultados.length, resultados });
  } catch (error) {
    console.error('Error buscando comisión:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al buscar la comisión', error: (error as Error).message });
  }
};

export const buscarIniciativa = async (req: Request, res: Response): Promise<Response> => {
  const q = ((req.query.q as string) ?? '').trim();

  if (!q || q.length < 3) {
    return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
  }

  try {
    const reporte = await construirReporteBase();
    const terminosOriginales = q.toLowerCase().split(/\s+/).filter(Boolean);

    const coincidencias = reporte.filter((item) => {
      const haystack = quitarAcentos([
        item.iniciativa,
        item.autor,
        item.autor_detalle,
        item.materia,
        item.grupo_parlamentario,
        item.presentac,
        item.fecha_evento_raw,
        item.periodo,
      ].join(' ').toLowerCase());

      // Cada término original debe aparecer en alguna de sus variantes (OR entre variantes, AND entre términos)
      return terminosOriginales.every((t) => {
        const variantes = expandirFechas(expandirAliases([quitarAcentos(t)]));
        return variantes.some((v) => haystack.includes(v));
      });
    });

    if (!coincidencias.length) {
      return res.status(200).json({ msg: 'Sin resultados', total: 0, resultados: [] });
    }

    const resultados = coincidencias.map((item) => ({
      id:                 item.id,
      iniciativa:         item.iniciativa,
      autor:              item.autor,
      autor_detalle:      item.autor_detalle,
      grupo_parlamentario: item.grupo_parlamentario,
      estado_actual:      item.observac,
      aprobada:           item.aprobada,
      presentacion:       item.presentac,
      expedicion:         item.expedicion,
      periodo:            item.periodo,
      documento:          item.documento ?? null,
      timeline:           construirTimeline(item),
    }));

    return res.status(200).json({ msg: 'Exito', total: resultados.length, resultados });
  } catch (error) {
    console.error('Error buscando iniciativa:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al buscar la iniciativa', error: (error as Error).message });
  }
};

export const eventosRecientes = async (req: Request, res: Response): Promise<Response> => {
  // ?limite=5 (por defecto 5, máximo 20)
  const limiteRaw = parseInt((req.query.limite as string) ?? '5', 10);
  const limite = Number.isFinite(limiteRaw) ? Math.min(Math.max(limiteRaw, 1), 20) : 5;

  try {
    const eventos = await Agenda.findAll({
      attributes: ['id', 'fecha', 'hora', 'fecha_hora_inicio', 'descripcion', 'orden_dia', 'liga', 'transmision'],
      include: [
        { model: Sedes,       as: 'sede',       attributes: ['sede'] },
        { model: TipoEventos, as: 'tipoevento', attributes: ['nombre'] },
      ],
      order: [['fecha', 'DESC']],
      limit: limite,
    }) as any[];

    if (!eventos.length) {
      return res.status(200).json({ msg: 'Sin resultados', total: 0, eventos: [] });
    }

    const resultados = eventos.map((e) => ({
      id:                e.id,
      tipo_evento:       e.tipoevento?.nombre ?? null,
      descripcion:       e.descripcion ?? null,
      fecha:             e.fecha ?? null,
      hora:              e.hora ?? null,
      fecha_hora_inicio: e.fecha_hora_inicio ?? null,
      sede:              e.sede?.sede ?? null,
      orden_dia:         e.orden_dia ?? null,
      transmision:       !!e.transmision,
      liga:              e.liga ?? null,
    }));

    return res.status(200).json({ msg: 'Exito', total: resultados.length, eventos: resultados });
  } catch (error) {
    console.error('Error obteniendo eventos recientes:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener los eventos recientes', error: (error as Error).message });
  }
};

// ─── Periodos legislativos de la LXII Legislatura ────────────────────────────
// Fechas inclusivas [inicio, fin] en formato ISO (YYYY-MM-DD).
// numero = ordinal del periodo, anio = año de ejercicio (1 = primer año, 2 = segundo año).

type PeriodoLegislativo = {
  numero: number;
  tipo: 'ordinario' | 'extraordinario' | 'receso';
  anio: number;
  nombre: string;
  inicio: string;
  fin: string;
};

const PERIODOS_LEGISLATIVOS: PeriodoLegislativo[] = [
  { numero: 1, tipo: 'ordinario',      anio: 1, nombre: 'Primer Periodo Ordinario de Sesiones del Primer Año',        inicio: '2024-09-04', fin: '2024-12-19' },
  { numero: 2, tipo: 'ordinario',      anio: 1, nombre: 'Segundo Periodo Ordinario de Sesiones del Primer Año',       inicio: '2025-01-31', fin: '2025-05-13' },
  { numero: 1, tipo: 'extraordinario', anio: 1, nombre: 'Primer Periodo Extraordinario de Sesiones del Primer Año',   inicio: '2025-01-14', fin: '2025-01-14' },
  { numero: 1, tipo: 'receso',         anio: 1, nombre: 'Primer Periodo de Receso del Primer Año',                    inicio: '2024-12-19', fin: '2025-01-20' },
  { numero: 2, tipo: 'receso',         anio: 1, nombre: 'Segundo Periodo de Receso del Primer Año',                   inicio: '2025-05-13', fin: '2025-08-27' },
  { numero: 2, tipo: 'extraordinario', anio: 1, nombre: 'Segundo Periodo Extraordinario de Sesiones del Primer Año', inicio: '2025-06-26', fin: '2025-06-26' },
  { numero: 3, tipo: 'extraordinario', anio: 1, nombre: 'Tercer Periodo Extraordinario de Sesiones del Primer Año',  inicio: '2025-08-08', fin: '2025-08-08' },
  { numero: 4, tipo: 'extraordinario', anio: 1, nombre: 'Cuarto Periodo Extraordinario de Sesiones del Primer Año',  inicio: '2025-09-02', fin: '2025-09-02' },
  // OJO: el dato original decía fin 10/05/2025 (anterior al inicio). Se asume 2026-05-10; confirmar.
  { numero: 1, tipo: 'ordinario',      anio: 2, nombre: 'Primer Periodo Ordinario de Sesiones del Segundo Año',       inicio: '2025-09-05', fin: '2026-05-10' },
  { numero: 5, tipo: 'extraordinario', anio: 2, nombre: 'Quinto Periodo Extraordinario de Sesiones del Segundo Año', inicio: '2026-01-15', fin: '2026-01-15' },
  { numero: 1, tipo: 'receso',         anio: 2, nombre: 'Primer Periodo de Receso del Segundo Año',                   inicio: '2025-12-10', fin: '2026-01-22' },
  { numero: 2, tipo: 'ordinario',      anio: 2, nombre: 'Segundo Periodo Ordinario de Sesiones del Segundo Año',      inicio: '2026-01-31', fin: '2026-05-13' },
];

const ORDINALES: Record<string, number> = {
  primer: 1, primero: 1, primera: 1,
  segundo: 2, segunda: 2,
  tercer: 3, tercero: 3, tercera: 3,
  cuarto: 4, cuarta: 4,
  quinto: 5, quinta: 5,
};

// Intenta identificar a qué periodo(s) se refiere un texto libre.
function identificarPeriodos(texto: string): {
  candidatos: PeriodoLegislativo[];
  filtros: { numero: number | null; tipo: string | null; anio: number | null };
} {
  const q = quitarAcentos(texto.toLowerCase());

  // 'extraordinario' contiene 'ordinario', por eso se evalúa primero.
  let tipo: string | null = null;
  if (q.includes('extraordinari')) tipo = 'extraordinario';
  else if (q.includes('receso')) tipo = 'receso';
  else if (q.includes('ordinari')) tipo = 'ordinario';

  const mNumero = q.match(/(primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa])\s+periodo/);
  const numero = mNumero ? ORDINALES[mNumero[1]] ?? null : null;

  const mAnio = q.match(/(primer[oa]?|segund[oa])\s+ano/);
  const anio = mAnio ? ORDINALES[mAnio[1]] ?? null : null;

  const candidatos = PERIODOS_LEGISLATIVOS.filter((p) =>
    (numero == null || p.numero === numero) &&
    (tipo   == null || p.tipo   === tipo) &&
    (anio   == null || p.anio   === anio)
  );

  return { candidatos, filtros: { numero, tipo, anio } };
}

export const iniciativasPorPeriodo = async (req: Request, res: Response): Promise<Response> => {
  const q = ((req.query.q as string) ?? '').trim();

  if (!q) {
    return res.status(400).json({
      msg: 'Debes indicar el periodo, por ejemplo "primer periodo ordinario del primer año".',
      periodos_disponibles: PERIODOS_LEGISLATIVOS.map((p) => p.nombre),
    });
  }

  const { candidatos } = identificarPeriodos(q);

  if (!candidatos.length) {
    return res.status(200).json({
      msg: `No identifiqué el periodo solicitado: "${q}".`,
      periodos_disponibles: PERIODOS_LEGISLATIVOS.map((p) => p.nombre),
    });
  }

  if (candidatos.length > 1) {
    return res.status(200).json({
      msg: 'El periodo es ambiguo. Especifica el año de ejercicio (primer o segundo año).',
      coincidencias: candidatos.map((p) => p.nombre),
    });
  }

  const periodo = candidatos[0];

  try {
    const reporte = await construirReporteBase();

    const dentroDelPeriodo = (raw: string | null): boolean => {
      if (!raw) return false;
      const fecha = new Date(raw);
      if (isNaN(fecha.getTime())) return false;
      const iso = fecha.toISOString().slice(0, 10);
      return iso >= periodo.inicio && iso <= periodo.fin;
    };

    const coincidencias = reporte
      .filter((item) => dentroDelPeriodo(item.fecha_evento_raw))
      .sort((a, b) => String(a.fecha_evento_raw).localeCompare(String(b.fecha_evento_raw)));

    const iniciativas = coincidencias.map((item) => ({
      id:                  item.id,
      iniciativa:          item.iniciativa,
      autor:               item.autor,
      autor_detalle:       item.autor_detalle,
      grupo_parlamentario: item.grupo_parlamentario,
      estado_actual:       item.observac,
      aprobada:            item.aprobada,
      presentacion:        item.presentac,
      expedicion:          item.expedicion,
      documento:           item.documento ?? null,
    }));

    return res.status(200).json({
      msg: 'Exito',
      periodo: { nombre: periodo.nombre, inicio: periodo.inicio, fin: periodo.fin },
      total: iniciativas.length,
      iniciativas,
    });
  } catch (error) {
    console.error('Error consultando iniciativas por periodo:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al consultar iniciativas por periodo', error: (error as Error).message });
  }
};

// ─── Votaciones por sesión / evento ──────────────────────────────────────────
const MESES_NOMBRE: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

// IniciativaPuntoOrden.tipo: 1 = Iniciativa, 2 = Punto de acuerdo, 3 = Minuta.
const TIPO_INICIATIVA_LABEL: Record<number, string> = { 1: 'Iniciativa', 2: 'Punto de acuerdo', 3: 'Minuta' };

// Convierte "13 de mayo de 2026", "2026-05-13" o "13/05/2026" a "YYYY-MM-DD".
function fechaAISO(texto: string): string | null {
  const q = quitarAcentos(texto.toLowerCase().trim());
  const iso = (dia: number, mesIdx: number, anio: string): string | null =>
    mesIdx < 0 || mesIdx > 11 ? null : `${anio}-${String(mesIdx + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

  let m = q.match(/\b(\d{1,2})\s+de\s+([a-z]+)\s+del?\s+(\d{4})\b/);
  if (m) return iso(parseInt(m[1], 10), MESES_NOMBRE[m[2]] ?? -1, m[3]);

  m = q.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) return iso(parseInt(m[3], 10), parseInt(m[2], 10) - 1, m[1]);

  m = q.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (m) return iso(parseInt(m[1], 10), parseInt(m[2], 10) - 1, m[3]);

  return null;
}

export const iniciativasVotadasEnSesion = async (req: Request, res: Response): Promise<Response> => {
  const fechaTexto = (((req.query.fecha as string) ?? (req.query.q as string)) ?? '').trim();

  if (!fechaTexto) {
    return res.status(400).json({ msg: 'Debes indicar la fecha de la sesión, ej. "13 de mayo de 2026".' });
  }

  const iso = fechaAISO(fechaTexto);
  if (!iso) {
    return res.status(400).json({
      msg: `No pude interpretar la fecha "${fechaTexto}". Usa "13 de mayo de 2026", "2026-05-13" o "13/05/2026".`,
    });
  }

  // Filtro opcional por tipo de evento, ej. ?tipo=sesion  o  ?tipo=comision
  const tipoFiltro = quitarAcentos(((req.query.tipo as string) ?? '').toLowerCase().trim());

  try {
    // 1) Eventos de la agenda en esa fecha.
    const eventos = await Agenda.findAll({
      where: { fecha: { [Op.gte]: `${iso} 00:00:00`, [Op.lte]: `${iso} 23:59:59` } },
      attributes: ['id', 'fecha', 'descripcion'],
      include: [{ model: TipoEventos, as: 'tipoevento', attributes: ['nombre'] }],
      order: [['fecha', 'ASC']],
    }) as any[];

    const eventosFiltrados = tipoFiltro
      ? eventos.filter((e) => quitarAcentos(String(e.tipoevento?.nombre ?? '').toLowerCase()).includes(tipoFiltro))
      : eventos;

    if (!eventosFiltrados.length) {
      return res.status(200).json({ msg: `No encontré eventos en la agenda con fecha ${iso}.`, fecha: iso, total_eventos: 0, eventos: [] });
    }

    // 2) Puntos del orden del día de esos eventos, con su iniciativa/PA/minuta (si tiene).
    const eventoIds = eventosFiltrados.map((e) => e.id);
    const puntos = await PuntosOrden.findAll({
      where: { id_evento: { [Op.in]: eventoIds } },
      attributes: ['id', 'id_evento', 'nopunto', 'punto'],
      order: [['nopunto', 'ASC']],
      include: [{ model: IniciativaPuntoOrden, as: 'iniciativas', attributes: ['id', 'iniciativa', 'tipo'], required: false }],
    }) as any[];

    // 3) Votos de todos esos puntos (sentido 1=favor, 2=abstención, 3=contra).
    const puntoIds = puntos.map((p) => p.id);
    const votosRaw = puntoIds.length
      ? (await VotosPunto.findAll({
          where: { id_punto: { [Op.in]: puntoIds }, sentido: { [Op.in]: [1, 2, 3] }, },
          attributes: ['id_punto', 'sentido', 'id_diputado', 'id_partido'],
          paranoid: true,
          raw: true,
        }) as any[])
      : [];

    // Catálogos de nombres (Diputado/Partidos viven en otra BD → consulta aparte).
    const dipIds = [...new Set(votosRaw.map((v) => v.id_diputado).filter(Boolean))];
    const parIds = [...new Set(votosRaw.map((v) => v.id_partido).filter(Boolean))];
    const [dips, pars] = await Promise.all([
      dipIds.length ? (Diputado.findAll({ where: { id: dipIds }, attributes: ['id', 'apaterno', 'amaterno', 'nombres'], paranoid: false, raw: true }) as any) : [],
      parIds.length ? (Partidos.findAll({ where: { id: parIds }, attributes: ['id', 'siglas'], raw: true }) as any) : [],
    ]);
    const dipMap = new Map<string, string>((dips as any[]).map((d) => [d.id, `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim()]));
    const parMap = new Map<string, string>((pars as any[]).map((p) => [p.id, p.siglas]));

    const votosPorPunto = new Map<number, any[]>();
    for (const v of votosRaw) {
      const pid = Number(v.id_punto);
      if (!votosPorPunto.has(pid)) votosPorPunto.set(pid, []);
      votosPorPunto.get(pid)!.push(v);
    }

    // Resumen de votación de un punto (null si no se votó).
    const construirVotacion = (puntoId: number) => {
      const votos = votosPorPunto.get(puntoId) ?? [];
      if (!votos.length) return null;

      let a_favor = 0, en_contra = 0, abstencion = 0;
      const votaronContra: { diputado: string; partido: string | null }[] = [];
      const seAbstuvieron: { diputado: string; partido: string | null }[] = [];

      for (const v of votos) {
        if (v.sentido === 1) a_favor++;
        else if (v.sentido === 2) {
          abstencion++;
          seAbstuvieron.push({ diputado: dipMap.get(v.id_diputado) ?? '-', partido: parMap.get(v.id_partido) ?? null });
        } else if (v.sentido === 3) {
          en_contra++;
          votaronContra.push({ diputado: dipMap.get(v.id_diputado) ?? '-', partido: parMap.get(v.id_partido) ?? null });
        }
      }

      const total = a_favor + en_contra + abstencion;
      return {
        resultado: a_favor > total / 2 ? 'Aprobado' : 'No aprobado', // por mayoría simple de votos emitidos
        a_favor,
        en_contra,
        abstencion,
        total,
        en_contra_detalle: votaronContra,
        abstenciones: seAbstuvieron,
      };
    };

    const puntosPorEvento = new Map<string, any[]>();
    for (const p of puntos) {
      const key = String(p.id_evento);
      if (!puntosPorEvento.has(key)) puntosPorEvento.set(key, []);
      puntosPorEvento.get(key)!.push(p);
    }

    const eventosSalida = eventosFiltrados.map((e) => {
      const ptos = (puntosPorEvento.get(String(e.id)) ?? []).map((p) => {
        const iniciativas = (p.iniciativas ?? []).map((ini: any) => ({
          titulo: ini.iniciativa ?? null,
          tipo: TIPO_INICIATIVA_LABEL[Number(ini.tipo)] ?? null,
        }));
        const votacion = construirVotacion(Number(p.id));
        return {
          nopunto:     p.nopunto ?? null,
          punto:       p.punto ?? null,
          iniciativas,                  // vacío = "solo se votó el punto"
          se_voto:     votacion != null,
          votacion,                     // null = sin votación registrada
        };
      });

      return {
        id:             e.id,
        tipo_evento:    e.tipoevento?.nombre ?? null,
        descripcion:    e.descripcion ?? null,
        total_puntos:   ptos.length,
        puntos_votados: ptos.filter((x) => x.se_voto).length,
        puntos:         ptos,
      };
    });

    return res.status(200).json({ msg: 'Exito', fecha: iso, total_eventos: eventosSalida.length, eventos: eventosSalida });
  } catch (error) {
    console.error('Error consultando votaciones de la sesión:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al consultar las votaciones de la sesión', error: (error as Error).message });
  }
};

export const integrantesDiputacionPermanente = async (req: Request, res: Response): Promise<Response> => {
  // Filtro opcional por periodo/nombre, ej. ?q=segundo año  (si se omite, devuelve todos los periodos)
  const q = ((req.query.q as string) ?? '').trim();

  try {
    // La Diputación Permanente se identifica por su TIPO de comisión, no por su nombre
    // (cada periodo tiene un nombre distinto: "DIP PERMANENTE DEL PRIMER AÑO...", etc.).
    // Se usa el id EXACTO del tipo; un LIKE laxo traía por error los "Comités".
    const comisiones = await Comision.findAll({
      where: { tipo_comision_id: TIPO_DIPUTACION_PERMANENTE_ID },
      attributes: ['id', 'nombre', 'alias'],
    }) as any[];

    if (!comisiones.length) {
      return res.status(200).json({ msg: 'Sin resultados', total: 0, periodos: [] });
    }

    // Filtro opcional: todos los términos deben aparecer en el nombre del periodo.
    let comisionesFiltradas = comisiones;
    if (q) {
      const terminos = quitarAcentos(q.toLowerCase()).split(/\s+/).filter(Boolean);
      const match = comisiones.filter((c) => {
        const nombre = quitarAcentos(String(c.nombre ?? '').toLowerCase());
        return terminos.every((t) => nombre.includes(t));
      });
      if (match.length) comisionesFiltradas = match; // si el filtro no acota nada, se devuelven todos
    }

    const periodos = await Promise.all(
      comisionesFiltradas.map(async (comision) => {
        // Sin filtro de fecha_fin: queremos el roster completo de cada periodo (incluye los ya concluidos).
        const miembros = await IntegranteComision.findAll({
          where: { comision_id: comision.id },
          include: [
            {
              model: IntegranteLegislatura,
              as: 'integranteLegislatura',
              include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
            },
            { model: TipoCargoComision, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
          ],
          order: [['orden', 'ASC']],
        }) as any[];

        const integrantes = miembros
          .map((m) => {
            const d = m.integranteLegislatura?.diputado;
            return {
              nombre: d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '',
              cargo:  m.tipo_cargo?.valor ?? null,
              _nivel: m.tipo_cargo?.nivel ?? 99,
              _orden: m.orden ?? 99,
            };
          })
          .sort((a, b) => a._nivel - b._nivel || a._orden - b._orden)
          .map(({ _nivel, _orden, ...rest }) => rest);

        return {
          id:          comision.id,
          nombre:      comision.nombre,
          alias:       comision.alias ?? null,
          total:       integrantes.length,
          integrantes,
        };
      })
    );

    return res.status(200).json({ msg: 'Exito', total: periodos.length, periodos });
  } catch (error) {
    console.error('Error obteniendo Diputación Permanente:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener la Diputación Permanente', error: (error as Error).message });
  }
};

export const integrantesJucopo = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Guardada como comisión "Junta de Coordinación Política".
    // Se buscan los tokens "coordinaci" y "politic" para tolerar acentos/variantes.
    const comision = await Comision.findOne({
      where: {
        [Op.and]: [
          { nombre: { [Op.like]: '%oordinaci%' } },
          { nombre: { [Op.like]: '%olitic%' } },
        ],
      },
      attributes: ['id', 'nombre', 'alias'],
    }) as any;

    if (!comision) {
      return res.status(404).json({ msg: 'No se encontró la Junta de Coordinación Política.' });
    }

    // Integrantes vigentes (fecha_fin null o '').
    const miembros = await IntegranteComision.findAll({
      where: { comision_id: comision.id, [Op.or]: [{ fecha_fin: null }, { fecha_fin: '' }] },
      include: [
        {
          model: IntegranteLegislatura,
          as: 'integranteLegislatura',
          include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
        },
        { model: TipoCargoComision, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
      ],
      order: [['orden', 'ASC']],
    }) as any[];

    const integrantes = miembros
      .map((m) => {
        const d = m.integranteLegislatura?.diputado;
        return {
          nombre: d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '',
          cargo:  m.tipo_cargo?.valor ?? null,
          _nivel: m.tipo_cargo?.nivel ?? 99,
          _orden: m.orden ?? 99,
        };
      })
      .sort((a, b) => a._nivel - b._nivel || a._orden - b._orden)
      .map(({ _nivel, _orden, ...rest }) => rest);

    // Presidencia = integrante cuyo cargo menciona "presiden".
    const presidente = integrantes.find((i) =>
      quitarAcentos(String(i.cargo ?? '').toLowerCase()).includes('presiden')
    ) ?? null;

    return res.status(200).json({
      msg: 'Exito',
      comision: { id: comision.id, nombre: comision.nombre, alias: comision.alias ?? null },
      presidente,
      total: integrantes.length,
      integrantes,
    });
  } catch (error) {
    console.error('Error obteniendo la Junta de Coordinación Política:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener la Junta de Coordinación Política', error: (error as Error).message });
  }
};
