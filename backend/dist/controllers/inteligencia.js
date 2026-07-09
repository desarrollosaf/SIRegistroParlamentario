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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrantesJucopo = exports.integrantesDiputacionPermanente = exports.iniciativasVotadasEnSesion = exports.iniciativasPorPeriodo = exports.eventosRecientes = exports.buscarIniciativa = exports.buscarComision = exports.listarComisiones = exports.getTodosLosIntegrantes = exports.getIntegrante = exports.getIntegrantesPartido = void 0;
const sequelize_1 = require("sequelize");
const partidos_1 = __importDefault(require("../models/partidos"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const diputado_1 = __importDefault(require("../models/diputado"));
const comisions_1 = __importDefault(require("../models/comisions"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const tipo_cargo_comisions_1 = __importDefault(require("../models/tipo_cargo_comisions"));
const tipo_comisions_1 = __importDefault(require("../models/tipo_comisions"));
const agendas_1 = __importDefault(require("../models/agendas"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const sedes_1 = __importDefault(require("../models/sedes"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const estadistico_1 = require("./estadistico");
require("../models/associations");
// Un registro (integrante_legislatura / integrante_comision) está vigente cuando su
// fecha_fin está "vacía": null, undefined o cadena vacía. Así lo maneja el resto del sistema.
const esVigente = (fechaFin) => fechaFin == null || fechaFin === '';
// Id del tipo de comisión "Diputación Permanente" (tabla tipo_comisions).
const TIPO_DIPUTACION_PERMANENTE_ID = 'e41e1bea-c646-11f0-9230-fa163e5be1f8';
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
    var _a, _b, _c, _d, _e;
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
        // Cada cambio de partido genera un NUEVO registro en `diputados` (mismo nombre, distinto id),
        // y su correspondiente registro en `integrante_legislaturas`. Por eso buscamos TODOS los
        // registros que coincidan con el nombre, no solo uno.
        const diputados = yield diputado_1.default.findAll({
            where: { [sequelize_1.Op.and]: condiciones },
            attributes: ['id', 'apaterno', 'amaterno', 'nombres', 'descripcion', 'email', 'telefono', 'facebook', 'twitter', 'instagram'],
        });
        if (!diputados.length) {
            return res.status(404).json({ msg: `No se encontró diputado con '${q}'` });
        }
        let partido = null;
        let comisiones = [];
        // Traemos los periodos de TODOS los registros encontrados. El vigente es el que tiene
        // fecha_fin "vacía" (null o ''); de ahí sale el partido y las comisiones actuales.
        const diputadoIds = diputados.map((d) => d.id);
        const periodos = yield integrante_legislaturas_1.default.findAll({
            where: { diputado_id: diputadoIds },
            attributes: ['id', 'diputado_id', 'partido_id', 'legislatura_id', 'fecha_ingreso', 'fecha_inicio', 'fecha_fin'],
        });
        const registroActual = (_c = periodos.find((p) => esVigente(p.fecha_fin))) !== null && _c !== void 0 ? _c : null;
        // El "diputado vigente" es el dueño del registro activo; si no hay activo, el primero.
        const diputado = (registroActual && diputados.find((d) => d.id === registroActual.diputado_id)) || diputados[0];
        // Nos quedamos solo con los periodos de la MISMA persona (mismo nombre completo),
        // por si la búsqueda por nombre trajo homónimos.
        const mismaPersona = (d) => d.apaterno === diputado.apaterno &&
            d.amaterno === diputado.amaterno &&
            d.nombres === diputado.nombres;
        const idsPersona = new Set(diputados.filter(mismaPersona).map((d) => d.id));
        const periodosVigentes = periodos.filter((p) => idsPersona.has(p.diputado_id));
        // Cargamos todos los partidos involucrados (historial) en una sola consulta.
        const partidoIds = [...new Set(periodosVigentes.map((p) => p.partido_id).filter(Boolean))];
        const partidosInvolucrados = partidoIds.length
            ? yield partidos_1.default.findAll({ where: { id: partidoIds }, attributes: ['id', 'nombre', 'siglas'] })
            : [];
        const partidoPorId = new Map(partidosInvolucrados.map((p) => [p.id, { id: p.id, nombre: p.nombre, siglas: p.siglas }]));
        const claveFecha = (p) => { var _a, _b; return String((_b = (_a = p.fecha_inicio) !== null && _a !== void 0 ? _a : p.fecha_ingreso) !== null && _b !== void 0 ? _b : ''); };
        const historial_partidos = [...periodosVigentes]
            .sort((a, b) => claveFecha(a).localeCompare(claveFecha(b)))
            .map((p) => {
            var _a, _b, _c;
            return ({
                partido: (_a = partidoPorId.get(p.partido_id)) !== null && _a !== void 0 ? _a : null,
                fecha_inicio: (_c = (_b = p.fecha_inicio) !== null && _b !== void 0 ? _b : p.fecha_ingreso) !== null && _c !== void 0 ? _c : null,
                fecha_fin: esVigente(p.fecha_fin) ? null : p.fecha_fin,
                actual: esVigente(p.fecha_fin),
            });
        });
        if (registroActual === null || registroActual === void 0 ? void 0 : registroActual.partido_id) {
            partido = (_d = partidoPorId.get(registroActual.partido_id)) !== null && _d !== void 0 ? _d : yield partidos_1.default.findOne({
                where: { id: registroActual.partido_id },
                attributes: ['id', 'nombre', 'siglas'],
            });
        }
        if (registroActual === null || registroActual === void 0 ? void 0 : registroActual.id) {
            const memberships = yield integrante_comisions_1.default.findAll({
                where: { integrante_legislatura_id: registroActual.id, [sequelize_1.Op.or]: [{ fecha_fin: null }, { fecha_fin: '' }] },
                include: [
                    { model: comisions_1.default, as: 'comision', attributes: ['id', 'nombre'] },
                    { model: tipo_cargo_comisions_1.default, as: 'tipo_cargo', attributes: ['valor', 'nivel'] },
                ],
                order: [['orden', 'ASC']],
            });
            comisiones = memberships
                .sort((a, b) => { var _a, _b, _c, _d; return ((_b = (_a = a.tipo_cargo) === null || _a === void 0 ? void 0 : _a.nivel) !== null && _b !== void 0 ? _b : 99) - ((_d = (_c = b.tipo_cargo) === null || _c === void 0 ? void 0 : _c.nivel) !== null && _d !== void 0 ? _d : 99); })
                .map((m) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: (_b = (_a = m.comision) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                    nombre: (_d = (_c = m.comision) === null || _c === void 0 ? void 0 : _c.nombre) !== null && _d !== void 0 ? _d : null,
                    cargo: (_f = (_e = m.tipo_cargo) === null || _e === void 0 ? void 0 : _e.valor) !== null && _f !== void 0 ? _f : null,
                });
            });
        }
        return res.status(200).json({
            msg: 'Exito',
            data: {
                id: diputado.id,
                nombre: `${diputado.apaterno} ${diputado.amaterno} ${diputado.nombres}`.trim(),
                descripcion: (_e = diputado.descripcion) !== null && _e !== void 0 ? _e : null,
                email: diputado.email,
                telefono: diputado.telefono,
                facebook: diputado.facebook,
                twitter: diputado.twitter,
                instagram: diputado.instagram,
                partido: partido ? { id: partido.id, nombre: partido.nombre, siglas: partido.siglas } : null,
                historial_partidos,
                comisiones,
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
const listarComisiones = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [comisiones, tipos] = yield Promise.all([
            comisions_1.default.findAll({ attributes: ['id', 'nombre', 'alias', 'tipo_comision_id'] }),
            tipo_comisions_1.default.findAll({ attributes: ['id', 'valor'] }),
        ]);
        const tipoMap = new Map(tipos.map((t) => [t.id, t.valor]));
        const lista = comisiones.map((c) => {
            var _a, _b;
            return ({
                id: c.id,
                nombre: c.nombre,
                alias: (_a = c.alias) !== null && _a !== void 0 ? _a : null,
                tipo: (_b = tipoMap.get(c.tipo_comision_id)) !== null && _b !== void 0 ? _b : null,
            });
        });
        return res.status(200).json({ msg: 'Exito', total: lista.length, comisiones: lista });
    }
    catch (error) {
        console.error('Error listando comisiones:', error);
        return res.status(500).json({ msg: 'Ocurrió un error', error: error.message });
    }
});
exports.listarComisiones = listarComisiones;
const buscarComision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const q = ((_a = req.query.q) !== null && _a !== void 0 ? _a : '').trim();
    if (!q || q.length < 3) {
        return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
    }
    try {
        const terminos = q.toLowerCase().split(/\s+/).filter(Boolean);
        const condiciones = terminos.map((t) => ({ nombre: { [sequelize_1.Op.like]: `%${t}%` } }));
        const comisiones = yield comisions_1.default.findAll({
            where: { [sequelize_1.Op.and]: condiciones },
            attributes: ['id', 'nombre', 'alias', 'tipo_comision_id'],
        });
        if (!comisiones.length) {
            return res.status(200).json({ msg: 'Sin resultados', total: 0, resultados: [] });
        }
        const resultados = yield Promise.all(comisiones.map((comision) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const miembros = yield integrante_comisions_1.default.findAll({
                where: { comision_id: comision.id, fecha_fin: null },
                include: [
                    {
                        model: integrante_legislaturas_1.default,
                        as: 'integranteLegislatura',
                        include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                    },
                    { model: tipo_cargo_comisions_1.default, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
                ],
                order: [['orden', 'ASC']],
            });
            const integrantes = miembros
                .map((m) => {
                var _a, _b, _c, _d, _e, _f;
                const d = (_a = m.integranteLegislatura) === null || _a === void 0 ? void 0 : _a.diputado;
                return {
                    id: m.id,
                    nombre: d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '',
                    cargo: (_c = (_b = m.tipo_cargo) === null || _b === void 0 ? void 0 : _b.valor) !== null && _c !== void 0 ? _c : null,
                    _nivel: (_e = (_d = m.tipo_cargo) === null || _d === void 0 ? void 0 : _d.nivel) !== null && _e !== void 0 ? _e : 99,
                    _orden: (_f = m.orden) !== null && _f !== void 0 ? _f : 99,
                };
            })
                .sort((a, b) => a._nivel - b._nivel || a._orden - b._orden)
                .map((_a) => {
                var { _nivel, _orden } = _a, rest = __rest(_a, ["_nivel", "_orden"]);
                return rest;
            });
            return {
                id: comision.id,
                nombre: comision.nombre,
                alias: (_a = comision.alias) !== null && _a !== void 0 ? _a : null,
                total: integrantes.length,
                integrantes,
            };
        })));
        return res.status(200).json({ msg: 'Exito', total: resultados.length, resultados });
    }
    catch (error) {
        console.error('Error buscando comisión:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al buscar la comisión', error: error.message });
    }
});
exports.buscarComision = buscarComision;
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
const eventosRecientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // ?limite=5 (por defecto 5, máximo 20)
    const limiteRaw = parseInt((_a = req.query.limite) !== null && _a !== void 0 ? _a : '5', 10);
    const limite = Number.isFinite(limiteRaw) ? Math.min(Math.max(limiteRaw, 1), 20) : 5;
    try {
        const eventos = yield agendas_1.default.findAll({
            attributes: ['id', 'fecha', 'hora', 'fecha_hora_inicio', 'descripcion', 'orden_dia', 'liga', 'transmision'],
            include: [
                { model: sedes_1.default, as: 'sede', attributes: ['sede'] },
                { model: tipo_eventos_1.default, as: 'tipoevento', attributes: ['nombre'] },
            ],
            order: [['fecha', 'DESC']],
            limit: limite,
        });
        if (!eventos.length) {
            return res.status(200).json({ msg: 'Sin resultados', total: 0, eventos: [] });
        }
        const resultados = eventos.map((e) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return ({
                id: e.id,
                tipo_evento: (_b = (_a = e.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) !== null && _b !== void 0 ? _b : null,
                descripcion: (_c = e.descripcion) !== null && _c !== void 0 ? _c : null,
                fecha: (_d = e.fecha) !== null && _d !== void 0 ? _d : null,
                hora: (_e = e.hora) !== null && _e !== void 0 ? _e : null,
                fecha_hora_inicio: (_f = e.fecha_hora_inicio) !== null && _f !== void 0 ? _f : null,
                sede: (_h = (_g = e.sede) === null || _g === void 0 ? void 0 : _g.sede) !== null && _h !== void 0 ? _h : null,
                orden_dia: (_j = e.orden_dia) !== null && _j !== void 0 ? _j : null,
                transmision: !!e.transmision,
                liga: (_k = e.liga) !== null && _k !== void 0 ? _k : null,
            });
        });
        return res.status(200).json({ msg: 'Exito', total: resultados.length, eventos: resultados });
    }
    catch (error) {
        console.error('Error obteniendo eventos recientes:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener los eventos recientes', error: error.message });
    }
});
exports.eventosRecientes = eventosRecientes;
const PERIODOS_LEGISLATIVOS = [
    { numero: 1, tipo: 'ordinario', anio: 1, nombre: 'Primer Periodo Ordinario de Sesiones del Primer Año', inicio: '2024-09-04', fin: '2024-12-19' },
    { numero: 2, tipo: 'ordinario', anio: 1, nombre: 'Segundo Periodo Ordinario de Sesiones del Primer Año', inicio: '2025-01-31', fin: '2025-05-13' },
    { numero: 1, tipo: 'extraordinario', anio: 1, nombre: 'Primer Periodo Extraordinario de Sesiones del Primer Año', inicio: '2025-01-14', fin: '2025-01-14' },
    { numero: 1, tipo: 'receso', anio: 1, nombre: 'Primer Periodo de Receso del Primer Año', inicio: '2024-12-19', fin: '2025-01-20' },
    { numero: 2, tipo: 'receso', anio: 1, nombre: 'Segundo Periodo de Receso del Primer Año', inicio: '2025-05-13', fin: '2025-08-27' },
    { numero: 2, tipo: 'extraordinario', anio: 1, nombre: 'Segundo Periodo Extraordinario de Sesiones del Primer Año', inicio: '2025-06-26', fin: '2025-06-26' },
    { numero: 3, tipo: 'extraordinario', anio: 1, nombre: 'Tercer Periodo Extraordinario de Sesiones del Primer Año', inicio: '2025-08-08', fin: '2025-08-08' },
    { numero: 4, tipo: 'extraordinario', anio: 1, nombre: 'Cuarto Periodo Extraordinario de Sesiones del Primer Año', inicio: '2025-09-02', fin: '2025-09-02' },
    // OJO: el dato original decía fin 10/05/2025 (anterior al inicio). Se asume 2026-05-10; confirmar.
    { numero: 1, tipo: 'ordinario', anio: 2, nombre: 'Primer Periodo Ordinario de Sesiones del Segundo Año', inicio: '2025-09-05', fin: '2026-05-10' },
    { numero: 5, tipo: 'extraordinario', anio: 2, nombre: 'Quinto Periodo Extraordinario de Sesiones del Segundo Año', inicio: '2026-01-15', fin: '2026-01-15' },
    { numero: 1, tipo: 'receso', anio: 2, nombre: 'Primer Periodo de Receso del Segundo Año', inicio: '2025-12-10', fin: '2026-01-22' },
    { numero: 2, tipo: 'ordinario', anio: 2, nombre: 'Segundo Periodo Ordinario de Sesiones del Segundo Año', inicio: '2026-01-31', fin: '2026-05-13' },
];
const ORDINALES = {
    primer: 1, primero: 1, primera: 1,
    segundo: 2, segunda: 2,
    tercer: 3, tercero: 3, tercera: 3,
    cuarto: 4, cuarta: 4,
    quinto: 5, quinta: 5,
};
// Intenta identificar a qué periodo(s) se refiere un texto libre.
function identificarPeriodos(texto) {
    var _a, _b;
    const q = quitarAcentos(texto.toLowerCase());
    // 'extraordinario' contiene 'ordinario', por eso se evalúa primero.
    let tipo = null;
    if (q.includes('extraordinari'))
        tipo = 'extraordinario';
    else if (q.includes('receso'))
        tipo = 'receso';
    else if (q.includes('ordinari'))
        tipo = 'ordinario';
    const mNumero = q.match(/(primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa])\s+periodo/);
    const numero = mNumero ? (_a = ORDINALES[mNumero[1]]) !== null && _a !== void 0 ? _a : null : null;
    const mAnio = q.match(/(primer[oa]?|segund[oa])\s+ano/);
    const anio = mAnio ? (_b = ORDINALES[mAnio[1]]) !== null && _b !== void 0 ? _b : null : null;
    const candidatos = PERIODOS_LEGISLATIVOS.filter((p) => (numero == null || p.numero === numero) &&
        (tipo == null || p.tipo === tipo) &&
        (anio == null || p.anio === anio));
    return { candidatos, filtros: { numero, tipo, anio } };
}
const iniciativasPorPeriodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const q = ((_a = req.query.q) !== null && _a !== void 0 ? _a : '').trim();
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
        const reporte = yield (0, estadistico_1.construirReporteBase)();
        const dentroDelPeriodo = (raw) => {
            if (!raw)
                return false;
            const fecha = new Date(raw);
            if (isNaN(fecha.getTime()))
                return false;
            const iso = fecha.toISOString().slice(0, 10);
            return iso >= periodo.inicio && iso <= periodo.fin;
        };
        const coincidencias = reporte
            .filter((item) => dentroDelPeriodo(item.fecha_evento_raw))
            .sort((a, b) => String(a.fecha_evento_raw).localeCompare(String(b.fecha_evento_raw)));
        const iniciativas = coincidencias.map((item) => {
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
                documento: (_a = item.documento) !== null && _a !== void 0 ? _a : null,
            });
        });
        return res.status(200).json({
            msg: 'Exito',
            periodo: { nombre: periodo.nombre, inicio: periodo.inicio, fin: periodo.fin },
            total: iniciativas.length,
            iniciativas,
        });
    }
    catch (error) {
        console.error('Error consultando iniciativas por periodo:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al consultar iniciativas por periodo', error: error.message });
    }
});
exports.iniciativasPorPeriodo = iniciativasPorPeriodo;
// ─── Votaciones por sesión / evento ──────────────────────────────────────────
const MESES_NOMBRE = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};
// IniciativaPuntoOrden.tipo: 1 = Iniciativa, 2 = Punto de acuerdo, 3 = Minuta.
const TIPO_INICIATIVA_LABEL = { 1: 'Iniciativa', 2: 'Punto de acuerdo', 3: 'Minuta' };
// Fecha local (servidor) desplazada `offset` días, como "YYYY-MM-DD".
function fechaRelativaISO(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Convierte "hoy"/"ayer"/"mañana", "13 de mayo de 2026", "2026-05-13" o "13/05/2026" a "YYYY-MM-DD".
function fechaAISO(texto) {
    var _a;
    const q = quitarAcentos(texto.toLowerCase().trim());
    // Fechas relativas.
    if (!q || /\bhoy\b/.test(q))
        return fechaRelativaISO(0);
    if (/\bayer\b/.test(q))
        return fechaRelativaISO(-1);
    if (/\bmanana\b/.test(q))
        return fechaRelativaISO(1);
    const iso = (dia, mesIdx, anio) => mesIdx < 0 || mesIdx > 11 ? null : `${anio}-${String(mesIdx + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    let m = q.match(/\b(\d{1,2})\s+de\s+([a-z]+)\s+del?\s+(\d{4})\b/);
    if (m)
        return iso(parseInt(m[1], 10), (_a = MESES_NOMBRE[m[2]]) !== null && _a !== void 0 ? _a : -1, m[3]);
    m = q.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (m)
        return iso(parseInt(m[3], 10), parseInt(m[2], 10) - 1, m[1]);
    m = q.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (m)
        return iso(parseInt(m[1], 10), parseInt(m[2], 10) - 1, m[3]);
    return null;
}
const iniciativasVotadasEnSesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Sin fecha → "hoy".
    const fechaTexto = ((_b = ((_a = req.query.fecha) !== null && _a !== void 0 ? _a : req.query.q)) !== null && _b !== void 0 ? _b : '').trim();
    const iso = fechaAISO(fechaTexto);
    if (!iso) {
        return res.status(400).json({
            msg: `No pude interpretar la fecha "${fechaTexto}". Usa "hoy", "13 de mayo de 2026", "2026-05-13" o "13/05/2026".`,
        });
    }
    // Filtro opcional por tipo de evento, ej. ?tipo=sesion  o  ?tipo=comision
    const tipoFiltro = quitarAcentos(((_c = req.query.tipo) !== null && _c !== void 0 ? _c : '').toLowerCase().trim());
    try {
        // 1) Eventos de la agenda en esa fecha.
        const eventos = yield agendas_1.default.findAll({
            where: { fecha: { [sequelize_1.Op.gte]: `${iso} 00:00:00`, [sequelize_1.Op.lte]: `${iso} 23:59:59` } },
            attributes: ['id', 'fecha', 'descripcion'],
            include: [{ model: tipo_eventos_1.default, as: 'tipoevento', attributes: ['nombre'] }],
            order: [['fecha', 'ASC']],
        });
        const eventosFiltrados = tipoFiltro
            ? eventos.filter((e) => { var _a, _b; return quitarAcentos(String((_b = (_a = e.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) !== null && _b !== void 0 ? _b : '').toLowerCase()).includes(tipoFiltro); })
            : eventos;
        if (!eventosFiltrados.length) {
            return res.status(200).json({ msg: `No encontré eventos en la agenda con fecha ${iso}.`, fecha: iso, total_eventos: 0, eventos: [] });
        }
        // 2) Puntos del orden del día de esos eventos, con su iniciativa/PA/minuta (si tiene).
        const eventoIds = eventosFiltrados.map((e) => e.id);
        const puntos = yield puntos_ordens_1.default.findAll({
            where: { id_evento: { [sequelize_1.Op.in]: eventoIds } },
            attributes: ['id', 'id_evento', 'nopunto', 'punto'],
            order: [['nopunto', 'ASC']],
            include: [{ model: inciativas_puntos_ordens_1.default, as: 'iniciativas', attributes: ['id', 'iniciativa', 'tipo'], required: false }],
        });
        // 3) Votos de todos esos puntos (sentido 1=favor, 2=abstención, 3=contra).
        const puntoIds = puntos.map((p) => p.id);
        const votosRaw = puntoIds.length
            ? yield votos_punto_1.default.findAll({
                where: { id_punto: { [sequelize_1.Op.in]: puntoIds }, sentido: { [sequelize_1.Op.in]: [1, 2, 3] }, },
                attributes: ['id_punto', 'sentido', 'id_diputado', 'id_partido'],
                paranoid: true,
                raw: true,
            })
            : [];
        // Catálogos de nombres (Diputado/Partidos viven en otra BD → consulta aparte).
        const dipIds = [...new Set(votosRaw.map((v) => v.id_diputado).filter(Boolean))];
        const parIds = [...new Set(votosRaw.map((v) => v.id_partido).filter(Boolean))];
        const [dips, pars] = yield Promise.all([
            dipIds.length ? diputado_1.default.findAll({ where: { id: dipIds }, attributes: ['id', 'apaterno', 'amaterno', 'nombres'], paranoid: false, raw: true }) : [],
            parIds.length ? partidos_1.default.findAll({ where: { id: parIds }, attributes: ['id', 'siglas'], raw: true }) : [],
        ]);
        const dipMap = new Map(dips.map((d) => [d.id, `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim()]));
        const parMap = new Map(pars.map((p) => [p.id, p.siglas]));
        const votosPorPunto = new Map();
        for (const v of votosRaw) {
            const pid = Number(v.id_punto);
            if (!votosPorPunto.has(pid))
                votosPorPunto.set(pid, []);
            votosPorPunto.get(pid).push(v);
        }
        // Resumen de votación de un punto (null si no se votó).
        const construirVotacion = (puntoId) => {
            var _a, _b, _c, _d, _e;
            const votos = (_a = votosPorPunto.get(puntoId)) !== null && _a !== void 0 ? _a : [];
            if (!votos.length)
                return null;
            let a_favor = 0, en_contra = 0, abstencion = 0;
            const votaronContra = [];
            const seAbstuvieron = [];
            for (const v of votos) {
                if (v.sentido === 1)
                    a_favor++;
                else if (v.sentido === 2) {
                    abstencion++;
                    seAbstuvieron.push({ diputado: (_b = dipMap.get(v.id_diputado)) !== null && _b !== void 0 ? _b : '-', partido: (_c = parMap.get(v.id_partido)) !== null && _c !== void 0 ? _c : null });
                }
                else if (v.sentido === 3) {
                    en_contra++;
                    votaronContra.push({ diputado: (_d = dipMap.get(v.id_diputado)) !== null && _d !== void 0 ? _d : '-', partido: (_e = parMap.get(v.id_partido)) !== null && _e !== void 0 ? _e : null });
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
        const puntosPorEvento = new Map();
        for (const p of puntos) {
            const key = String(p.id_evento);
            if (!puntosPorEvento.has(key))
                puntosPorEvento.set(key, []);
            puntosPorEvento.get(key).push(p);
        }
        const eventosSalida = eventosFiltrados.map((e) => {
            var _a, _b, _c, _d;
            const ptos = ((_a = puntosPorEvento.get(String(e.id))) !== null && _a !== void 0 ? _a : []).map((p) => {
                var _a, _b, _c;
                const iniciativas = ((_a = p.iniciativas) !== null && _a !== void 0 ? _a : []).map((ini) => {
                    var _a, _b;
                    return ({
                        titulo: (_a = ini.iniciativa) !== null && _a !== void 0 ? _a : null,
                        tipo: (_b = TIPO_INICIATIVA_LABEL[Number(ini.tipo)]) !== null && _b !== void 0 ? _b : null,
                    });
                });
                const votacion = construirVotacion(Number(p.id));
                return {
                    nopunto: (_b = p.nopunto) !== null && _b !== void 0 ? _b : null,
                    punto: (_c = p.punto) !== null && _c !== void 0 ? _c : null,
                    iniciativas, // vacío = "solo se votó el punto"
                    se_voto: votacion != null,
                    votacion, // null = sin votación registrada
                };
            });
            return {
                id: e.id,
                tipo_evento: (_c = (_b = e.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) !== null && _c !== void 0 ? _c : null,
                descripcion: (_d = e.descripcion) !== null && _d !== void 0 ? _d : null,
                total_puntos: ptos.length,
                puntos_votados: ptos.filter((x) => x.se_voto).length,
                puntos: ptos,
            };
        });
        return res.status(200).json({ msg: 'Exito', fecha: iso, total_eventos: eventosSalida.length, eventos: eventosSalida });
    }
    catch (error) {
        console.error('Error consultando votaciones de la sesión:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al consultar las votaciones de la sesión', error: error.message });
    }
});
exports.iniciativasVotadasEnSesion = iniciativasVotadasEnSesion;
const integrantesDiputacionPermanente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Filtro opcional por periodo/nombre, ej. ?q=segundo año  (si se omite, devuelve todos los periodos)
    const q = ((_a = req.query.q) !== null && _a !== void 0 ? _a : '').trim();
    try {
        // La Diputación Permanente se identifica por su TIPO de comisión, no por su nombre
        // (cada periodo tiene un nombre distinto: "DIP PERMANENTE DEL PRIMER AÑO...", etc.).
        // Se usa el id EXACTO del tipo; un LIKE laxo traía por error los "Comités".
        const comisiones = yield comisions_1.default.findAll({
            where: { tipo_comision_id: TIPO_DIPUTACION_PERMANENTE_ID },
            attributes: ['id', 'nombre', 'alias'],
        });
        if (!comisiones.length) {
            return res.status(200).json({ msg: 'Sin resultados', total: 0, periodos: [] });
        }
        // Filtro opcional: todos los términos deben aparecer en el nombre del periodo.
        let comisionesFiltradas = comisiones;
        if (q) {
            const terminos = quitarAcentos(q.toLowerCase()).split(/\s+/).filter(Boolean);
            const match = comisiones.filter((c) => {
                var _a;
                const nombre = quitarAcentos(String((_a = c.nombre) !== null && _a !== void 0 ? _a : '').toLowerCase());
                return terminos.every((t) => nombre.includes(t));
            });
            if (match.length)
                comisionesFiltradas = match; // si el filtro no acota nada, se devuelven todos
        }
        const periodos = yield Promise.all(comisionesFiltradas.map((comision) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Sin filtro de fecha_fin: queremos el roster completo de cada periodo (incluye los ya concluidos).
            const miembros = yield integrante_comisions_1.default.findAll({
                where: { comision_id: comision.id },
                include: [
                    {
                        model: integrante_legislaturas_1.default,
                        as: 'integranteLegislatura',
                        include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                    },
                    { model: tipo_cargo_comisions_1.default, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
                ],
                order: [['orden', 'ASC']],
            });
            const integrantes = miembros
                .map((m) => {
                var _a, _b, _c, _d, _e, _f;
                const d = (_a = m.integranteLegislatura) === null || _a === void 0 ? void 0 : _a.diputado;
                return {
                    nombre: d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '',
                    cargo: (_c = (_b = m.tipo_cargo) === null || _b === void 0 ? void 0 : _b.valor) !== null && _c !== void 0 ? _c : null,
                    _nivel: (_e = (_d = m.tipo_cargo) === null || _d === void 0 ? void 0 : _d.nivel) !== null && _e !== void 0 ? _e : 99,
                    _orden: (_f = m.orden) !== null && _f !== void 0 ? _f : 99,
                };
            })
                .sort((a, b) => a._nivel - b._nivel || a._orden - b._orden)
                .map((_a) => {
                var { _nivel, _orden } = _a, rest = __rest(_a, ["_nivel", "_orden"]);
                return rest;
            });
            return {
                id: comision.id,
                nombre: comision.nombre,
                alias: (_a = comision.alias) !== null && _a !== void 0 ? _a : null,
                total: integrantes.length,
                integrantes,
            };
        })));
        return res.status(200).json({ msg: 'Exito', total: periodos.length, periodos });
    }
    catch (error) {
        console.error('Error obteniendo Diputación Permanente:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener la Diputación Permanente', error: error.message });
    }
});
exports.integrantesDiputacionPermanente = integrantesDiputacionPermanente;
const integrantesJucopo = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Guardada como comisión "Junta de Coordinación Política".
        // Se buscan los tokens "coordinaci" y "politic" para tolerar acentos/variantes.
        const comision = yield comisions_1.default.findOne({
            where: {
                [sequelize_1.Op.and]: [
                    { nombre: { [sequelize_1.Op.like]: '%oordinaci%' } },
                    { nombre: { [sequelize_1.Op.like]: '%olitic%' } },
                ],
            },
            attributes: ['id', 'nombre', 'alias'],
        });
        if (!comision) {
            return res.status(404).json({ msg: 'No se encontró la Junta de Coordinación Política.' });
        }
        // Integrantes vigentes (fecha_fin null o '').
        const miembros = yield integrante_comisions_1.default.findAll({
            where: { comision_id: comision.id, [sequelize_1.Op.or]: [{ fecha_fin: null }, { fecha_fin: '' }] },
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: 'integranteLegislatura',
                    include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                },
                { model: tipo_cargo_comisions_1.default, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
            ],
            order: [['orden', 'ASC']],
        });
        const integrantes = miembros
            .map((m) => {
            var _a, _b, _c, _d, _e, _f;
            const d = (_a = m.integranteLegislatura) === null || _a === void 0 ? void 0 : _a.diputado;
            return {
                nombre: d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '',
                cargo: (_c = (_b = m.tipo_cargo) === null || _b === void 0 ? void 0 : _b.valor) !== null && _c !== void 0 ? _c : null,
                _nivel: (_e = (_d = m.tipo_cargo) === null || _d === void 0 ? void 0 : _d.nivel) !== null && _e !== void 0 ? _e : 99,
                _orden: (_f = m.orden) !== null && _f !== void 0 ? _f : 99,
            };
        })
            .sort((a, b) => a._nivel - b._nivel || a._orden - b._orden)
            .map((_a) => {
            var { _nivel, _orden } = _a, rest = __rest(_a, ["_nivel", "_orden"]);
            return rest;
        });
        // Presidencia = integrante cuyo cargo menciona "presiden".
        const presidente = (_a = integrantes.find((i) => { var _a; return quitarAcentos(String((_a = i.cargo) !== null && _a !== void 0 ? _a : '').toLowerCase()).includes('presiden'); })) !== null && _a !== void 0 ? _a : null;
        return res.status(200).json({
            msg: 'Exito',
            comision: { id: comision.id, nombre: comision.nombre, alias: (_b = comision.alias) !== null && _b !== void 0 ? _b : null },
            presidente,
            total: integrantes.length,
            integrantes,
        });
    }
    catch (error) {
        console.error('Error obteniendo la Junta de Coordinación Política:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener la Junta de Coordinación Política', error: error.message });
    }
});
exports.integrantesJucopo = integrantesJucopo;
