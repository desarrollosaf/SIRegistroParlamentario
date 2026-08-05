/**
 * Carga en memoria, contra la BD real, los catálogos necesarios para mapear
 * el CSV histórico: sede a usar, tipo_evento Sesión/Comisión, comisiones y
 * proponentes. No escribe nada, solo lee.
 */
import Sedes from '../../models/sedes';
import TipoEventos from '../../models/tipo_eventos';
import Comision from '../../models/comisions';
import Proponentes from '../../models/proponentes';

// UUID fijo usado en controllers/agenda.ts para distinguir un evento tipo "Sesión".
export const TIPO_EVENTO_SESION_ID = 'a413e44b-550b-47ab-b004-a6f28c73a750';

const NOMBRE_SEDE_BUSCADA = process.env.SEDE_IMPORT_HISTORICO || 'Salón de Sesiones';

export interface Catalogos {
  sedeId: string;
  sedeNombre: string;
  tipoEventoSesionId: string;
  tipoEventoComisionId: string;
  comisionesPorNombre: Map<string, { id: string; nombre: string }>;
  comisionesPorNombreFlexible: Map<string, { id: string; nombre: string }>;
  proponentesPorNombre: Map<string, { id: number; valor: string }>;
}

export function normalizarNombre(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (marcas diacríticas tras NFD)
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Prefijos de relleno que a veces trae el nombre en el Excel y a veces el
// catálogo real (o viceversa) — ej. "Comisión para la Protección..." (BD) vs
// "Para la Protección..." (Excel), o "Juventud y el Deporte" (BD) vs
// "La Juventud y el Deporte" (Excel). Se pelan de forma iterativa.
const PREFIJOS_RELLENO = [
  'comision especial de ',
  'comision especial para el analisis y estudio de ',
  'comision especial para ',
  'comision para la ',
  'comision para el ',
  'comision para las ',
  'comision para los ',
  'comision de ',
  'comision del ',
  'comision ',
  'para las ',
  'para los ',
  'para el ',
  'para la ',
  'para ',
  'la ',
  'el ',
  'los ',
  'las ',
];

// Comisiones que se renombraron durante la legislatura: el nombre viejo (tal
// como aparece en el Excel histórico) ya no existe en el catálogo actual.
const ALIAS_COMISIONES_HISTORICOS: Record<string, string> = {
  'educacion cultura ciencia y tecnologia': 'educacion cultura ciencia tecnologia e innovacion',
};

export function normalizarNombreFlexible(valor: string): string {
  let n = normalizarNombre(valor);
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const prefijo of PREFIJOS_RELLENO) {
      if (n.startsWith(prefijo)) {
        n = n.slice(prefijo.length);
        cambio = true;
      }
    }
  }
  return n;
}

