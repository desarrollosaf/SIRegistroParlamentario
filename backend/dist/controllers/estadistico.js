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
exports.getasistencia = exports.geteventos = exports.getVotosCierre = exports.getReporteIniciativasIntegrantes = exports.getTotalesPorPeriodo = exports.getIniciativasPorGrupoYDiputado = exports.getIniciativasAprobadas = exports.getIniciativasEnEstudio = exports.getifnini = exports.getEventosPorComision = exports.getIniciativasTurnadasPorComision = exports.getIniciativasPresentadasPorDiputado = exports.getResumenTotalesEndpoint = void 0;
const sequelize_1 = require("sequelize");
const ExcelJS = require("exceljs");
const agendas_1 = __importDefault(require("../models/agendas"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../models/iniciativas_estudio"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const comisions_1 = __importDefault(require("../models/comisions"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const puntos_comisiones_1 = __importDefault(require("../models/puntos_comisiones"));
const proponentes_1 = __importDefault(require("../models/proponentes"));
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const secretarias_1 = __importDefault(require("../models/secretarias"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const partidos_1 = __importDefault(require("../models/partidos"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const diputado_1 = __importDefault(require("../models/diputado"));
const iniciativaspresenta_1 = __importDefault(require("../models/iniciativaspresenta"));
const expedientes_estudio_puntos_1 = __importDefault(require("../models/expedientes_estudio_puntos"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const tipo_cargo_comisions_1 = __importDefault(require("../models/tipo_cargo_comisions"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const sedes_1 = __importDefault(require("../models/sedes"));
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PUROS (sin I/O)
// ─────────────────────────────────────────────────────────────────────────────
const deduplicarPorId = (items) => items.filter((e, idx, self) => idx === self.findIndex((x) => x.id === e.id));
const formatearFechaCorta = (fecha) => {
    if (!fecha)
        return "-";
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const d = new Date(fecha);
    return `${String(d.getUTCDate()).padStart(2, "0")}-${meses[d.getUTCMonth()]}-${String(d.getUTCFullYear()).slice(-2)}`;
};
const obtenerPeriodo = (fecha) => {
    if (!fecha)
        return "-";
    const d = new Date(fecha);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
const normalizarTexto = (valor) => valor ? String(valor).trim() || "-" : "-";
// ─────────────────────────────────────────────────────────────────────────────
// CARGA MASIVA DE CATÁLOGOS  (una sola vez, todo en paralelo)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Devuelve Maps indexados por ID para lookup O(1).
 * Esto reemplaza las decenas de findOne() individuales dentro del loop.
 */
const cargarCatalogos = () => __awaiter(void 0, void 0, void 0, function* () {
    const [diputados, integrantes, partidos, comisiones, municipios, secretarias, legislaturas, catFunDep, proponentes,] = yield Promise.all([
        diputado_1.default.findAll({ raw: true }),
        integrante_legislaturas_1.default.findAll({ raw: true }),
        partidos_1.default.findAll({ attributes: ["id", "nombre"], raw: true }),
        comisions_1.default.findAll({ attributes: ["id", "nombre"], raw: true }),
        municipiosag_1.default.findAll({ raw: true }),
        secretarias_1.default.findAll({ raw: true }),
        legislaturas_1.default.findAll({ raw: true }),
        cat_fun_dep_1.default.findAll({ raw: true }),
        proponentes_1.default.findAll({ attributes: ["id", "valor"], raw: true }),
    ]);
    // Maps clave → objeto
    const mapDiputados = new Map(diputados.map((d) => [String(d.id), d]));
    const mapIntegrantes = new Map(integrantes.map((i) => { var _a; return [String((_a = i.diputado_id) !== null && _a !== void 0 ? _a : i.id), i]; }));
    const mapPartidos = new Map(partidos.map((p) => [String(p.id), p]));
    const mapComisiones = new Map(comisiones.map((c) => [String(c.id), c]));
    const mapMunicipios = new Map(municipios.map((m) => [String(m.id), m]));
    const mapSecretarias = new Map(secretarias.map((s) => [String(s.id), s]));
    const mapLegislaturas = new Map(legislaturas.map((l) => [String(l.id), l]));
    const mapCatFunDep = new Map(catFunDep.map((c) => [String(c.id), c]));
    const mapProponentes = new Map(proponentes.map((p) => [String(p.id), p]));
    return {
        mapDiputados,
        mapIntegrantes,
        mapPartidos,
        mapComisiones,
        mapMunicipios,
        mapSecretarias,
        mapLegislaturas,
        mapCatFunDep,
        mapProponentes,
    };
});
// ─────────────────────────────────────────────────────────────────────────────
// PRESENTANTES  (ya sin queries — usa Maps)
// ─────────────────────────────────────────────────────────────────────────────
const getPresentantesDePunto = (presentanRows, // filas de IniciativasPresenta para este id_iniciativa
catalogos) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const { mapDiputados, mapIntegrantes, mapPartidos, mapComisiones, mapMunicipios, mapSecretarias, mapLegislaturas, mapCatFunDep, mapProponentes, } = catalogos;
    const proponentesUnicos = new Map();
    const presentaData = [];
    const diputados = [];
    const diputadoIds = [];
    const gruposParlamentarios = [];
    const grupoParlamentarioIds = [];
    for (const p of presentanRows) {
        const tipo = mapProponentes.get(String(p.id_tipo_presenta));
        const tipoValor = (_a = tipo === null || tipo === void 0 ? void 0 : tipo.valor) !== null && _a !== void 0 ? _a : "";
        let valor = "";
        if (tipoValor === "Diputadas y Diputados") {
            const dip = mapDiputados.get(String(p.id_presenta));
            if (dip) {
                valor = `${(_b = dip.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.amaterno) !== null && _c !== void 0 ? _c : ""} ${(_d = dip.nombres) !== null && _d !== void 0 ? _d : ""}`.trim();
                if (valor)
                    diputados.push(valor);
                if (p.id_presenta)
                    diputadoIds.push(String(p.id_presenta));
                // El integrante puede estar indexado por diputado_id o directamente por id
                const integrante = mapIntegrantes.get(String(dip.id));
                if (integrante) {
                    const partido = mapPartidos.get(String(integrante.partido_id));
                    if (partido === null || partido === void 0 ? void 0 : partido.nombre)
                        gruposParlamentarios.push(partido.nombre);
                    if (partido === null || partido === void 0 ? void 0 : partido.id)
                        grupoParlamentarioIds.push(String(partido.id));
                }
            }
        }
        else if (["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)) {
            valor = (_f = (_e = mapComisiones.get(String(p.id_presenta))) === null || _e === void 0 ? void 0 : _e.nombre) !== null && _f !== void 0 ? _f : "";
        }
        else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
            valor = (_h = (_g = mapMunicipios.get(String(p.id_presenta))) === null || _g === void 0 ? void 0 : _g.nombre) !== null && _h !== void 0 ? _h : "";
        }
        else if (tipoValor === "Grupo Parlamentario") {
            const partido = mapPartidos.get(String(p.id_presenta));
            valor = (_j = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _j !== void 0 ? _j : "";
            if (valor)
                gruposParlamentarios.push(valor);
            if (partido === null || partido === void 0 ? void 0 : partido.id)
                grupoParlamentarioIds.push(String(partido.id));
        }
        else if (tipoValor === "Legislatura") {
            valor = String((_l = (_k = mapLegislaturas.get(String(p.id_presenta))) === null || _k === void 0 ? void 0 : _k.numero) !== null && _l !== void 0 ? _l : "");
        }
        else if (tipoValor === "Secretarías del GEM") {
            const sec = mapSecretarias.get(String(p.id_presenta));
            valor = sec ? `${(_m = sec.nombre) !== null && _m !== void 0 ? _m : ""} / ${(_o = sec.titular) !== null && _o !== void 0 ? _o : ""}`.trim() : "";
        }
        else {
            valor = (_q = (_p = mapCatFunDep.get(String(p.id_presenta))) === null || _p === void 0 ? void 0 : _p.nombre_titular) !== null && _q !== void 0 ? _q : "";
        }
        if (tipoValor && !proponentesUnicos.has(tipoValor))
            proponentesUnicos.set(tipoValor, tipoValor);
        if (valor)
            presentaData.push(valor);
    }
    return {
        proponentesString: [...proponentesUnicos.keys()].join(", "),
        presentaString: presentaData.join(", "),
        diputados: [...new Set(diputados)],
        diputadoIds: [...new Set(diputadoIds)],
        gruposParlamentarios: [...new Set(gruposParlamentarios)],
        grupoParlamentarioIds: [...new Set(grupoParlamentarioIds)],
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// QUERY BASE DE INICIATIVAS  (igual que antes — el ORM ya hace sus joins)
// ─────────────────────────────────────────────────────────────────────────────
const obtenerIniciativasBase = () => __awaiter(void 0, void 0, void 0, function* () {
    return inciativas_puntos_ordens_1.default.findAll({
        attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida", "tipo"],
        include: [
            {
                model: puntos_ordens_1.default, as: "punto",
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
                include: [{
                        model: iniciativas_estudio_1.default, as: "estudio",
                        attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
                        required: false, where: { type: 1 },
                        include: [{
                                model: puntos_ordens_1.default, as: "iniciativa",
                                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
                                include: [{
                                        model: agendas_1.default, as: "evento",
                                        attributes: ["id", "fecha", "descripcion", "liga"],
                                        include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                                    }]
                            }]
                    }]
            },
            {
                model: expedientes_estudio_puntos_1.default, as: "expedienteturno",
                attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
                include: [{
                        model: iniciativas_estudio_1.default, as: "estudio",
                        attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
                        required: false,
                        include: [{
                                model: puntos_ordens_1.default, as: "iniciativa",
                                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
                                include: [{
                                        model: agendas_1.default, as: "evento",
                                        attributes: ["id", "fecha", "descripcion", "liga"],
                                        include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                                    }]
                            }]
                    }]
            },
            {
                model: agendas_1.default, as: "evento",
                attributes: ["id", "fecha", "descripcion", "liga"],
                include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
            }
        ],
        where: { publico: 1 },
        order: [["createdAt", "ASC"]]
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL REPORTE  (N+1 eliminado)
// ─────────────────────────────────────────────────────────────────────────────
const construirReporteBase = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    // 1) Todas las queries en paralelo — catálogos + iniciativas + relaciones auxiliares
    const [iniciativasRaw, catalogos, todasPresentan, todosAnfitriones, todosPuntosComisiones] = yield Promise.all([
        obtenerIniciativasBase(),
        cargarCatalogos(),
        iniciativaspresenta_1.default.findAll({ raw: true }),
        anfitrion_agendas_1.default.findAll({ attributes: ["agenda_id", "autor_id"], raw: true }),
        puntos_comisiones_1.default.findAll({ attributes: ["id_punto", "id_comision"], raw: true }),
    ]);
    // 2) Agrupar presentantes por id_iniciativa  → Map<iniciativaId, rows[]>
    const presentanPorIniciativa = new Map();
    for (const row of todasPresentan) {
        const key = String(row.id_iniciativa);
        if (!presentanPorIniciativa.has(key))
            presentanPorIniciativa.set(key, []);
        presentanPorIniciativa.get(key).push(row);
    }
    // 3) Anfitriones por agenda_id → Map<agendaId, nombre[]>
    const anfitrionesMap = new Map();
    const { mapComisiones } = catalogos;
    for (const a of todosAnfitriones) {
        const key = String(a.agenda_id);
        if (!anfitrionesMap.has(key))
            anfitrionesMap.set(key, []);
        const nombre = (_a = mapComisiones.get(String(a.autor_id))) === null || _a === void 0 ? void 0 : _a.nombre;
        if (nombre)
            anfitrionesMap.get(key).push(nombre);
    }
    // 4) Comisiones turnadas por punto_id → Map<puntoId, nombre[]>
    const comisionesTurnadoMap = new Map();
    for (const row of todosPuntosComisiones) {
        const key = String(row.id_punto);
        const ids = String((_b = row.id_comision) !== null && _b !== void 0 ? _b : "")
            .replace(/[\[\]]/g, "").split(",")
            .map((x) => x.trim()).filter(Boolean);
        if (!comisionesTurnadoMap.has(key))
            comisionesTurnadoMap.set(key, []);
        for (const cid of ids) {
            const nombre = (_c = mapComisiones.get(cid)) === null || _c === void 0 ? void 0 : _c.nombre;
            if (nombre)
                comisionesTurnadoMap.get(key).push(nombre);
        }
    }
    // 5) Reunir todos los punto_ids y expediente_ids para resolver cierres en batch
    const iniciativas = iniciativasRaw.map((i) => i.toJSON());
    const todosLosPuntoIds = new Set();
    const todosLosExpedienteIds = new Set();
    for (const data of iniciativas) {
        if ((_d = data.punto) === null || _d === void 0 ? void 0 : _d.id)
            todosLosPuntoIds.add(String(data.punto.id));
        const estudios = [
            ...(Array.isArray((_e = data.punto) === null || _e === void 0 ? void 0 : _e.estudio) ? data.punto.estudio : []),
            ...(Array.isArray(data.expedienteturno)
                ? data.expedienteturno.flatMap((exp) => Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : [])
                : [])
        ];
        for (const e of deduplicarPorId(estudios)) {
            if (e.punto_destino_id)
                todosLosPuntoIds.add(String(e.punto_destino_id));
        }
    }
    // Batch: expedientes relacionados a todos los puntos de una sola vez
    const expRelacionados = todosLosPuntoIds.size > 0
        ? yield expedientes_estudio_puntos_1.default.findAll({
            where: { punto_origen_sesion_id: { [sequelize_1.Op.in]: [...todosLosPuntoIds] } },
            attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
            raw: true
        })
        : [];
    // Map: punto_id → expediente_ids[]
    const expedientesPorPunto = new Map();
    for (const e of expRelacionados) {
        const key = String(e.punto_origen_sesion_id);
        if (!expedientesPorPunto.has(key))
            expedientesPorPunto.set(key, []);
        if (e.expediente_id)
            expedientesPorPunto.get(key).push(String(e.expediente_id));
    }
    for (const eid of expRelacionados) {
        if (eid.expediente_id)
            todosLosExpedienteIds.add(String(eid.expediente_id));
    }
    // Batch: todos los cierres (status=3) de una sola vez
    const cierresOrWhere = [];
    if (todosLosPuntoIds.size > 0)
        cierresOrWhere.push({ punto_origen_id: { [sequelize_1.Op.in]: [...todosLosPuntoIds] } });
    if (todosLosExpedienteIds.size > 0)
        cierresOrWhere.push({ punto_origen_id: { [sequelize_1.Op.in]: [...todosLosExpedienteIds] } });
    const cierresDB = cierresOrWhere.length > 0
        ? yield iniciativas_estudio_1.default.findAll({
            where: { status: "3", [sequelize_1.Op.or]: cierresOrWhere },
            include: [{
                    model: puntos_ordens_1.default, as: "iniciativa",
                    attributes: ["id", "punto", "nopunto", "tribuna"],
                    include: [{
                            model: agendas_1.default, as: "evento",
                            attributes: ["id", "fecha", "descripcion", "liga"],
                            include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                        }]
                }]
        })
        : [];
    // Map: punto_origen_id → cierre
    const cierresPorPunto = new Map();
    for (const c of cierresDB) {
        const cd = typeof c.toJSON === "function" ? c.toJSON() : c;
        if (!cierresPorPunto.has(String(cd.punto_origen_id)))
            cierresPorPunto.set(String(cd.punto_origen_id), cd);
    }
    // 6) Construir el reporte — solo JS, cero queries adicionales
    return iniciativas.map((data, index) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const presentanRows = (_a = presentanPorIniciativa.get(String(data.id))) !== null && _a !== void 0 ? _a : [];
        const { proponentesString, presentaString, diputados, diputadoIds, gruposParlamentarios, grupoParlamentarioIds, } = getPresentantesDePunto(presentanRows, catalogos);
        const todosEstudios = [
            ...(Array.isArray((_b = data.punto) === null || _b === void 0 ? void 0 : _b.estudio) ? data.punto.estudio : []),
            ...(Array.isArray(data.expedienteturno)
                ? data.expedienteturno.flatMap((exp) => Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : [])
                : [])
        ];
        const fuenteEstudios = deduplicarPorId(todosEstudios);
        const estudios = fuenteEstudios.filter((e) => e.status === "1");
        const dictamenes = fuenteEstudios.filter((e) => e.status === "2");
        const rechazadocomi = fuenteEstudios.filter((e) => e.status === "4");
        const rechazosesion = fuenteEstudios.filter((e) => e.status === "5");
        const dispensa = String((_c = data.punto) === null || _c === void 0 ? void 0 : _c.dispensa) === "1";
        const precluida = String(data.precluida) === "1";
        // Resolver cierre usando el Map precargado
        const posiblesPuntosIds = [
            (_d = data.punto) === null || _d === void 0 ? void 0 : _d.id,
            ...fuenteEstudios.map((e) => e.punto_destino_id).filter(Boolean)
        ].filter(Boolean).map(String);
        let cierrePrincipal = null;
        for (const pid of posiblesPuntosIds) {
            if (cierresPorPunto.has(pid)) {
                cierrePrincipal = cierresPorPunto.get(pid);
                break;
            }
        }
        // También buscar por expediente_id si aplica
        if (!cierrePrincipal) {
            for (const pid of posiblesPuntosIds) {
                const expIds = (_e = expedientesPorPunto.get(pid)) !== null && _e !== void 0 ? _e : [];
                for (const eid of expIds) {
                    if (cierresPorPunto.has(eid)) {
                        cierrePrincipal = cierresPorPunto.get(eid);
                        break;
                    }
                }
                if (cierrePrincipal)
                    break;
            }
        }
        let observacion = "En estudio";
        if (precluida) {
            observacion = "Precluida";
        }
        else if (dispensa) {
            observacion = "Aprobada";
        }
        else if (cierrePrincipal) {
            observacion = "Aprobada";
        }
        else if (rechazosesion.length > 0) {
            observacion = "Rechazada en sesión";
        }
        else if (rechazadocomi.length > 0) {
            observacion = "Rechazada en comisión";
        }
        else if (dictamenes.length > 0 || estudios.length > 0) {
            observacion = "En estudio";
        }
        // Comisiones turnadas (lookup O(1))
        const puntoId = ((_f = data.punto) === null || _f === void 0 ? void 0 : _f.id) ? String(data.punto.id) : null;
        const comisionesTurnado = puntoId
            ? [...new Set((_g = comisionesTurnadoMap.get(puntoId)) !== null && _g !== void 0 ? _g : [])].join(", ")
            : null;
        // Anfitriones (solo si no es Sesión)
        const tipoNombre = (_k = (_j = (_h = data.evento) === null || _h === void 0 ? void 0 : _h.tipoevento) === null || _j === void 0 ? void 0 : _j.nombre) !== null && _k !== void 0 ? _k : "";
        const comisionesAnfitrion = tipoNombre !== "Sesión" && ((_l = data.evento) === null || _l === void 0 ? void 0 : _l.id)
            ? [...new Set((_m = anfitrionesMap.get(String(data.evento.id))) !== null && _m !== void 0 ? _m : [])].join(", ")
            : null;
        const fechaEventoRaw = (_p = (_o = data.evento) === null || _o === void 0 ? void 0 : _o.fecha) !== null && _p !== void 0 ? _p : null;
        const fechaExpedicion = ((_r = (_q = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _q === void 0 ? void 0 : _q.evento) === null || _r === void 0 ? void 0 : _r.fecha)
            ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
            : "-";
        return {
            no: index + 1,
            id: normalizarTexto(data.id),
            tipo: Number((_s = data.tipo) !== null && _s !== void 0 ? _s : 0),
            autor: normalizarTexto(proponentesString),
            autor_detalle: normalizarTexto(presentaString),
            iniciativa: normalizarTexto(data.iniciativa),
            materia: normalizarTexto((_t = data.punto) === null || _t === void 0 ? void 0 : _t.punto),
            presentac: formatearFechaCorta(fechaEventoRaw),
            fecha_evento_raw: fechaEventoRaw,
            comisiones: normalizarTexto(comisionesTurnado || comisionesAnfitrion),
            expedicion: fechaExpedicion,
            observac: observacion,
            diputado: diputados.length > 0 ? diputados.join(", ") : "-",
            grupo_parlamentario: gruposParlamentarios.length > 0 ? gruposParlamentarios.join(", ") : "-",
            diputado_ids: diputadoIds,
            grupo_parlamentario_ids: grupoParlamentarioIds,
            periodo: obtenerPeriodo(fechaEventoRaw),
        };
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXCEL HELPER (sin cambios)
// ─────────────────────────────────────────────────────────────────────────────
const aplicarEstiloHoja = (worksheet) => {
    const headerRow = worksheet.getRow(1);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00B050" } };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1)
            return;
        row.eachCell((cell) => {
            cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
        row.height = 30;
    });
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
};
const enviarWorkbook = (res, workbook, nombreArchivo) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    yield workbook.xlsx.write(res);
    return res.end();
});
const generarExcelSimple = (res, nombreHoja, nombreArchivo, columnas, data) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(nombreHoja);
    worksheet.columns = columnas;
    data.forEach((item, index) => worksheet.addRow(Object.assign(Object.assign({}, item), { no: index + 1 })));
    aplicarEstiloHoja(worksheet);
    const ultimaColumna = String.fromCharCode(64 + columnas.length);
    worksheet.autoFilter = { from: "A1", to: `${ultimaColumna}1` };
    worksheet.getColumn("A").alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    return yield enviarWorkbook(res, workbook, nombreArchivo);
});
const contarPorObservacion = (items, obs) => items.filter((i) => i.observac === obs).length;
// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS  (idénticos externamente, internos usan el reporte optimizado)
// ─────────────────────────────────────────────────────────────────────────────
const getResumenTotalesEndpoint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const iniciativas = reporte.filter((i) => Number(i.tipo) === 1);
        const puntosAcuerdo = reporte.filter((i) => Number(i.tipo) === 2);
        const minutas = reporte.filter((i) => Number(i.tipo) === 3);
        const uuidSesion = 'd5687f72-a328-4be1-a23c-4c3575092163';
        const uuidpermanente = 'a413e44b-550b-47ab-b004-a6f28c73a750';
        const sesion = yield agendas_1.default.findAll({
            include: [
                {
                    model: tipo_eventos_1.default,
                    as: "tipoevento",
                    attributes: ["id", "nombre"],
                    where: {
                        id: {
                            [sequelize_1.Op.in]: [uuidSesion, uuidpermanente]
                        }
                    }
                }
            ],
            order: [['fecha', 'DESC']]
        });
        const comision = yield agendas_1.default.findAll({
            include: [
                {
                    model: tipo_eventos_1.default,
                    as: "tipoevento",
                    attributes: ["id", "nombre"],
                    where: {
                        id: '0e772516-bbc2-402f-afa0-022489752d33'
                    }
                }
            ],
            order: [['fecha', 'DESC']]
        });
        return res.status(200).json({
            ok: true,
            data: {
                iniciativas: {
                    en_estudio: contarPorObservacion(iniciativas, "En estudio"),
                    aprobadas: contarPorObservacion(iniciativas, "Aprobada"),
                    total: iniciativas.length,
                },
                minutas: {
                    aprobadas: contarPorObservacion(minutas, "Aprobada"),
                    total: minutas.length,
                },
                puntos_acuerdo: { total: puntosAcuerdo.length },
                totales_generales: {
                    iniciativas: iniciativas.length,
                    minutas: minutas.length,
                    puntos_acuerdo: puntosAcuerdo.length,
                    total_registros: reporte.length,
                    total_sesiones: sesion.length,
                    total_comisiones: comision.length
                },
            },
        });
    }
    catch (error) {
        console.error("Error al generar resumen:", error);
        return res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
    }
});
exports.getResumenTotalesEndpoint = getResumenTotalesEndpoint;
const getIniciativasPresentadasPorDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const id = (_b = (_a = req.params.id) !== null && _a !== void 0 ? _a : req.query.id) !== null && _b !== void 0 ? _b : req.body.id;
        if (!id)
            return res.status(400).json({ ok: false, message: "El id del diputado es obligatorio" });
        const diputadoId = String(id);
        const [diputadoRaw, reporte] = yield Promise.all([
            diputado_1.default.findOne({ where: { id: diputadoId }, include: [{ model: integrante_legislaturas_1.default, as: "integrante" }] }),
            construirReporteBase(),
        ]);
        if (!diputadoRaw)
            return res.status(404).json({ ok: false, message: "Diputado no encontrado" });
        const diputado = diputadoRaw;
        const nombreDiputado = `${(_c = diputado.apaterno) !== null && _c !== void 0 ? _c : ""} ${(_d = diputado.amaterno) !== null && _d !== void 0 ? _d : ""} ${(_e = diputado.nombres) !== null && _e !== void 0 ? _e : ""}`.trim();
        const grupoId = ((_f = diputado.integrante) === null || _f === void 0 ? void 0 : _f.partido_id) ? String(diputado.integrante.partido_id) : null;
        let grupoNombre = "-";
        if (grupoId) {
            const partido = yield partidos_1.default.findOne({ where: { id: grupoId }, attributes: ["id", "nombre"], raw: true });
            grupoNombre = (_g = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _g !== void 0 ? _g : "-";
        }
        const autorElla = reporte.filter((i) => i.diputado_ids.map(String).includes(diputadoId));
        const autorGrupo = grupoId
            ? reporte.filter((i) => i.grupo_parlamentario_ids.map(String).includes(String(grupoId)))
            : [];
        const mapaGeneral = new Map();
        [...autorElla, ...autorGrupo].forEach((i) => mapaGeneral.set(String(i.id), i));
        const totalGeneral = [...mapaGeneral.values()];
        const contarResumen = (items) => ({
            pendientes: items.filter((x) => x.observac === "Pendiente").length,
            en_estudio: items.filter((x) => x.observac === "En estudio").length,
            dictaminadas: items.filter((x) => x.observac === "Dictaminada").length,
            aprobadas: items.filter((x) => x.observac === "Aprobada").length,
            rechazadas_comision: items.filter((x) => x.observac === "Rechazada en comisión").length,
            rechazadas_sesion: items.filter((x) => x.observac === "Rechazada en sesión").length,
            precluidas: items.filter((x) => x.observac === "Precluida").length,
            total: items.length,
        });
        return res.status(200).json({
            ok: true,
            data: {
                diputado_id: diputadoId,
                diputado: nombreDiputado || "-",
                grupo_parlamentario_id: grupoId,
                grupo_parlamentario: grupoNombre,
                resumen_general: contarResumen(totalGeneral),
                autor_ella: { resumen: contarResumen(autorElla), data: autorElla },
                autor_grupo: { resumen: contarResumen(autorGrupo), data: autorGrupo },
            },
        });
    }
    catch (error) {
        console.error("Error al obtener iniciativas por diputado:", error);
        return res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
    }
});
exports.getIniciativasPresentadasPorDiputado = getIniciativasPresentadasPorDiputado;
const getIniciativasTurnadasPorComision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_b = (_a = req.params.id) !== null && _a !== void 0 ? _a : req.query.id) !== null && _b !== void 0 ? _b : req.body.id;
        if (!id)
            return res.status(400).json({ ok: false, message: "El id de la comisión es obligatorio" });
        const comisionId = String(id).trim();
        const [comisionRaw, puntosComisiones, reporte] = yield Promise.all([
            comisions_1.default.findOne({ where: { id: comisionId }, attributes: ["id", "nombre"], raw: true }),
            puntos_comisiones_1.default.findAll({ attributes: ["id_punto", "id_comision"], raw: true }),
            construirReporteBase(),
        ]);
        if (!comisionRaw)
            return res.status(404).json({ ok: false, message: "Comisión no encontrada" });
        const comision = comisionRaw;
        const puntosIds = [...new Set(puntosComisiones
                .filter((row) => {
                var _a;
                return String((_a = row.id_comision) !== null && _a !== void 0 ? _a : "").replace(/[\[\]]/g, "").split(",")
                    .map((x) => x.trim()).includes(comisionId);
            })
                .map((row) => String(row.id_punto))
                .filter(Boolean))];
        if (!puntosIds.length) {
            return res.status(404).json({
                ok: false,
                message: "No se encontraron iniciativas turnadas a esta comisión",
                data: { comision_id: comisionId, comision: comision.nombre, total: 0, iniciativas: [] },
            });
        }
        const iniciativasDB = yield inciativas_puntos_ordens_1.default.findAll({
            where: { id_punto: { [sequelize_1.Op.in]: puntosIds }, publico: 1 },
            attributes: ["id", "id_punto"],
            raw: true,
        });
        const iniciativasIds = new Set(iniciativasDB.map((r) => String(r.id)).filter(Boolean));
        if (!iniciativasIds.size) {
            return res.status(404).json({
                ok: false,
                message: "Se encontraron puntos turnados, pero no iniciativas relacionadas",
                data: { comision_id: comisionId, comision: comision.nombre, total: 0, iniciativas: [] },
            });
        }
        const filtrado = reporte.filter((i) => iniciativasIds.has(String(i.id)));
        const resumen = {
            pendientes: filtrado.filter((x) => x.observac === "Pendiente").length,
            en_estudio: filtrado.filter((x) => x.observac === "En estudio").length,
            dictaminadas: filtrado.filter((x) => x.observac === "Dictaminada").length,
            aprobadas: filtrado.filter((x) => x.observac === "Aprobada").length,
            rechazadas_comision: filtrado.filter((x) => x.observac === "Rechazada en comisión").length,
            rechazadas_sesion: filtrado.filter((x) => x.observac === "Rechazada en sesión").length,
            precluidas: filtrado.filter((x) => x.observac === "Precluida").length,
            total: filtrado.length,
        };
        return res.status(200).json({
            ok: true,
            data: { comision_id: String(comision.id), comision: comision.nombre, total: filtrado.length, resumen, iniciativas: filtrado },
        });
    }
    catch (error) {
        console.error("Error al obtener iniciativas por comisión:", error);
        return res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
    }
});
exports.getIniciativasTurnadasPorComision = getIniciativasTurnadasPorComision;
const getEventosPorComision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_b = (_a = req.params.id) !== null && _a !== void 0 ? _a : req.query.id) !== null && _b !== void 0 ? _b : req.body.id;
        if (!id)
            return res.status(400).json({ ok: false, message: "El id de la comisión es obligatorio" });
        const comisionId = String(id).trim();
        const comisionRaw = yield comisions_1.default.findOne({
            where: { id: comisionId },
            attributes: ["id", "nombre"],
            raw: true,
        });
        if (!comisionRaw)
            return res.status(404).json({ ok: false, message: "Comisión no encontrada" });
        const comision = comisionRaw;
        const anfitrionesRaw = yield anfitrion_agendas_1.default.findAll({
            where: { autor_id: comisionId },
            attributes: ["agenda_id", "autor_id"],
            raw: true,
        });
        if (!anfitrionesRaw.length) {
            return res.status(200).json({
                ok: true,
                data: {
                    comision_id: comisionId,
                    comision: comision.nombre,
                    resumen: {
                        total_eventos: 0,
                        total_iniciativas: 0,
                        total_votadas: 0,
                        total_no_votadas: 0,
                        aprobadas: 0,
                        rechazadas_sesion: 0,
                        rechazadas_comision: 0,
                        en_estudio: 0,
                    },
                    eventos: [],
                },
            });
        }
        const agendaIds = [
            ...new Set(anfitrionesRaw.map((a) => String(a.agenda_id))),
        ];
        const todosAnfitrionesRaw = yield anfitrion_agendas_1.default.findAll({
            where: {
                agenda_id: { [sequelize_1.Op.in]: agendaIds },
            },
            attributes: ["agenda_id", "autor_id", "tipo_autor_id"],
            raw: true,
            paranoid: false, // por si tiene deletedAt
        });
        const autoresPorAgenda = new Map();
        for (const a of todosAnfitrionesRaw) {
            const key = String(a.agenda_id);
            if (!autoresPorAgenda.has(key))
                autoresPorAgenda.set(key, []);
            autoresPorAgenda.get(key).push(String(a.autor_id));
        }
        const idsComisionesUnidas = [
            ...new Set(todosAnfitrionesRaw
                .map((a) => String(a.autor_id))
                .filter((aid) => aid !== comisionId)),
        ];
        // Nombres de las comisiones unidas en batch
        const comisionesUnidasBD = idsComisionesUnidas.length
            ? yield comisions_1.default.findAll({
                where: { id: { [sequelize_1.Op.in]: idsComisionesUnidas } },
                attributes: ["id", "nombre"],
                raw: true,
                paranoid: false,
            })
            : [];
        const comisionesUnidasMapa = new Map(comisionesUnidasBD.map((c) => { var _a; return [String(c.id), (_a = c.nombre) !== null && _a !== void 0 ? _a : "-"]; }));
        const agendasRaw = yield agendas_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: agendaIds } },
            attributes: ["id", "fecha", "descripcion", "liga"],
            include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }],
        });
        const agendasMap = new Map();
        for (const ag of agendasRaw) {
            const agJson = typeof ag.toJSON === "function" ? ag.toJSON() : ag;
            agendasMap.set(String(agJson.id), agJson);
        }
        const puntosOrdenRaw = yield puntos_ordens_1.default.findAll({
            where: { id_evento: { [sequelize_1.Op.in]: agendaIds } },
            attributes: ["id", "punto", "nopunto", "tribuna", "dispensa", "id_evento"],
            order: [["nopunto", "ASC"]],
            raw: true,
        });
        const puntosMap = new Map();
        const puntosPorAgenda = new Map();
        for (const p of puntosOrdenRaw) {
            puntosMap.set(String(p.id), p);
            const agId = String(p.id_evento);
            if (!puntosPorAgenda.has(agId))
                puntosPorAgenda.set(agId, []);
            puntosPorAgenda.get(agId).push(p);
        }
        const todosLosPuntosIds = [...puntosMap.keys()];
        const iniciativasDB = todosLosPuntosIds.length
            ? yield inciativas_puntos_ordens_1.default.findAll({
                where: { id_punto: { [sequelize_1.Op.in]: todosLosPuntosIds }, publico: 1 },
                attributes: ["id", "id_punto"],
                raw: true,
            })
            : [];
        const iniciativasPorPunto = new Map();
        const iniciativasIds = new Set();
        for (const ini of iniciativasDB) {
            const puntoId = String(ini.id_punto);
            const iniId = String(ini.id);
            iniciativasIds.add(iniId);
            if (!iniciativasPorPunto.has(puntoId))
                iniciativasPorPunto.set(puntoId, []);
            iniciativasPorPunto.get(puntoId).push(iniId);
        }
        const votosRaw = todosLosPuntosIds.length
            ? yield votos_punto_1.default.findAll({
                where: {
                    id_punto: { [sequelize_1.Op.in]: todosLosPuntosIds },
                    deletedAt: null,
                },
                attributes: ["id_punto"],
                group: ["id_punto"],
                raw: true,
            })
            : [];
        const puntosConVoto = new Set(votosRaw.map((v) => String(v.id_punto)));
        const reporte = yield construirReporteBase();
        const reporteMap = new Map();
        for (const item of reporte) {
            reporteMap.set(String(item.id), item);
        }
        const fueVotada = (observac) => ["Aprobada", "Rechazada en sesión", "Rechazada en comisión"].includes(observac);
        const todasLasIniciativasFiltradas = [];
        const eventos = agendaIds
            .map((agId) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const agenda = agendasMap.get(agId);
            const puntosDelDia = (_a = puntosPorAgenda.get(agId)) !== null && _a !== void 0 ? _a : [];
            const autoresDelEvento = (_b = autoresPorAgenda.get(agId)) !== null && _b !== void 0 ? _b : [];
            const comisionesUnidas = autoresDelEvento
                .filter((aid) => aid !== comisionId)
                .map((aid) => {
                var _a;
                return ({
                    comision_id: aid,
                    nombre: (_a = comisionesUnidasMapa.get(aid)) !== null && _a !== void 0 ? _a : "-",
                });
            });
            const ordenDelDia = puntosDelDia.map((punto) => {
                var _a, _b, _c;
                const iniIds = (_a = iniciativasPorPunto.get(String(punto.id))) !== null && _a !== void 0 ? _a : [];
                const iniciativas = iniIds
                    .map((iniId) => {
                    const item = reporteMap.get(iniId);
                    if (!item)
                        return null;
                    todasLasIniciativasFiltradas.push(item);
                    return Object.assign(Object.assign({}, item), { votada: fueVotada(item.observac) });
                })
                    .filter(Boolean);
                return {
                    punto_id: punto.id,
                    nopunto: (_b = punto.nopunto) !== null && _b !== void 0 ? _b : null,
                    descripcion: (_c = punto.punto) !== null && _c !== void 0 ? _c : "-",
                    tribuna: String(punto.tribuna) === "1",
                    dispensa: String(punto.dispensa) === "1",
                    voto: puntosConVoto.has(String(punto.id)),
                    tiene_iniciativas: iniciativas.length > 0,
                    iniciativas,
                };
            });
            const todasIniEvento = ordenDelDia.flatMap((p) => p.iniciativas);
            return {
                evento_id: agId,
                fecha: (_c = agenda === null || agenda === void 0 ? void 0 : agenda.fecha) !== null && _c !== void 0 ? _c : null,
                fecha_fmt: formatearFechaCorta(agenda === null || agenda === void 0 ? void 0 : agenda.fecha),
                descripcion: (_d = agenda === null || agenda === void 0 ? void 0 : agenda.descripcion) !== null && _d !== void 0 ? _d : "-",
                liga: (_e = agenda === null || agenda === void 0 ? void 0 : agenda.liga) !== null && _e !== void 0 ? _e : null,
                tipo_evento: (_g = (_f = agenda === null || agenda === void 0 ? void 0 : agenda.tipoevento) === null || _f === void 0 ? void 0 : _f.nombre) !== null && _g !== void 0 ? _g : "-",
                es_unida: comisionesUnidas.length > 0,
                comisiones_unidas: comisionesUnidas,
                total_puntos: ordenDelDia.length,
                total_iniciativas: todasIniEvento.length,
                votadas: todasIniEvento.filter((i) => i.votada).length,
                no_votadas: todasIniEvento.filter((i) => !i.votada).length,
                orden_del_dia: ordenDelDia,
            };
        })
            .sort((a, b) => {
            if (!a.fecha && !b.fecha)
                return 0;
            if (!a.fecha)
                return 1;
            if (!b.fecha)
                return -1;
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });
        const iniciativasUnicas = deduplicarPorId(todasLasIniciativasFiltradas);
        const resumenGlobal = {
            total_eventos: eventos.length,
            total_iniciativas: iniciativasUnicas.length,
            total_votadas: iniciativasUnicas.filter((i) => fueVotada(i.observac)).length,
            total_no_votadas: iniciativasUnicas.filter((i) => !fueVotada(i.observac)).length,
            aprobadas: iniciativasUnicas.filter((i) => i.observac === "Aprobada").length,
            rechazadas_sesion: iniciativasUnicas.filter((i) => i.observac === "Rechazada en sesión").length,
            rechazadas_comision: iniciativasUnicas.filter((i) => i.observac === "Rechazada en comisión").length,
            en_estudio: iniciativasUnicas.filter((i) => i.observac === "En estudio").length,
        };
        return res.status(200).json({
            ok: true,
            data: {
                comision_id: String(comision.id),
                comision: comision.nombre,
                resumen: resumenGlobal,
                eventos,
            },
        });
    }
    catch (error) {
        console.error("Error al obtener eventos por comisión:", error);
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor",
            error: error.message,
        });
    }
});
exports.getEventosPorComision = getEventosPorComision;
const getifnini = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        return yield generarExcelSimple(res, "Reporte Iniciativas", "reporte_iniciativas.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "ID", key: "id", width: 40 },
            { header: "AUTOR", key: "autor", width: 28 },
            { header: "PRESENTA", key: "autor_detalle", width: 35 },
            { header: "DIPUTADO", key: "diputado", width: 30 },
            { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
            { header: "INICIATIVA", key: "iniciativa", width: 55 },
            { header: "MATERIA", key: "materia", width: 45 },
            { header: "PRESENTAC.", key: "presentac", width: 15 },
            { header: "COMISIONES", key: "comisiones", width: 40 },
            { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
            { header: "OBSERVAC.", key: "observac", width: 20 },
            { header: "PERIODO", key: "periodo", width: 15 },
        ], reporte);
    }
    catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getifnini = getifnini;
