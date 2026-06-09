import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import Comision from '../models/comisions';
import IntegranteComision from '../models/integrante_comisions';
import TipoCargoComision from '../models/tipo_cargo_comisions';
import TipoComisions from '../models/tipo_comisions';
import { construirReporteBase } from './estadistico';
import '../models/associations';

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

    const diputado = await Diputado.findOne({
      where: { [Op.and]: condiciones },
      attributes: ['id', 'apaterno', 'amaterno', 'nombres', 'descripcion', 'email', 'telefono', 'facebook', 'twitter', 'instagram'],
      include: [{ model: IntegranteLegislatura, as: 'integrante', where: { fecha_fin: null }, required: false }],
    }) as any;

    if (!diputado) {
      return res.status(404).json({ msg: `No se encontró diputado con '${q}'` });
    }

    const integranteData = diputado.integrante ?? null;
    let partido = null;

    if (integranteData?.partido_id) {
      partido = await Partidos.findOne({
        where: { id: integranteData.partido_id },
        attributes: ['id', 'nombre', 'siglas'],
      });
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
