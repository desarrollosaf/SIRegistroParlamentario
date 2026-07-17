"use strict";
/**
 * AUDITORÍA DE COBERTURA (SOLO LECTURA)
 * ------------------------------------------------------------------
 * Compara la lista "plana" de iniciativas del PDF (exportada a CSV)
 * contra el grafo YA LIGADO en la BD `registrocomisiones` y clasifica
 * cada renglón. NO inserta, actualiza ni borra nada.
 *
 * Uso:
 *   npx ts-node src/scripts/auditoria-cobertura.ts data/iniciativas.csv
 *
 * CSV de entrada (con encabezados; acentos/mayúsculas son tolerados):
 *   no, autor, iniciativa, materia, presentac, comisiones, expedicion, observac
 *   - `presentac`/`expedicion` en formato "DD-Mmm-YY" (05-Sep-24, 22-Oct-24, 09-Abr-26).
 *   - Si `presentac` trae dos fechas (caso "LXI LEGISLATURA"), se toma la PRIMERA.
 *
 * Salida:
 *   data/reporte-cobertura.csv  con una fila por iniciativa y su clasificación:
 *     - LIGADA_COMPLETA   → existe y está ligada a un punto del orden del día en esa fecha.
 *     - EXISTE_SIN_LIGAR  → el título existe en la BD pero sin punto, o en otra fecha/evento.
 *     - AMBIGUA           → varios candidatos fuertes en la misma fecha (revisar con el autor).
 *     - NO_EXISTE         → no se encontró en la BD.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
require("dotenv/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
const agendas_1 = __importDefault(require("../models/agendas"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
// ─── Helpers de texto ────────────────────────────────────────────────────────
const quitarAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const STOPWORDS = new Set([
    'de', 'la', 'el', 'los', 'las', 'del', 'y', 'a', 'en', 'con', 'por', 'para',
    'que', 'se', 'un', 'una', 'al', 'o', 'e', 'su', 'sus', 'lo', 'como',
    'iniciativa', 'proyecto', 'decreto', 'proyecto de decreto', 'diversas',
    'disposiciones', 'articulo', 'articulos', 'fraccion', 'fracciones', 'ley',
]);
function tokens(texto) {
    const limpio = quitarAcentos(String(texto !== null && texto !== void 0 ? texto : '').toLowerCase())
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
    return new Set(limpio);
}
/** Jaccard sobre tokens (0..1). */
function similitud(a, b) {
    if (a.size === 0 || b.size === 0)
        return 0;
    let inter = 0;
    for (const t of a)
        if (b.has(t))
            inter++;
    const union = a.size + b.size - inter;
    return inter / union;
}
// ─── Parseo de fechas "DD-Mmm-YY" (meses en español abreviados) ──────────────
const MESES = {
    ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
    jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};