const getIniciativasEnEstudio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const filtrado = reporte.filter((i) => i.observac === "En estudio");
        return yield generarExcelSimple(res, "En estudio", "reporte_iniciativas_en_estudio.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "ID", key: "id", width: 40 },
            { header: "AUTOR", key: "autor", width: 28 },
            { header: "PRESENTA", key: "autor_detalle", width: 35 },
            { header: "DIPUTADO", key: "diputado", width: 30 },
            { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
            { header: "INICIATIVA", key: "iniciativa", width: 55 },
            { header: "MATERIA", key: "materia", width: 45 },
            { header: "PRESENTAC.", key: "presentac", width: 15 },
            { header: "COMISIONES", key: "comisiones", width: 40 },
            { header: "OBSERVAC.", key: "observac", width: 20 },
            { header: "PERIODO", key: "periodo", width: 15 },
        ], filtrado);
    }
    catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getIniciativasEnEstudio = getIniciativasEnEstudio;
const getIniciativasAprobadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const filtrado = reporte.filter((i) => i.observac === "Aprobada");
        return yield generarExcelSimple(res, "Aprobadas", "reporte_iniciativas_aprobadas.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "ID", key: "id", width: 40 },
            { header: "AUTOR", key: "autor", width: 28 },
            { header: "PRESENTA", key: "autor_detalle", width: 35 },
            { header: "DIPUTADO", key: "diputado", width: 30 },
            { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
            { header: "INICIATIVA", key: "iniciativa", width: 55 },
            { header: "MATERIA", key: "materia", width: 45 },
            { header: "PRESENTAC.", key: "presentac", width: 15 },
            { header: "COMISIONES", key: "comisiones", width: 40 },
            { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
            { header: "OBSERVAC.", key: "observac", width: 20 },
            { header: "PERIODO", key: "periodo", width: 15 },
        ], filtrado);
    }
    catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getIniciativasAprobadas = getIniciativasAprobadas;
const getIniciativasPorGrupoYDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const mapa = new Map();
        for (const item of reporte) {
            const diputado = item.diputado || "-";
            const grupo = item.grupo_parlamentario || "-";
            const llave = `${diputado}__${grupo}`;
            if (!mapa.has(llave))
                mapa.set(llave, { diputado, grupo_parlamentario: grupo, pendientes: 0, en_estudio: 0, aprobadas: 0, total: 0 });
            const fila = mapa.get(llave);
            if (item.observac === "En estudio")
                fila.en_estudio += 1;
            if (item.observac === "Aprobada")
                fila.aprobadas += 1;
            if (item.observac === "Pendiente")
                fila.pendientes += 1;
            fila.total += 1;
        }
        const resultado = [...mapa.values()].sort((a, b) => a.grupo_parlamentario.localeCompare(b.grupo_parlamentario) || a.diputado.localeCompare(b.diputado));
        return yield generarExcelSimple(res, "Grupo y Diputado", "reporte_iniciativas_grupo_diputado.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "DIPUTADO", key: "diputado", width: 35 },
            { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 30 },
            { header: "PENDIENTES", key: "pendientes", width: 15 },
            { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
            { header: "APROBADAS", key: "aprobadas", width: 15 },
            { header: "TOTAL", key: "total", width: 12 },
        ], resultado);
    }
    catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getIniciativasPorGrupoYDiputado = getIniciativasPorGrupoYDiputado;
const getTotalesPorPeriodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const mapa = new Map();
        for (const item of reporte) {
            const periodo = item.periodo || "-";
            if (!mapa.has(periodo))
                mapa.set(periodo, { periodo, pendientes: 0, en_estudio: 0, aprobadas: 0, total: 0 });
            const fila = mapa.get(periodo);
            if (item.observac === "En estudio")
                fila.en_estudio += 1;
            if (item.observac === "Aprobada")
                fila.aprobadas += 1;
            if (item.observac === "Pendiente")
                fila.pendientes += 1;
            fila.total += 1;
        }
        const resultado = [...mapa.values()].sort((a, b) => a.periodo.localeCompare(b.periodo));
        return yield generarExcelSimple(res, "Totales por periodo", "reporte_iniciativas_totales_periodo.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "PERIODO", key: "periodo", width: 18 },
            { header: "PENDIENTES", key: "pendientes", width: 15 },
            { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
            { header: "APROBADAS", key: "aprobadas", width: 15 },
            { header: "TOTAL", key: "total", width: 12 },
        ], resultado);
    }
    catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getTotalesPorPeriodo = getTotalesPorPeriodo;
const getReporteIniciativasIntegrantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_tipo, id } = req.body;
        if (![1, 2, "1", "2"].includes(id_tipo))
            return res.status(400).json({ message: "id_tipo inválido. Debe ser 1 (Diputado) o 2 (Grupo Parlamentario)" });
        if (id === undefined || id === null || id === "")
            return res.status(400).json({ message: "El campo id es obligatorio. Usa 0 para traer todos." });
        const tipo = Number(id_tipo);
        const filtroId = String(id);
        const ID_TIPO_PRESENTA_DIPUTADO = 9;
        const ID_TIPO_PRESENTA_GRUPO = 19;
        const wherePresenta = { id_tipo_presenta: tipo === 2 ? ID_TIPO_PRESENTA_DIPUTADO : ID_TIPO_PRESENTA_GRUPO };
        if (filtroId !== "0")
            wherePresenta.id_presenta = filtroId;
        const [relaciones, reporte] = yield Promise.all([
            iniciativaspresenta_1.default.findAll({ where: wherePresenta, attributes: ["id_iniciativa", "id_presenta"], raw: true }),
            construirReporteBase(),
        ]);
        if (!relaciones.length)
            return res.status(404).json({ message: "No se encontraron iniciativas para el filtro enviado" });
        const iniciativasIds = new Set(relaciones.map((r) => String(r.id_iniciativa)).filter(Boolean));
        const reporteFiltrado = reporte.filter((i) => iniciativasIds.has(String(i.id)));
        if (!reporteFiltrado.length)
            return res.status(404).json({ message: "No se encontraron datos en el reporte base para esas iniciativas" });
        const contarFila = (items) => (Object.assign({ pendientes: 0, en_estudio: 0, dictaminadas: 0, aprobadas: 0, rechazadas_comision: 0, rechazadas_sesion: 0, total: 0 }, items.reduce((acc, i) => {
            if (i.observac === "Pendiente")
                acc.pendientes += 1;
            if (i.observac === "En estudio")
                acc.en_estudio += 1;
            if (i.observac === "Dictaminada")
                acc.dictaminadas += 1;
            if (i.observac === "Aprobada")
                acc.aprobadas += 1;
            if (i.observac === "Rechazada en comisión")
                acc.rechazadas_comision += 1;
            if (i.observac === "Rechazada en sesión")
                acc.rechazadas_sesion += 1;
            acc.total += 1;
            return acc;
        }, { pendientes: 0, en_estudio: 0, dictaminadas: 0, aprobadas: 0, rechazadas_comision: 0, rechazadas_sesion: 0, total: 0 })));
        if (tipo === 2) {
            // Por Diputado
            const presentasIds = [...new Set(relaciones.map((r) => String(r.id_presenta)).filter(Boolean))];
            const dipDB = yield diputado_1.default.findAll({
                where: { id: { [sequelize_1.Op.in]: presentasIds } },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const dipMap = new Map(dipDB.map((d) => {
                var _a, _b, _c;
                return [
                    String(d.id),
                    `${(_a = d.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = d.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = d.nombres) !== null && _c !== void 0 ? _c : ""}`.trim() || "-",
                ];
            }));
            const iniPorDip = new Map();
            for (const r of relaciones) {
                const k = String(r.id_presenta);
                if (!iniPorDip.has(k))
                    iniPorDip.set(k, new Set());
                iniPorDip.get(k).add(String(r.id_iniciativa));
            }
            const resultado = presentasIds
                .map((dipId) => {
                var _a, _b;
                const iniSet = (_a = iniPorDip.get(dipId)) !== null && _a !== void 0 ? _a : new Set();
                const items = reporteFiltrado.filter((i) => iniSet.has(String(i.id)));
                if (!items.length)
                    return null;
                return Object.assign({ diputado_id: dipId, diputado: (_b = dipMap.get(dipId)) !== null && _b !== void 0 ? _b : "-" }, contarFila(items));
            })
                .filter((r) => r && r.diputado !== "-" && r.total > 0)
                .sort((a, b) => a.diputado.localeCompare(b.diputado));
            return yield generarExcelSimple(res, "Reporte Diputados", "reporte_iniciativas_diputados.xlsx", [
                { header: "NO.", key: "no", width: 8 },
                { header: "ID DIPUTADO", key: "diputado_id", width: 18 },
                { header: "DIPUTADO", key: "diputado", width: 35 },
                { header: "PENDIENTES", key: "pendientes", width: 15 },
                { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
                { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
                { header: "APROBADAS", key: "aprobadas", width: 15 },
                { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
                { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
                { header: "TOTAL", key: "total", width: 12 },
            ], resultado);
        }
        // Por Grupo Parlamentario
        const gruposIds = [...new Set(relaciones.map((r) => String(r.id_presenta)).filter(Boolean))];
        const gruposDB = yield partidos_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: gruposIds } },
            attributes: ["id", "nombre"],
            raw: true,
        });
        const gruposMap = new Map(gruposDB.map((g) => [String(g.id), g.nombre || "-"]));
        const iniPorGrupo = new Map();
        for (const r of relaciones) {
            const k = String(r.id_presenta);
            if (!iniPorGrupo.has(k))
                iniPorGrupo.set(k, new Set());
            iniPorGrupo.get(k).add(String(r.id_iniciativa));
        }
        const resultado = gruposIds
            .map((grupoId) => {
            var _a, _b;
            const iniSet = (_a = iniPorGrupo.get(grupoId)) !== null && _a !== void 0 ? _a : new Set();
            const items = reporteFiltrado.filter((i) => iniSet.has(String(i.id)));
            if (!items.length)
                return null;
            return Object.assign({ grupo_parlamentario_id: grupoId, grupo_parlamentario: (_b = gruposMap.get(grupoId)) !== null && _b !== void 0 ? _b : "-" }, contarFila(items));
        })
            .filter((r) => r && r.grupo_parlamentario !== "-" && r.total > 0)
            .sort((a, b) => a.grupo_parlamentario.localeCompare(b.grupo_parlamentario));
        return yield generarExcelSimple(res, "Reporte Grupos", "reporte_iniciativas_grupos_parlamentarios.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "ID GRUPO", key: "grupo_parlamentario_id", width: 18 },
            { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 35 },
            { header: "PENDIENTES", key: "pendientes", width: 15 },
            { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
            { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
            { header: "APROBADAS", key: "aprobadas", width: 15 },
            { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
            { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
            { header: "TOTAL", key: "total", width: 12 },
        ], resultado);
    }
    catch (error) {
        console.error("Error al generar Excel de integrantes:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getReporteIniciativasIntegrantes = getReporteIniciativasIntegrantes;
const getVotosCierre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // 1. Obtener el punto de la iniciativa
        const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
            where: { id },
            attributes: ['id_punto'],
        });
        if (!(iniciativa === null || iniciativa === void 0 ? void 0 : iniciativa.id_punto)) {
            return res.status(404).json({ msg: 'No se encontró el punto de la iniciativa' });
        }
        const idPunto = String(iniciativa.id_punto);
        // 2. Verificar si tiene dispensa
        const puntoOrigen = yield puntos_ordens_1.default.findOne({
            where: { id: idPunto },
            attributes: ['id', 'dispensa'],
        });
        if (!puntoOrigen) {
            return res.status(404).json({ msg: 'Punto origen no encontrado' });
        }
        const tieneDispensa = puntoOrigen.dispensa === 1;
        // 3. Determinar el punto de votación
        let puntoDestino;
        if (tieneDispensa) {
            puntoDestino = idPunto;
        }
        else {
            const destinoEncontrado = yield getPuntoDestino(idPunto);
            if (!destinoEncontrado) {
                return res.status(404).json({ msg: 'No hay cierre registrado para esta iniciativa' });
            }
            puntoDestino = destinoEncontrado;
        }
        // 4. Obtener info del punto y su evento
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: puntoDestino },
            attributes: ['id', 'nopunto', 'punto', 'id_evento'],
        });
        if (!punto) {
            return res.status(404).json({ msg: 'Punto destino no encontrado' });
        }
        const evento = yield agendas_1.default.findOne({
            where: { id: punto.id_evento },
            include: [
                { model: sedes_1.default, as: 'sede', attributes: ['id', 'sede'] },
                { model: tipo_eventos_1.default, as: 'tipoevento', attributes: ['id', 'nombre'] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === 'Sesión';
        const tipoEvento = esSesion ? 'sesion' : 'comision';
        const tipovento = esSesion ? 1 : 2;
        // 5. Verificar que exista votación
        const votosExistentes = yield votos_punto_1.default.findOne({ where: { id_punto: puntoDestino } });
        if (!votosExistentes) {
            return res.status(404).json({ msg: 'No hay votación registrada para este cierre' });
        }
        // 6. Obtener y retornar resultados
        const integrantes = yield obtenerResultadosVotacionOptimizado(null, puntoDestino, tipoEvento);
        return res.status(200).json({
            punto: {
                id: punto.id,
                nopunto: punto.nopunto,
                punto: punto.punto,
            },
            evento,
            integrantes,
            tipovento,
            dispensa: tieneDispensa,
        });
    }
    catch (error) {
        console.error('Error getVotosCierre:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});
exports.getVotosCierre = getVotosCierre;
function obtenerListadoDiputados(evento) {
    return __awaiter(this, void 0, void 0, function* () {
        const listadoDiputados = [];
        const dipasociados = yield tipo_cargo_comisions_1.default.findOne({
            where: { valor: "Diputado Asociado" }
        });
        const diputados = yield asistencia_votos_1.default.findAll({
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
    });
}
function obtenerResultadosVotacionOptimizado(idTemaPuntoVoto, idPunto, tipoEvento) {
    return __awaiter(this, void 0, void 0, function* () {
        const dipasociados = yield tipo_cargo_comisions_1.default.findOne({
            where: { valor: "Diputado Asociado" }
        });
        const whereConditions = {};
        if (idTemaPuntoVoto) {
            whereConditions.id_tema_punto_voto = idTemaPuntoVoto;
        }
        else if (idPunto) {
            whereConditions.id_punto = idPunto;
        }
        else {
            return []; // No hay nada que buscar
        }
        const votosRaw = yield votos_punto_1.default.findAll({
            where: whereConditions,
            raw: true,
        });
        if (votosRaw.length === 0) {
            return [];
        }
        const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
            paranoid: false,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (tipoEvento === 'comision') {
            const comisionIds = votosRaw
                .map(v => v.id_comision_dip)
                .filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = votosRaw
                .map(v => v.id_cargo_dip)
                .filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const resultados = votosRaw.map((voto) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(voto.id_diputado);
            const partido = partidosMap.get(voto.id_partido);
            const comision = comisionesMap.get(voto.id_comision_dip);
            const cargo = cargosMap.get(voto.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            const resultado = {
                id: voto.id,
                sentido: voto.sentido,
                mensaje: voto.mensaje,
                id_diputado: voto.id_diputado,
                id_partido: voto.id_partido,
                id_comision_dip: voto.id_comision_dip,
                id_cargo_dip: voto.id_cargo_dip,
                diputado: nombreCompletoDiputado,
                partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null,
            };
            if (tipoEvento === 'comision') {
                resultado.comision_nombre = (comision === null || comision === void 0 ? void 0 : comision.nombre) || null;
                resultado.comision_importancia = (comision === null || comision === void 0 ? void 0 : comision.importancia) || null;
                resultado.cargo = (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null;
                resultado.nivel_cargo = (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999;
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
        }
        else {
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
            }, {});
            const resultado = Object.values(agrupados).sort((a, b) => {
                const importanciaA = parseInt(a.importancia || '999');
                const importanciaB = parseInt(b.importancia || '999');
                return importanciaA - importanciaB;
            });
            return resultado;
        }
    });
}
const getPuntoDestino = (idPunto) => __awaiter(void 0, void 0, void 0, function* () {
    // Obtener estudios previos (type 1 directo y type 2 por expediente)
    // igual que getifnini construye fuenteEstudios
    const estudiosType1 = yield iniciativas_estudio_1.default.findAll({
        where: { punto_origen_id: idPunto, type: 1 },
        attributes: ['id', 'status', 'punto_origen_id', 'punto_destino_id', 'type'],
    });
    // Buscar expedientes relacionados al punto origen
    const expedientesOrigen = yield expedientes_estudio_puntos_1.default.findAll({
        where: { punto_origen_sesion_id: idPunto },
        attributes: ['expediente_id'],
    });
    const expedienteIdsOrigen = [
        ...new Set(expedientesOrigen.map((e) => e.expediente_id).filter(Boolean))
    ];
    const estudiosType2 = expedienteIdsOrigen.length > 0
        ? yield iniciativas_estudio_1.default.findAll({
            where: {
                punto_origen_id: { [sequelize_1.Op.in]: expedienteIdsOrigen },
                type: 2,
            },
            attributes: ['id', 'status', 'punto_origen_id', 'punto_destino_id', 'type'],
        })
        : [];
    // Armar fuenteEstudios igual que getifnini
    const fuenteEstudios = [
        ...estudiosType1.map((e) => e.toJSON()),
        ...estudiosType2.map((e) => e.toJSON()),
    ].filter((e, index, self) => index === self.findIndex((x) => x.id === e.id));
    // Ahora armar posibles puntos incluyendo los punto_destino_id de estudios previos
    const posiblesPuntosIds = [
        idPunto,
        ...fuenteEstudios.map((e) => e.punto_destino_id).filter(Boolean)
    ];
    const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds.filter(Boolean))];
    // Buscar expedientes relacionados a TODOS esos puntos
    const expedientesRelacionados = yield expedientes_estudio_puntos_1.default.findAll({
        where: {
            punto_origen_sesion_id: { [sequelize_1.Op.in]: posiblesPuntosUnicos }
        },
        attributes: ['expediente_id'],
    });
    const expedienteIds = [
        ...new Set(expedientesRelacionados.map((e) => e.expediente_id).filter(Boolean))
    ];
    // Construir OR dinámico
    const orConditions = [];
    if (posiblesPuntosUnicos.length > 0) {
        orConditions.push({
            punto_origen_id: { [sequelize_1.Op.in]: posiblesPuntosUnicos },
            type: 1,
        });
    }
    if (expedienteIds.length > 0) {
        orConditions.push({
            punto_origen_id: { [sequelize_1.Op.in]: expedienteIds },
            type: 2,
        });
    }
    if (orConditions.length === 0)
        return null;
    // Buscar el cierre (status 3)
    const estudio = yield iniciativas_estudio_1.default.findOne({
        where: {
            status: '3',
            [sequelize_1.Op.or]: orConditions,
        },
        order: [['createdAt', 'DESC']],
    });
    return (estudio === null || estudio === void 0 ? void 0 : estudio.punto_destino_id) ? String(estudio.punto_destino_id) : null;
});
const geteventos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uuidSesion = 'd5687f72-a328-4be1-a23c-4c3575092163';
        const uuidpermanente = 'a413e44b-550b-47ab-b004-a6f28c73a750';
        const eventos = yield agendas_1.default.findAll({
            include: [
                {
                    model: sedes_1.default,
                    as: "sede",
                    attributes: ["id", "sede"]
                },
                {
                    model: tipo_eventos_1.default,
                    as: "tipoevento",
                    attributes: ["id", "nombre"],
                    where: {
                        id: {
                            [sequelize_1.Op.in]: [uuidSesion, uuidpermanente]
                        }
                    }
                }
            ],
            order: [['fecha', 'DESC']]
        });
        const eventosConComisiones = [];
        for (const evento of eventos) {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
            let comisiones = [];
            let titulo = '';
            if (comisionIds.length > 0) {
                comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre"],
                    raw: true
                });
                titulo = comisiones.map(c => c.nombre).join(", ");
            }
            eventosConComisiones.push(Object.assign(Object.assign({}, evento.toJSON()), { comisiones,
                titulo }));
        }
        return res.status(200).json({
            msg: "listoooo :v ",
            eventos: eventosConComisiones
        });
    }
    catch (error) {
        console.error("Error obteniendo eventos:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener los eventos",
            error: error.message
        });
    }
});
exports.geteventos = geteventos;
const getasistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const asistenciasExistentes = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            order: [['created_at', 'DESC']],
            raw: true,
        });
        let integrantes = [];
        if (asistenciasExistentes.length > 0) {
            integrantes = yield procesarAsistencias(asistenciasExistentes, esSesion);
        }
        return res.status(200).json({
            msg: asistenciasExistentes.length
                ? "Evento con asistencias existentes"
                : "Evento sin asistencias",
            evento,
            integrantes,
        });
    }
    catch (error) {
        console.error("Error obteniendo eventos:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener los eventos",
            error: error.message
        });
    }
});
exports.getasistencia = getasistencia;
function procesarAsistencias(asistencias, esSesion) {
    return __awaiter(this, void 0, void 0, function* () {
        if (esSesion) {
            // Para sesiones: lista plana sin duplicados
            return yield procesarAsistenciasSesion(asistencias);
        }
        else {
            // Para comisiones: agrupadas y ordenadas por cargo
            return yield procesarAsistenciasComisiones(asistencias);
        }
    });
}
/**
 * Procesa asistencias para SESIONES (lista plana ordenada alfabéticamente)
 */
