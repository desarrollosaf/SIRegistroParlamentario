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
exports.buscarIniciativa = exports.getTodosLosIntegrantes = exports.getIntegrante = exports.getIntegrantesPartido = void 0;
const sequelize_1 = require("sequelize");
const partidos_1 = __importDefault(require("../models/partidos"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const diputado_1 = __importDefault(require("../models/diputado"));
const estadistico_1 = require("./estadistico");
require("../models/associations");
const PARTIDOS = {
    morena: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480', coordinador: { apaterno: 'Vázquez', amaterno: 'Rodríguez', nombres: 'José Francisco' } },
    verde: { id: '1342c104-d5ec-4eda-b5ca-7d653b440a5e', coordinador: { apaterno: 'Couttolenc', amaterno: 'Buentello', nombres: 'José Alberto' } },
    pan: { id: '16db3ac6-ca98-4d5f-b00a-d5ff6e8d828c', coordinador: { apaterno: 'Fernández de Cevallos', amaterno: 'González', nombres: 'Pablo' } },
    pri: { id: '7d2af11b-ed98-43f9-b7a9-a449c459cdf5', coordinador: { apaterno: 'Rescala', amaterno: 'Jiménez', nombres: 'Elías' } },
    pna: { id: '136c3dbb-10a6-4aad-8c5f-bae3f72444ec', coordinador: null },
    pt: { id: '3ed5f80b-f675-4c0b-b922-f9bdadce0fe0', coordinador: { apaterno: 'González', amaterno: 'Yáñez', nombres: 'Óscar' } },
    prd: { id: 'c1fdb97c-2880-4268-8789-6a95d3769092', coordinador: { apaterno: 'Ortega', amaterno: 'Álvarez', nombres: 'Omar' } },
    mc: { id: 'c6981a10-cc1f-4e3a-a08d-603485b0fc7c', coordinador: { apaterno: 'Zepeda', amaterno: 'Hernández', nombres: 'Juan Manuel' } },
};
const getIntegrantesPartido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const slug = req.params.slug.toLowerCase().trim();
    const config = PARTIDOS[slug];
    if (!config) {
        return res.status(404).json({ msg: `Partido '${slug}' no configurado` });
    }
    try {
        const partido = yield partidos_1.default.findOne({
            where: { id: config.id },
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: 'integrante_legislaturas',
                    where: { fecha_fin: null },
                    include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                },
            ],
        });
        if (!partido) {
            return res.status(404).json({ msg: 'Partido no encontrado en base de datos' });
        }
        const integrantes = ((_a = partido.integrante_legislaturas) !== null && _a !== void 0 ? _a : []).map((i) => {
            const d = i.diputado;
            const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
            const esCoordinador = config.coordinador !== null &&
                (d === null || d === void 0 ? void 0 : d.apaterno) === config.coordinador.apaterno &&
                (d === null || d === void 0 ? void 0 : d.amaterno) === config.coordinador.amaterno &&
                (d === null || d === void 0 ? void 0 : d.nombres) === config.coordinador.nombres;
            return { id: i.id, nombre, coordinador: esCoordinador };
        });
        return res.status(200).json({
            msg: 'Exito',
            partido: { id: partido.id, nombre: partido.nombre, siglas: partido.siglas },
            total: integrantes.length,
            integrantes,
        });
    }
    catch (error) {
        console.error('Error obteniendo integrantes:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: error.message });
    }
});
exports.getIntegrantesPartido = getIntegrantesPartido;
const getIntegrante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const q = ((_b = ((_a = req.query.q) !== null && _a !== void 0 ? _a : req.params.q)) !== null && _b !== void 0 ? _b : '').trim();
    if (!q || q.length < 3) {
        return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
    }
    try {
        const palabras = quitarAcentos(q).toLowerCase().split(/[\s\-]+/).filter(Boolean);
        const condiciones = palabras.map((p) => ({
            [sequelize_1.Op.or]: [
                { apaterno: { [sequelize_1.Op.like]: `%${p}%` } },
                { amaterno: { [sequelize_1.Op.like]: `%${p}%` } },
                { nombres: { [sequelize_1.Op.like]: `%${p}%` } },
            ],
        }));
        const diputado = yield diputado_1.default.findOne({
            where: { [sequelize_1.Op.and]: condiciones },
            attributes: ['id', 'apaterno', 'amaterno', 'nombres', 'descripcion', 'email', 'telefono', 'facebook', 'twitter', 'instagram'],
            include: [{ model: integrante_legislaturas_1.default, as: 'integrante', where: { fecha_fin: null }, required: false }],
        });
        if (!diputado) {
            return res.status(404).json({ msg: `No se encontró diputado con '${q}'` });
        }
        const integranteData = (_c = diputado.integrante) !== null && _c !== void 0 ? _c : null;
        let partido = null;
        if (integranteData === null || integranteData === void 0 ? void 0 : integranteData.partido_id) {
            partido = yield partidos_1.default.findOne({
                where: { id: integranteData.partido_id },
                attributes: ['id', 'nombre', 'siglas'],
            });
        }
        return res.status(200).json({
            msg: 'Exito',
            data: {
                id: diputado.id,
                nombre: `${diputado.apaterno} ${diputado.amaterno} ${diputado.nombres}`.trim(),
                descripcion: (_d = diputado.descripcion) !== null && _d !== void 0 ? _d : null,
                email: diputado.email,
                telefono: diputado.telefono,
                facebook: diputado.facebook,
                twitter: diputado.twitter,
                instagram: diputado.instagram,
                partido: partido ? { id: partido.id, nombre: partido.nombre, siglas: partido.siglas } : null,
            },
        });
    }
    catch (error) {
        console.error('Error obteniendo diputado:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener el diputado', error: error.message });
    }
});
exports.getIntegrante = getIntegrante;
const getTodosLosIntegrantes = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partidos = yield partidos_1.default.findAll({
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: 'integrante_legislaturas',
                    where: { fecha_fin: null },
                    required: false,
                    include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                },
            ],
        });
        const grupos = partidos
            .map((p) => {
            var _a;
            const config = Object.values(PARTIDOS).find((c) => c.id === p.id);
            const integrantes = ((_a = p.integrante_legislaturas) !== null && _a !== void 0 ? _a : []).map((i) => {
                const d = i.diputado;
                const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
                const esCoordinador = !!(config === null || config === void 0 ? void 0 : config.coordinador) &&
                    (d === null || d === void 0 ? void 0 : d.apaterno) === config.coordinador.apaterno &&
                    (d === null || d === void 0 ? void 0 : d.amaterno) === config.coordinador.amaterno &&
                    (d === null || d === void 0 ? void 0 : d.nombres) === config.coordinador.nombres;
                return { id: i.id, nombre, coordinador: esCoordinador };
            });
            return { id: p.id, nombre: p.nombre, siglas: p.siglas, total: integrantes.length, integrantes };
        })
            .filter((g) => g.total > 0);
        const totalDiputados = grupos.reduce((acc, g) => acc + g.total, 0);
        return res.status(200).json({ msg: 'Exito', total: totalDiputados, grupos });
    }
    catch (error) {
        console.error('Error obteniendo todos los integrantes:', error);
        return res.status(500).json({ msg: 'Ocurrió un error', error: error.message });
    }
});
exports.getTodosLosIntegrantes = getTodosLosIntegrantes;
// ─── Alias de partidos para búsqueda ─────────────────────────────────────────
const ALIAS_PARTIDOS = {
    pvem: 'verde',
    pan: 'accion nacional',
    pri: 'revolucionario institucional',
    pt: 'partido del trabajo',
    prd: 'revolución democrática',
    mc: 'movimiento ciudadano',
    pna: 'nueva alianza',
    morena: 'morena'
};
function expandirAliases(terminos) {
    return terminos.flatMap((t) => ALIAS_PARTIDOS[t] ? ALIAS_PARTIDOS[t].split(' ') : [t]);
}
const quitarAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const MESES_CORTO = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function expandirFechas(terminos) {
    return terminos.flatMap((t) => {
        // DD/MM/YYYY o DD-MM-YYYY
        const m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) {
            const [, d, mo, y] = m;
            const dia = d.padStart(2, '0');
            const mes = mo.padStart(2, '0');
            const mesN = MESES_CORTO[parseInt(mo, 10) - 1];
            return [
                `${dia}-${mesN}-${y.slice(-2)}`, // 06-Feb-25
                `${y}-${mes}-${dia}`, // 2025-02-06
                `${y}-${mes}`, // 2025-02
            ];
        }
        return [t];
    });
}
// ─── Helpers para construir el timeline ──────────────────────────────────────
function construirTimeline(item) {
    var _a, _b, _c, _d, _e;
    const pasos = [];
    let paso = 1;
    pasos.push({
        paso: paso++,
        evento: 'Presentación',
        fecha: (_a = item.presentac) !== null && _a !== void 0 ? _a : '-',
        detalle: (_b = item.materia) !== null && _b !== void 0 ? _b : '-',
    });
    if (item.comisiones && item.comisiones !== '-') {
        pasos.push({
            paso: paso++,
            evento: 'Turno a comisión',
            fecha: (_c = item.presentac) !== null && _c !== void 0 ? _c : '-',
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
            fecha: (_d = item.expedicion) !== null && _d !== void 0 ? _d : '-',
            detalle: item.observac === 'Aprobada'
                ? `Expedición: ${(_e = item.expedicion) !== null && _e !== void 0 ? _e : '-'}`
                : 'Rechazada en sesión plenaria',
        });
    }
    return pasos;
}
const buscarIniciativa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const q = ((_a = req.query.q) !== null && _a !== void 0 ? _a : '').trim();
    if (!q || q.length < 3) {
        return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
    }
    try {
        const reporte = yield (0, estadistico_1.construirReporteBase)();
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
        const resultados = coincidencias.map((item) => {
            var _a;
            return ({
                id: item.id,
                iniciativa: item.iniciativa,
                autor: item.autor,
                autor_detalle: item.autor_detalle,
                grupo_parlamentario: item.grupo_parlamentario,
                estado_actual: item.observac,
                aprobada: item.aprobada,
                presentacion: item.presentac,
                expedicion: item.expedicion,
                periodo: item.periodo,
                documento: (_a = item.documento) !== null && _a !== void 0 ? _a : null,
                timeline: construirTimeline(item),
            });
        });
        return res.status(200).json({ msg: 'Exito', total: resultados.length, resultados });
    }
    catch (error) {
        console.error('Error buscando iniciativa:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al buscar la iniciativa', error: error.message });
    }
});
exports.buscarIniciativa = buscarIniciativa;