/** Devuelve la PRIMERA fecha "DD-Mmm-YY" del texto como ISO "YYYY-MM-DD", o null. */
function fechaAISO(texto) {
    const m = quitarAcentos(String(texto !== null && texto !== void 0 ? texto : '').toLowerCase())
        .match(/\b(\d{1,2})[-\/ ]([a-z]{3})[-\/ ](\d{2,4})\b/);
    if (!m)
        return null;
    const dia = parseInt(m[1], 10);
    const mes = MESES[m[2]];
    if (!mes)
        return null;
    let anio = parseInt(m[3], 10);
    if (anio < 100)
        anio += 2000;
    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
/** Fecha de un Date/valor de la BD a ISO "YYYY-MM-DD" (UTC). */
function isoDeBD(fecha) {
    if (!fecha)
        return null;
    const d = new Date(fecha);
    if (isNaN(d.getTime()))
        return null;
    return d.toISOString().slice(0, 10);
}
// ─── Normalización de encabezados del CSV ────────────────────────────────────
function normalizarFila(row) {
    const idx = {};
    for (const k of Object.keys(row)) {
        idx[quitarAcentos(k.toLowerCase().trim())] = k;
    }
    const g = (nombre) => { var _a; return String((_a = row[idx[nombre]]) !== null && _a !== void 0 ? _a : '').trim(); };
    return {
        no: g('no'),
        autor: g('autor'),
        iniciativa: g('iniciativa'),
        materia: g('materia'),
        presentac: g('presentac') || g('presentacion'),
        comisiones: g('comisiones'),
        expedicion: g('expedicion'),
        observac: g('observac') || g('observacion'),
    };
}
// ─── Escritura CSV ───────────────────────────────────────────────────────────
function csvCampo(v) {
    const s = String(v !== null && v !== void 0 ? v : '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
// ─── Programa principal ──────────────────────────────────────────────────────
const UMBRAL = 0.6; // similitud mínima para considerar "mismo título"
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const entrada = process.argv[2] || 'data/iniciativas.csv';
        const rutaEntrada = path.resolve(process.cwd(), entrada);
        if (!fs.existsSync(rutaEntrada)) {
            console.error(`No encontré el CSV de entrada: ${rutaEntrada}`);
            console.error('Uso: npx ts-node src/scripts/auditoria-cobertura.ts <ruta-csv>');
            process.exit(1);
        }
        const registros = (0, sync_1.parse)(fs.readFileSync(rutaEntrada), {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
            trim: true,
        });
        console.log(`Renglones en el PDF/CSV: ${registros.length}`);
        // ── Precarga del grafo ligado (una sola pasada) ──────────────────────────
        console.log('Cargando grafo de la BD (registrocomisiones)…');
        const [agendas, puntos, ipos] = yield Promise.all([
            agendas_1.default.findAll({ attributes: ['id', 'fecha'], raw: true }),
            puntos_ordens_1.default.findAll({ attributes: ['id', 'id_evento', 'nopunto'], raw: true }),
            inciativas_puntos_ordens_1.default.findAll({
                attributes: ['id', 'id_punto', 'id_evento', 'iniciativa', 'tipo'],
                raw: true, paranoid: false,
            }),
        ]);
        const fechaEvento = new Map(agendas.map((a) => [String(a.id), isoDeBD(a.fecha)]));
        const puntoExiste = new Set(puntos.map((p) => String(p.id)));
        const bdIndex = ipos.map((i) => {
            var _a, _b, _c;
            return ({
                id: String(i.id),
                texto: String((_a = i.iniciativa) !== null && _a !== void 0 ? _a : ''),
                toks: tokens((_b = i.iniciativa) !== null && _b !== void 0 ? _b : ''),
                id_punto: i.id_punto != null ? String(i.id_punto) : null,
                id_evento: i.id_evento != null ? String(i.id_evento) : null,
                fechaEvento: i.id_evento != null ? ((_c = fechaEvento.get(String(i.id_evento))) !== null && _c !== void 0 ? _c : null) : null,
                ligadaAPunto: i.id_punto != null && puntoExiste.has(String(i.id_punto)),
            });
        });
        // Bucket por fecha de evento para acelerar el match.
        const porFecha = new Map();
        for (const x of bdIndex) {
            if (!x.fechaEvento)
                continue;
            const arr = (_a = porFecha.get(x.fechaEvento)) !== null && _a !== void 0 ? _a : [];
            arr.push(x);
            porFecha.set(x.fechaEvento, arr);
        }
        console.log(`Iniciativas en BD: ${bdIndex.length} | fechas de evento distintas: ${porFecha.size}`);
        // ── Clasificación ────────────────────────────────────────────────────────
        const salida = [[
                'no', 'autor', 'iniciativa_pdf', 'presentac_pdf', 'fecha_iso',
                'clasificacion', 'similitud', 'ipo_id_match', 'id_punto', 'nopunto', 'evento_id', 'observacion',
            ]];
        const conteo = {
            LIGADA_COMPLETA: 0, EXISTE_SIN_LIGAR: 0, AMBIGUA: 0, NO_EXISTE: 0, SIN_FECHA: 0,
        };
        const puntoPorId = new Map(puntos.map((p) => [String(p.id), p]));
        for (const raw of registros) {
            const fila = normalizarFila(raw);
            const iso = fechaAISO(fila.presentac);
            const tk = tokens(`${fila.iniciativa} ${fila.materia}`);
            const evaluar = (cands) => {
                let mejor = null;
                let mejorSim = 0;
                let fuertes = 0;
                for (const c of cands) {
                    const s = similitud(tk, c.toks);
                    if (s >= UMBRAL)
                        fuertes++;
                    if (s > mejorSim) {
                        mejorSim = s;
                        mejor = c;
                    }
                }
                return { mejor, mejorSim, fuertes };
            };
            let clasificacion = 'NO_EXISTE';
            let observacion = '';
            let sim = 0;
            let match = null;
            if (!iso) {
                clasificacion = 'SIN_FECHA';
                observacion = 'No pude interpretar la fecha de presentación; se buscó globalmente.';
            }
            // 1) Buscar en el bucket de la misma fecha.
            if (iso && porFecha.has(iso)) {
                const { mejor, mejorSim, fuertes } = evaluar(porFecha.get(iso));
                sim = mejorSim;
                match = mejor;
                if (mejor && mejorSim >= UMBRAL) {
                    if (fuertes > 1) {
                        clasificacion = 'AMBIGUA';
                        observacion = `${fuertes} candidatos fuertes en la misma fecha; desambiguar por autor: ${fila.autor}`;
                    }
                    else if (mejor.ligadaAPunto) {
                        clasificacion = 'LIGADA_COMPLETA';
                    }
                    else {
                        clasificacion = 'EXISTE_SIN_LIGAR';
                        observacion = 'Existe en el evento pero sin punto del orden del día ligado.';
                    }
                }
            }
            // 2) Si no hubo match por fecha, buscar globalmente (existe pero mal ligada / otra fecha).
            if (clasificacion === 'NO_EXISTE' || clasificacion === 'SIN_FECHA') {
                const { mejor, mejorSim } = evaluar(bdIndex);
                if (mejor && mejorSim >= UMBRAL) {
                    sim = mejorSim;
                    match = mejor;
                    clasificacion = 'EXISTE_SIN_LIGAR';
                    observacion = observacion ||
                        `Título encontrado, pero en evento con fecha ${(_b = mejor.fechaEvento) !== null && _b !== void 0 ? _b : 'desconocida'} (esperada ${iso !== null && iso !== void 0 ? iso : '¿?'}).`;
                }
            }
            conteo[clasificacion] = ((_c = conteo[clasificacion]) !== null && _c !== void 0 ? _c : 0) + 1;
            const punto = (match === null || match === void 0 ? void 0 : match.id_punto) ? puntoPorId.get(match.id_punto) : null;
            salida.push([
                fila.no, fila.autor, fila.iniciativa, fila.presentac,
                iso !== null && iso !== void 0 ? iso : '',
                clasificacion, sim.toFixed(2),
                (_d = match === null || match === void 0 ? void 0 : match.id) !== null && _d !== void 0 ? _d : '',
                (_e = match === null || match === void 0 ? void 0 : match.id_punto) !== null && _e !== void 0 ? _e : '',
                (_f = punto === null || punto === void 0 ? void 0 : punto.nopunto) !== null && _f !== void 0 ? _f : '',
                (_g = match === null || match === void 0 ? void 0 : match.id_evento) !== null && _g !== void 0 ? _g : '',
                observacion,
            ]);
        }
        // ── Escribir reporte ─────────────────────────────────────────────────────
        const rutaSalida = path.resolve(process.cwd(), 'data/reporte-cobertura.csv');
        fs.mkdirSync(path.dirname(rutaSalida), { recursive: true });
        fs.writeFileSync(rutaSalida, salida.map((r) => r.map(csvCampo).join(',')).join('\n'), 'utf8');
        console.log('\n── Resumen ──────────────────────────────');
        for (const [k, v] of Object.entries(conteo))
            console.log(`  ${k.padEnd(18)} ${v}`);
        console.log(`\nReporte escrito en: ${rutaSalida}`);
        console.log('(Este script NO modificó la base de datos.)');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('Error en la auditoría:', err);
    process.exit(1);
});