function procesarAsistenciasSesion(asistencias) {
    return __awaiter(this, void 0, void 0, function* () {
        // Eliminar duplicados por id_diputado (mantener el más reciente)
        const asistenciasSinDuplicados = Object.values(asistencias.reduce((acc, curr) => {
            if (!acc[curr.id_diputado])
                acc[curr.id_diputado] = curr;
            return acc;
        }, {}));
        const diputadoIds = [...new Set(asistenciasSinDuplicados.map(a => a.id_diputado).filter(Boolean))];
        const partidoIds = [...new Set(asistenciasSinDuplicados.map(a => a.partido_dip).filter(Boolean))];
        const [diputados, partidos] = yield Promise.all([
            diputado_1.default.findAll({
                where: { id: diputadoIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
                paranoid: false
            }),
            partidos_1.default.findAll({
                where: { id: partidoIds },
                attributes: ["id", "siglas"],
                raw: true,
                paranoid: false
            })
        ]);
        const diputadosMap = new Map(diputados.map((d) => [d.id, d]));
        const partidosMap = new Map(partidos.map((p) => [p.id, p]));
        const resultados = asistenciasSinDuplicados.map(inte => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(inte.id_diputado);
            const partido = partidosMap.get(inte.partido_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return Object.assign(Object.assign({}, inte), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null });
        });
        // Ordenar alfabéticamente por nombre de diputado
        resultados.sort((a, b) => {
            const nombreA = a.diputado || '';
            const nombreB = b.diputado || '';
            return nombreA.localeCompare(nombreB, 'es');
        });
        return resultados;
    });
}
/**
 * Procesa asistencias para COMISIONES (agrupadas por comisión y ordenadas por cargo)
 */
