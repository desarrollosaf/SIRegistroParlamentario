"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIPO_EVENTO_SESION_ID = void 0;
exports.normalizarNombre = normalizarNombre;
exports.normalizarNombreFlexible = normalizarNombreFlexible;
exports.cargarCatalogos = cargarCatalogos;
exports.cargarCatalogosComisionesYProponentes = cargarCatalogosComisionesYProponentes;
exports.cargarTipoEventosReales = cargarTipoEventosReales;
exports.resolverComision = resolverComision;
exports.tokenizarBloqueComisiones = tokenizarBloqueComisiones;
/**
 * Carga en memoria, contra la BD real, los catálogos necesarios para mapear
 * el CSV histórico: sede a usar, tipo_evento Sesión/Comisión, comisiones y
 * proponentes. No escribe nada, solo lee.
 */
const sedes_1 = __importDefault(require("../../models/sedes"));
const tipo_eventos_1 = __importDefault(require("../../models/tipo_eventos"));
const comisions_1 = __importDefault(require("../../models/comisions"));
const proponentes_1 = __importDefault(require("../../models/proponentes"));
// Verificado contra la tabla real tipo_eventos: 'd5687f72-...' = "Sesión".
// (el UUID 'a413e44b-...' que se ve en controllers/agenda.ts corresponde a
// "Diputación permanente", NO a "Sesión" — confirmado con SELECT directo).
exports.TIPO_EVENTO_SESION_ID = 'd5687f72-a328-4be1-a23c-4c3575092163';
const NOMBRE_SEDE_BUSCADA = process.env.SEDE_IMPORT_HISTORICO || 'Salón de Sesiones';
function normalizarNombre(valor) {
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
const ALIAS_COMISIONES_HISTORICOS = {
    'educacion cultura ciencia y tecnologia': 'educacion cultura ciencia tecnologia e innovacion',
};
function normalizarNombreFlexible(valor) {
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
function cargarComisionesYProponentes() {
    return __awaiter(this, void 0, void 0, function* () {
        const [comisiones, proponentes] = yield Promise.all([comisions_1.default.findAll(), proponentes_1.default.findAll()]);
        // --- Comisiones (tabla real "comisions", legislativoConnection) ---
        const comisionesPorNombre = new Map();
        // Mapa "flexible" (sin prefijos de relleno) — solo se queda con claves que
        // resuelven a UNA sola comisión, para no introducir matches ambiguos.
        const flexibleTmp = new Map();
        for (const c of comisiones) {
            const nombre = c.nombre.replace(/\s+/g, ' ').trim(); // por si trae saltos de línea sueltos
            comisionesPorNombre.set(normalizarNombre(nombre), { id: c.id, nombre });
            if (c.alias)
                comisionesPorNombre.set(normalizarNombre(c.alias), { id: c.id, nombre });
            const claveFlex = normalizarNombreFlexible(nombre);
            const existente = flexibleTmp.get(claveFlex);
            if (existente === undefined) {
                flexibleTmp.set(claveFlex, { id: c.id, nombre });
            }
            else if (existente !== 'AMBIGUO' && existente.id !== c.id) {
                flexibleTmp.set(claveFlex, 'AMBIGUO');
            }
        }
        const comisionesPorNombreFlexible = new Map();
        for (const [clave, valor] of flexibleTmp) {
            if (valor !== 'AMBIGUO')
                comisionesPorNombreFlexible.set(clave, valor);
        }
        // --- Proponentes (catálogo fijo de 19 tipos) ---
        const proponentesPorNombre = new Map();
        for (const p of proponentes) {
            proponentesPorNombre.set(normalizarNombre(p.valor), { id: p.id, valor: p.valor });
        }
        return { comisionesPorNombre, comisionesPorNombreFlexible, proponentesPorNombre };
    });
}
function cargarCatalogos() {
    return __awaiter(this, void 0, void 0, function* () {
        const [sedes, tiposEvento, resto] = yield Promise.all([
            sedes_1.default.findAll(),
            tipo_eventos_1.default.findAll(),
            cargarComisionesYProponentes(),
        ]);
        // --- Sede ---
        const objetivoSede = normalizarNombre(NOMBRE_SEDE_BUSCADA);
        const sede = sedes.find((s) => normalizarNombre(s.sede).includes(objetivoSede))
            || sedes.find((s) => normalizarNombre(s.sede).includes('pleno') || normalizarNombre(s.sede).includes('sesion'));
        if (!sede) {
            const disponibles = sedes.map((s) => `  - "${s.sede}" (id: ${s.id})`).join('\n');
            throw new Error(`No encontré ninguna sede que coincida con "${NOMBRE_SEDE_BUSCADA}".\n` +
                `Sedes disponibles en el catálogo:\n${disponibles || '  (no hay sedes registradas)'}\n` +
                `Define la variable de entorno SEDE_IMPORT_HISTORICO con el nombre exacto (o un fragmento único) a usar.`);
        }
        // --- Tipo de evento: Comisión (Sesión ya se conoce por UUID fijo) ---
        const tipoComision = tiposEvento.find((t) => normalizarNombre(t.nombre).includes('comision'));
        if (!tipoComision) {
            const disponibles = tiposEvento.map((t) => `  - "${t.nombre}" (id: ${t.id})`).join('\n');
            throw new Error(`No encontré ningún tipo_evento que contenga "comision".\nTipos disponibles:\n${disponibles}`);
        }
        const tipoSesionExiste = tiposEvento.some((t) => t.id === exports.TIPO_EVENTO_SESION_ID);
        if (!tipoSesionExiste) {
            throw new Error(`El tipo_evento "Sesión" esperado (id ${exports.TIPO_EVENTO_SESION_ID}) no existe en el catálogo tipo_eventos de esta BD.`);
        }
        return Object.assign({ sedeId: sede.id, sedeNombre: sede.sede, tipoEventoSesionId: exports.TIPO_EVENTO_SESION_ID, tipoEventoComisionId: tipoComision.id }, resto);
    });
}
/**
 * Versión ligera para scripts que solo necesitan resolver comisiones y
 * proponentes (ej. sembrar-reconciliado.ts) — nunca crean agendas, así que
 * no necesitan sede ni tipo_evento.
 */
function cargarCatalogosComisionesYProponentes() {
    return __awaiter(this, void 0, void 0, function* () {
        const resto = yield cargarComisionesYProponentes();
        return Object.assign({ sedeId: '', sedeNombre: '', tipoEventoSesionId: exports.TIPO_EVENTO_SESION_ID, tipoEventoComisionId: '' }, resto);
    });
}
/**
 * Versión ligera para el motor de reconciliación (reconciliar.ts): solo
 * resuelve los ids de tipo_evento Sesión/Comisión contra la BD real. No
 * exige ninguna sede — el reconciliador nunca crea agendas, solo busca
 * entre las que ya existen.
 */
function cargarTipoEventosReales() {
    return __awaiter(this, void 0, void 0, function* () {
        const tiposEvento = yield tipo_eventos_1.default.findAll();
        const sesionExiste = tiposEvento.some((t) => t.id === exports.TIPO_EVENTO_SESION_ID);
        if (!sesionExiste) {
            const disponibles = tiposEvento.map((t) => `  - "${t.nombre}" (id: ${t.id})`).join('\n');
            throw new Error(`El tipo_evento "Sesión" esperado (id ${exports.TIPO_EVENTO_SESION_ID}) no existe.\nTipos disponibles:\n${disponibles}`);
        }
        const tipoComision = tiposEvento.find((t) => normalizarNombre(t.nombre).includes('comision'));
        if (!tipoComision) {
            const disponibles = tiposEvento.map((t) => `  - "${t.nombre}" (id: ${t.id})`).join('\n');
            throw new Error(`No encontré ningún tipo_evento que contenga "comision".\nTipos disponibles:\n${disponibles}`);
        }
        return { sesionId: exports.TIPO_EVENTO_SESION_ID, comisionId: tipoComision.id };
    });
}
/** Busca una comisión del Excel contra el catálogo real: primero match exacto
 * (normalizado), luego match flexible (sin prefijos tipo "Comisión de"/"Para la"/"La"). */
function resolverComision(nombreExcel, catalogo) {
    const exacto = catalogo.comisionesPorNombre.get(normalizarNombre(nombreExcel));
    if (exacto)
        return exacto;
    const flexible = catalogo.comisionesPorNombreFlexible.get(normalizarNombreFlexible(nombreExcel));
    if (flexible)
        return flexible;
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
function tokenizarBloqueComisiones(bloque, catalogo) {
    const bloqueLimpio = bloque.trim();
    if (!bloqueLimpio)
        return [];
    if (resolverComision(bloqueLimpio, catalogo))
        return [bloqueLimpio];
    const partes = bloqueLimpio.split(',').map((p) => p.trim()).filter(Boolean);
    if (partes.length <= 1)
        return [bloqueLimpio];
    const tokens = [];
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