export async function cargarCatalogos(): Promise<Catalogos> {
  const [sedes, tiposEvento, comisiones, proponentes] = await Promise.all([
    Sedes.findAll(),
    TipoEventos.findAll(),
    Comision.findAll(),
    Proponentes.findAll(),
  ]);

  // --- Sede ---
  const objetivoSede = normalizarNombre(NOMBRE_SEDE_BUSCADA);
  const sede = sedes.find((s: any) => normalizarNombre(s.sede).includes(objetivoSede))
    || sedes.find((s: any) => normalizarNombre(s.sede).includes('pleno') || normalizarNombre(s.sede).includes('sesion'));

  if (!sede) {
    const disponibles = sedes.map((s: any) => `  - "${s.sede}" (id: ${s.id})`).join('\n');
    throw new Error(
      `No encontré ninguna sede que coincida con "${NOMBRE_SEDE_BUSCADA}".\n` +
      `Sedes disponibles en el catálogo:\n${disponibles || '  (no hay sedes registradas)'}\n` +
      `Define la variable de entorno SEDE_IMPORT_HISTORICO con el nombre exacto (o un fragmento único) a usar.`
    );
  }

  // --- Tipo de evento: Comisión (Sesión ya se conoce por UUID fijo) ---
  const tipoComision = tiposEvento.find((t: any) => normalizarNombre(t.nombre).includes('comision'));
  if (!tipoComision) {
    const disponibles = tiposEvento.map((t: any) => `  - "${t.nombre}" (id: ${t.id})`).join('\n');
    throw new Error(
      `No encontré ningún tipo_evento que contenga "comision".\nTipos disponibles:\n${disponibles}`
    );
  }
  const tipoSesionExiste = tiposEvento.some((t: any) => t.id === TIPO_EVENTO_SESION_ID);
  if (!tipoSesionExiste) {
    throw new Error(
      `El tipo_evento "Sesión" esperado (id ${TIPO_EVENTO_SESION_ID}) no existe en el catálogo tipo_eventos de esta BD.`
    );
  }

  // --- Comisiones (tabla real "comisions", legislativoConnection) ---
  const comisionesPorNombre = new Map<string, { id: string; nombre: string }>();
  // Mapa "flexible" (sin prefijos de relleno) — solo se queda con claves que
  // resuelven a UNA sola comisión, para no introducir matches ambiguos.
  const flexibleTmp = new Map<string, { id: string; nombre: string } | 'AMBIGUO'>();
  for (const c of comisiones as any[]) {
    const nombre = c.nombre.replace(/\s+/g, ' ').trim(); // por si trae saltos de línea sueltos
    comisionesPorNombre.set(normalizarNombre(nombre), { id: c.id, nombre });
    if (c.alias) comisionesPorNombre.set(normalizarNombre(c.alias), { id: c.id, nombre });

    const claveFlex = normalizarNombreFlexible(nombre);
    const existente = flexibleTmp.get(claveFlex);
    if (existente === undefined) {
      flexibleTmp.set(claveFlex, { id: c.id, nombre });
    } else if (existente !== 'AMBIGUO' && existente.id !== c.id) {
      flexibleTmp.set(claveFlex, 'AMBIGUO');
    }
  }
  const comisionesPorNombreFlexible = new Map<string, { id: string; nombre: string }>();
  for (const [clave, valor] of flexibleTmp) {
    if (valor !== 'AMBIGUO') comisionesPorNombreFlexible.set(clave, valor);
  }

  // --- Proponentes (catálogo fijo de 19 tipos) ---
  const proponentesPorNombre = new Map<string, { id: number; valor: string }>();
  for (const p of proponentes as any[]) {
    proponentesPorNombre.set(normalizarNombre(p.valor), { id: p.id, valor: p.valor });
  }

  return {
    sedeId: sede.id,
    sedeNombre: sede.sede,
    tipoEventoSesionId: TIPO_EVENTO_SESION_ID,
    tipoEventoComisionId: tipoComision.id,
    comisionesPorNombre,
    comisionesPorNombreFlexible,
    proponentesPorNombre,
  };
}

/** Busca una comisión del Excel contra el catálogo real: primero match exacto
 * (normalizado), luego match flexible (sin prefijos tipo "Comisión de"/"Para la"/"La"). */
export function resolverComision(
  nombreExcel: string,
  catalogo: Catalogos
): { id: string; nombre: string } | null {
  const exacto = catalogo.comisionesPorNombre.get(normalizarNombre(nombreExcel));
  if (exacto) return exacto;
  const flexible = catalogo.comisionesPorNombreFlexible.get(normalizarNombreFlexible(nombreExcel));
  if (flexible) return flexible;

  const alias = ALIAS_COMISIONES_HISTORICOS[normalizarNombre(nombreExcel)];
  if (alias) {
    return catalogo.comisionesPorNombre.get(alias) || catalogo.comisionesPorNombreFlexible.get(alias) || null;
  }
  return null;
}

/**
 * Un "bloque" es un fragmento ya separado por ';' que puede contener, a su
 * vez, una o varias comisiones separadas por ',' — o ser el nombre de UNA
 * sola comisión que trae comas dentro (ej. "Salud, Asistencia y Bienestar
 * Social"). Se resuelve probando primero el bloque completo, y si no
 * matchea, con "maximal munch": se prueban combinaciones de partes
 * consecutivas separadas por coma de mayor a menor tamaño contra el catálogo.
 */
export function tokenizarBloqueComisiones(bloque: string, catalogo: Catalogos): string[] {
  const bloqueLimpio = bloque.trim();
  if (!bloqueLimpio) return [];
  if (resolverComision(bloqueLimpio, catalogo)) return [bloqueLimpio];

  const partes = bloqueLimpio.split(',').map((p) => p.trim()).filter(Boolean);
  if (partes.length <= 1) return [bloqueLimpio];

  const tokens: string[] = [];
  let i = 0;
  while (i < partes.length) {
    let consumidos = 1;
    for (let len = partes.length - i; len >= 2; len--) {
      const candidato = partes.slice(i, i + len).join(', ');
      if (resolverComision(candidato, catalogo)) {
        consumidos = len;
        break;
      }
    }
    tokens.push(partes.slice(i, i + consumidos).join(', '));
    i += consumidos;
  }
  return tokens;
}