function procesarAsistenciasComisiones(asistencias) {
    return __awaiter(this, void 0, void 0, function* () {
        const diputadoIds = [...new Set(asistencias.map(a => a.id_diputado).filter(Boolean))];
        const partidoIds = [...new Set(asistencias.map(a => a.partido_dip).filter(Boolean))];
        const comisionIds = [...new Set(asistencias.map(a => a.comision_dip_id).filter(Boolean))];
        const cargoIds = [...new Set(asistencias.map(a => a.id_cargo_dip).filter(Boolean))]; // 👈 NUEVO
        const [diputados, partidos, comisiones, cargos] = yield Promise.all([
            diputado_1.default.findAll({
                where: { id: diputadoIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
                paranoid: false
            }),
            partidos_1.default.findAll({
                where: { id: partidoIds },
                attributes: ["id", "siglas"],
                raw: true
            }),
            comisionIds.length > 0 ? comisions_1.default.findAll({
                where: { id: comisionIds },
                attributes: ["id", "nombre", "importancia"],
                raw: true
            }) : [],
            cargoIds.length > 0 ? tipo_cargo_comisions_1.default.findAll({
                where: { id: cargoIds },
                attributes: ["id", "valor", "nivel"],
                raw: true
            }) : []
        ]);
        // Crear mapas
        const diputadosMap = new Map(diputados.map((d) => [d.id, d]));
        const partidosMap = new Map(partidos.map((p) => [p.id, p]));
        const comisionesMap = new Map(comisiones.map((c) => [c.id, c]));
        const cargosMap = new Map(cargos.map((c) => [c.id, c])); // 👈 NUEVO
        // Mapear asistencias con información completa
        const resultados = asistencias.map(inte => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(inte.id_diputado);
            const partido = partidosMap.get(inte.partido_dip);
            const comision = inte.comision_dip_id ? comisionesMap.get(inte.comision_dip_id) : null;
            const cargo = inte.id_cargo_dip ? cargosMap.get(inte.id_cargo_dip) : null; // 👈 NUEVO
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return Object.assign(Object.assign({}, inte), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null, comision_id: inte.comision_dip_id, comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || 'Sin comisión', comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999 });
        });
        // Agrupar por comisión
        const integrantesAgrupados = resultados.reduce((grupos, integrante) => {
            const comisionNombre = integrante.comision_nombre;
            if (!grupos[comisionNombre]) {
                grupos[comisionNombre] = {
                    comision_id: integrante.comision_id,
                    comision_nombre: comisionNombre,
                    importancia: integrante.comision_importancia,
                    integrantes: []
                };
            }
            grupos[comisionNombre].integrantes.push(integrante);
            return grupos;
        }, {});
        // Convertir a array y ordenar por importancia de comisión
        const comisionesArray = Object.values(integrantesAgrupados).sort((a, b) => {
            return a.importancia - b.importancia;
        });
        // Ordenar integrantes dentro de cada comisión por nivel de cargo
        comisionesArray.forEach((comision) => {
            comision.integrantes.sort((a, b) => a.nivel_cargo - b.nivel_cargo);
        });
        return comisionesArray;
    });
}
