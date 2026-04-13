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
exports.getVotosDictamen = exports.eliminarAsistenciaYVotacion = exports.getVotosCierre = exports.eliminarVotacion = exports.eliminarAsistencia = exports.publicarAgenda = exports.actualizarIniciativa = exports.eliminardecreto = exports.getdecretos = exports.guardardecreto = exports.getiniciativas = void 0;
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const diputado_1 = __importDefault(require("../models/diputado"));
const comisions_1 = __importDefault(require("../models/comisions"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const partidos_1 = __importDefault(require("../models/partidos"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const secretarias_1 = __importDefault(require("../models/secretarias"));
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const agendas_1 = __importDefault(require("../models/agendas"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const iniciativas_estudio_1 = __importDefault(require("../models/iniciativas_estudio"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const expedientes_estudio_puntos_1 = __importDefault(require("../models/expedientes_estudio_puntos"));
const puntos_comisiones_1 = __importDefault(require("../models/puntos_comisiones"));
const sequelize_1 = require("sequelize");
const decreto_1 = __importDefault(require("../models/decreto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const temas_puntos_votos_1 = __importDefault(require("../models/temas_puntos_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const tipo_cargo_comisions_1 = __importDefault(require("../models/tipo_cargo_comisions"));
const sedes_1 = __importDefault(require("../models/sedes"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const getiniciativas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iniciativasRaw = yield construirReporteBase();
        if (!iniciativasRaw) {
            return res.status(404).json({ message: "No tiene iniciativas" });
        }
        return res.status(200).json({
            data: iniciativasRaw,
        });
    }
    catch (error) {
        console.error("Error al obtener las iniciativas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getiniciativas = getiniciativas;
const procesarPresentan = (presentan) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const proponentesUnicos = new Map();
    const presentanData = [];
    for (const p of presentan) {
        const tipoValor = (_b = (_a = p.tipo_presenta) === null || _a === void 0 ? void 0 : _a.valor) !== null && _b !== void 0 ? _b : '';
        let valor = '';
        if (tipoValor === 'Diputadas y Diputados') {
            const dip = yield diputado_1.default.findOne({ where: { id: p.id_presenta } });
            valor = `${(_c = dip === null || dip === void 0 ? void 0 : dip.apaterno) !== null && _c !== void 0 ? _c : ''} ${(_d = dip === null || dip === void 0 ? void 0 : dip.amaterno) !== null && _d !== void 0 ? _d : ''} ${(_e = dip === null || dip === void 0 ? void 0 : dip.nombres) !== null && _e !== void 0 ? _e : ''}`.trim();
        }
        else if (['Mesa Directiva en turno', 'Junta de Coordinación Politica', 'Comisiones Legislativas', 'Diputación Permanente'].includes(tipoValor)) {
            const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_f = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _f !== void 0 ? _f : '';
        }
        else if (['Ayuntamientos', 'Municipios'].includes(tipoValor)) {
            const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_g = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _g !== void 0 ? _g : '';
        }
        else if (tipoValor === 'Grupo Parlamentario') {
            const partido = yield partidos_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_h = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _h !== void 0 ? _h : '';
        }
        else if (tipoValor === 'Legislatura') {
            const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_j = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _j !== void 0 ? _j : '';
        }
        else if (tipoValor === 'Secretarías del GEM') {
            const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta } });
            valor = `${(_k = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _k !== void 0 ? _k : ''} / ${(_l = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _l !== void 0 ? _l : ''}`;
        }
        else {
            const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_m = cat === null || cat === void 0 ? void 0 : cat.nombre_titular) !== null && _m !== void 0 ? _m : '';
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
});
const obtenerIniciativasBase = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield inciativas_puntos_ordens_1.default.findAll({
        attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida", "tipo", "publico"],
        include: [
            {
                model: puntos_ordens_1.default,
                as: "punto",
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
                include: [
                    {
                        model: iniciativas_estudio_1.default,
                        as: "estudio",
                        attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
                        required: false,
                        where: { type: 1 },
                        include: [
                            {
                                model: puntos_ordens_1.default,
                                as: "iniciativa",
                                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
                                include: [
                                    {
                                        model: agendas_1.default,
                                        as: "evento",
                                        attributes: ["id", "fecha", "descripcion", "liga"],
                                        include: [
                                            {
                                                model: tipo_eventos_1.default,
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
                model: expedientes_estudio_puntos_1.default,
                as: "expedienteturno",
                attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
                include: [
                    {
                        model: iniciativas_estudio_1.default,
                        as: "estudio",
                        attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
                        required: false,
                        include: [
                            {
                                model: puntos_ordens_1.default,
                                as: "iniciativa",
                                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
                                include: [
                                    {
                                        model: agendas_1.default,
                                        as: "evento",
                                        attributes: ["id", "fecha", "descripcion", "liga"],
                                        include: [
                                            {
                                                model: tipo_eventos_1.default,
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
                model: agendas_1.default,
                as: "evento",
                attributes: ["id", "fecha", "descripcion", "liga"],
                include: [
                    {
                        model: tipo_eventos_1.default,
                        as: "tipoevento",
                        attributes: ["nombre"]
                    }
                ]
            }
        ],
        order: [["createdAt", "ASC"]]
    });
});
const construirReporteBase = () => __awaiter(void 0, void 0, void 0, function* () {
    const iniciativas = yield obtenerIniciativasBase();
    const reporte = yield Promise.all(iniciativas.map((iniciativa, index) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const data = iniciativa.toJSON();
        //   const {
        //     proponentesString,
        //     presentaString,
        //     diputados,
        //     diputadoIds,
        //     gruposParlamentarios,
        //     grupoParlamentarioIds
        //   } = await procesarPresentan(data.id);
        const todosEstudios = [
            ...(Array.isArray((_a = data.punto) === null || _a === void 0 ? void 0 : _a.estudio) ? data.punto.estudio : []),
            ...(Array.isArray(data.expedienteturno)
                ? data.expedienteturno.flatMap((exp) => Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : [])
                : [])
        ];
        const fuenteEstudios = deduplicarPorId(todosEstudios);
        const estudios = fuenteEstudios.filter((e) => e.status === "1");
        const dictamenes = fuenteEstudios.filter((e) => e.status === "2");
        const rechazadocomi = fuenteEstudios.filter((e) => e.status === "4");
        const rechazosesion = fuenteEstudios.filter((e) => e.status === "5");
        const dispensa = String((_b = data.punto) === null || _b === void 0 ? void 0 : _b.dispensa) === "1";
        const precluida = String(data.precluida) === "1";
        const posiblesPuntosIds = [
            (_c = data.punto) === null || _c === void 0 ? void 0 : _c.id,
            ...fuenteEstudios.map((e) => e.punto_destino_id).filter(Boolean)
        ];
        const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds)];
        const expedientesRelacionados = yield expedientes_estudio_puntos_1.default.findAll({
            where: {
                punto_origen_sesion_id: {
                    [sequelize_1.Op.in]: posiblesPuntosUnicos
                }
            },
            attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
            raw: true
        });
        const expedienteIds = [
            ...new Set(expedientesRelacionados
                .map((e) => e.expediente_id)
                .filter(Boolean))
        ];
        const whereCierres = {
            status: "3"
        };
        if (posiblesPuntosUnicos.length > 0 || expedienteIds.length > 0) {
            whereCierres[sequelize_1.Op.or] = [];
            if (posiblesPuntosUnicos.length > 0) {
                whereCierres[sequelize_1.Op.or].push({
                    punto_origen_id: {
                        [sequelize_1.Op.in]: posiblesPuntosUnicos
                    }
                });
            }
            if (expedienteIds.length > 0) {
                whereCierres[sequelize_1.Op.or].push({
                    punto_origen_id: {
                        [sequelize_1.Op.in]: expedienteIds
                    }
                });
            }
        }
        const cierresDB = ((_d = whereCierres[sequelize_1.Op.or]) === null || _d === void 0 ? void 0 : _d.length) > 0
            ? yield iniciativas_estudio_1.default.findAll({
                where: whereCierres,
                include: [
                    {
                        model: puntos_ordens_1.default,
                        as: "iniciativa",
                        attributes: ["id", "punto", "nopunto", "tribuna"],
                        include: [
                            {
                                model: agendas_1.default,
                                as: "evento",
                                attributes: ["id", "fecha", "descripcion", "liga"],
                                include: [
                                    {
                                        model: tipo_eventos_1.default,
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
            ...fuenteEstudios.filter((e) => e.status === "3"),
            ...cierresDB.map((c) => c.toJSON())
        ];
        const cierres = deduplicarPorId(cierresMerge);
        const cierrePrincipal = cierres.length > 0 ? cierres[0] : null;
        let observacion = "En estudio";
        if (precluida) {
            observacion = "Precluida";
        }
        else if (dispensa) {
            observacion = "Aprobada";
        }
        else {
            if (cierrePrincipal) {
                observacion = "Aprobada";
            }
            else if (rechazosesion.length > 0) {
                observacion = "Rechazada en sesión";
            }
            else if (rechazadocomi.length > 0) {
                observacion = "Rechazada en comisión";
            }
            else if (dictamenes.length > 0) {
                observacion = "En estudio";
            }
            else if (estudios.length > 0) {
                observacion = "En estudio";
            }
        }
        const turnadoInfo = yield getComisionesTurnado((_e = data.punto) === null || _e === void 0 ? void 0 : _e.id);
        const fechaExpedicion = ((_g = (_f = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _f === void 0 ? void 0 : _f.evento) === null || _g === void 0 ? void 0 : _g.fecha)
            ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
            : "-";
        //   const diputado = diputados.length > 0 ? diputados.join(", ") : "-";
        //   const grupoParlamentario = gruposParlamentarios.length > 0 ? gruposParlamentarios.join(", ") : "-";
        const fechaEventoRaw = (_j = (_h = data.evento) === null || _h === void 0 ? void 0 : _h.fecha) !== null && _j !== void 0 ? _j : null;
        return {
            no: index + 1,
            id: normalizarTexto(data.id),
            // autor: normalizarTexto(proponentesString),
            // autor_detalle: normalizarTexto(presentaString),
            iniciativa: normalizarTexto(data.iniciativa),
            materia: normalizarTexto((_k = data.punto) === null || _k === void 0 ? void 0 : _k.punto),
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
    })));
    return reporte;
});
const formatearFechaCorta = (fecha) => {
    if (!fecha)
        return "-";
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const date = new Date(fecha);
    const dia = String(date.getUTCDate()).padStart(2, "0");
    const mes = meses[date.getUTCMonth()];
    const anio = String(date.getUTCFullYear()).slice(-2);
    return `${dia}-${mes}-${anio}`;
};
const obtenerPeriodo = (fecha) => {
    if (!fecha)
        return "-";
    const d = new Date(fecha);
    const anio = d.getUTCFullYear();
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${anio}-${mes}`;
};
const normalizarTexto = (valor) => {
    if (!valor)
        return "-";
    return String(valor).trim() || "-";
};
const getComisionesTurnado = (puntoId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!puntoId) {
        return { turnado: false, comisiones_turnado: null };
    }
    const puntosComisiones = yield puntos_comisiones_1.default.findAll({
        where: { id_punto: puntoId },
        attributes: ["id_comision"],
        raw: true
    });
    if (puntosComisiones.length === 0) {
        return { turnado: false, comisiones_turnado: null };
    }
    const todosIds = puntosComisiones
        .map((item) => item.id_comision || "")
        .join(",");
    const comisionIds = todosIds
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    const comisionIdsUnicos = [...new Set(comisionIds)];
    if (comisionIdsUnicos.length === 0) {
        return { turnado: false, comisiones_turnado: null };
    }
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIdsUnicos },
        attributes: ["nombre"],
        raw: true
    });
    return {
        turnado: true,
        comisiones_turnado: comisiones.map((c) => c.nombre).join(", ")
    };
});
const deduplicarPorId = (items) => {
    return items.filter((e, index, self) => index === self.findIndex((x) => x.id === e.id));
};
/////////////////////////////////////////////////////////////////// funciones para los decretos 
const guardardecreto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { body } = req;
        const file = req.file;
        // 👇 Consultas el tipo de la iniciativa
        const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
            where: { id: body.id_iniciativa },
            attributes: ["tipo"]
        });
        const tipoNombre = {
            "1": "decreto",
            "2": "acuerdo",
            "3": "acuerdo"
        };
        const prefijo = (_b = tipoNombre[(_a = iniciativa === null || iniciativa === void 0 ? void 0 : iniciativa.tipo) !== null && _a !== void 0 ? _a : "1"]) !== null && _b !== void 0 ? _b : "decreto";
        // 👇 Renombras el archivo ya guardado
        let pathDoc = null;
        if (file) {
            const ext = path_1.default.extname(file.originalname);
            const nuevoNombre = `${prefijo}_${crypto.randomUUID()}${ext}`;
            const dirBase = path_1.default.join(process.cwd(), "storage/decretos");
            fs_1.default.renameSync(path_1.default.join(dirBase, file.filename), path_1.default.join(dirBase, nuevoNombre));
            pathDoc = `storage/decretos/${nuevoNombre}`;
        }
        yield decreto_1.default.create({
            nombre_decreto: body.nombre_decreto,
            decreto: pathDoc,
            id_iniciativa: body.id_iniciativa
        });
        return res.status(201).json({
            message: "Decreto creado correctamente",
        });
    }
    catch (error) {
        console.error("Error al guardar el decreto:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.guardardecreto = guardardecreto;
const getdecretos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const decretetos = yield decreto_1.default.findAll({
            where: { id_iniciativa: id },
            attributes: ["id", "nombre_decreto", "decreto", "id_iniciativa"],
        });
        if (!decretetos) {
            return res.status(404).json({ message: "No tiene decretos" });
        }
        return res.status(200).json({
            data: decretetos,
        });
    }
    catch (error) {
        console.error("Error al obtener los decretos:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getdecretos = getdecretos;
const eliminardecreto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const decreto = yield decreto_1.default.findOne({
            where: { id }
        });
        if (!decreto) {
            return res.status(404).json({ message: "decreto no encontrado" });
        }
        yield decreto.destroy();
        return res.status(200).json({
            message: "Decreto eliminado correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar el decreto:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.eliminardecreto = eliminardecreto;
const actualizarIniciativa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { publico } = req.body;
        yield inciativas_puntos_ordens_1.default.update({ publico }, { where: { id } });
        return res.status(200).json({ message: 'Actualizado correctamente' });
    }
    catch (error) {
        console.error('Error al actualizar iniciativa:', error);
        return res.status(500).json({ message: 'Error interno', error: error.message });
    }
});
exports.actualizarIniciativa = actualizarIniciativa;
const publicarAgenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { publico } = req.body;
        yield agendas_1.default.update({ publico }, { where: { id } });
        return res.status(200).json({ message: 'Actualizado correctamente' });
    }
    catch (error) {
        console.error('Error al actualizar iniciativa:', error);
        return res.status(500).json({ message: 'Error interno', error: error.message });
    }
});
exports.publicarAgenda = publicarAgenda;
const eliminarAsistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const total = yield asistencia_votos_1.default.count({
            where: { id_agenda: id, deletedAt: null },
        });
        if (total === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No hay registros de asistencia para este evento',
            });
        }
        yield asistencia_votos_1.default.destroy({
            where: { id_agenda: id },
        });
        return res.status(200).json({
            ok: true,
            msg: `Se eliminaron ${total} registros de asistencia`,
            eliminados: total,
        });
    }
    catch (error) {
        console.error('Error eliminarAsistencia:', error);
        return res.status(500).json({ ok: false, msg: 'Error al eliminar la asistencia' });
    }
});
exports.eliminarAsistencia = eliminarAsistencia;
const eliminarVotacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        let totalVotos = 0;
        // ── 1. Votos de temas directos del evento (sin punto) 
        const temasEvento = yield temas_puntos_votos_1.default.findAll({
            where: { id_evento: id, deletedAt: null },
        });
        for (const tema of temasEvento) {
            const eliminados = yield votos_punto_1.default.destroy({
                where: { id_tema_punto_voto: tema.id },
            });
            totalVotos += eliminados;
        }
        // ── 2. Puntos del evento 
        const puntos = yield puntos_ordens_1.default.findAll({
            where: { id_evento: id, deletedAt: null },
        });
        for (const punto of puntos) {
            // 2a. Votos directos del punto (sin tema)
            const votosPuntoDirecto = yield votos_punto_1.default.destroy({
                where: { id_punto: punto.id },
            });
            totalVotos += votosPuntoDirecto;
            // 2b. Temas del punto → sus votos
            const temasPunto = yield temas_puntos_votos_1.default.findAll({
                where: { id_punto: punto.id, deletedAt: null },
            });
            for (const tema of temasPunto) {
                const votosTema = yield votos_punto_1.default.destroy({
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
    }
    catch (error) {
        console.error('Error eliminarVotacion:', error);
        return res.status(500).json({ ok: false, msg: 'Error al eliminar la votación' });
    }
});
exports.eliminarVotacion = eliminarVotacion;
const getVotacionPorPunto = (idPunto, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const punto = yield puntos_ordens_1.default.findOne({
        where: { id: idPunto },
        attributes: ['id', 'nopunto', 'punto', 'id_evento'],
    });
    if (!punto) {
        return res.status(404).json({ msg: 'Punto no encontrado' });
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
    let mensajeRespuesta = 'Punto con votos existentes';
    const votosExistentes = yield votos_punto_1.default.findOne({ where: { id_punto: idPunto } });
    if (!votosExistentes) {
        const listadoDiputados = yield obtenerListadoDiputados(evento);
        const votospunto = listadoDiputados.map((dip) => ({
            sentido: 0,
            mensaje: 'PENDIENTE',
            id_punto: idPunto,
            id_tema_punto_voto: null,
            id_diputado: dip.id_diputado,
            id_partido: dip.id_partido,
            id_comision_dip: dip.comision_dip_id,
            id_cargo_dip: dip.id_cargo_dip,
        }));
        yield votos_punto_1.default.bulkCreate(votospunto);
        mensajeRespuesta = 'Votacion creada correctamente';
    }
    const integrantes = yield obtenerResultadosVotacionOptimizado(null, idPunto, tipoEvento);
    return res.status(200).json({
        msg: mensajeRespuesta,
        // ── Información del punto destino (donde se votó) ──
        punto: {
            id: punto.id,
            nopunto: punto.nopunto,
            punto: punto.punto,
        },
        evento,
        integrantes,
        tipovento,
    });
});
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
const getIdPuntoDeIniciativa = (idIniciativa) => __awaiter(void 0, void 0, void 0, function* () {
    const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
        where: { id: idIniciativa },
        attributes: ['id_punto'],
    });
    return (iniciativa === null || iniciativa === void 0 ? void 0 : iniciativa.id_punto) ? String(iniciativa.id_punto) : null;
});
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
        // 2. Determinar el punto a usar para la votación
        const puntoOrigen = yield puntos_ordens_1.default.findOne({
            where: { id: idPunto },
            attributes: ['id', 'dispensa'],
        });
        if (!puntoOrigen) {
            return res.status(404).json({ msg: 'Punto origen no encontrado' });
        }
        const tieneDispensa = puntoOrigen.dispensa === 1;
        let puntoDestino;
        if (tieneDispensa) {
            // Si tiene dispensa, se votó en el mismo punto
            puntoDestino = idPunto;
        }
        else {
            // Si no tiene dispensa, buscar el punto destino (cierre)
            const destinoEncontrado = yield getPuntoDestino(idPunto);
            // console.log("holaaaaaaaaaaaa", destinoEncontrado)
            // return 500;
            if (!destinoEncontrado) {
                return res.status(404).json({ msg: 'No hay cierre registrado para esta iniciativa' });
            }
            puntoDestino = destinoEncontrado;
        }
        // 3. Obtener info del punto destino y su evento
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
        // 4. Verificar si existe asistencia; si no, crearla
        const asistenciasExistentes = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: evento.id },
            order: [['created_at', 'DESC']],
            raw: true,
        });
        if (asistenciasExistentes.length === 0) {
            yield crearAsistencias(evento, esSesion);
        }
        // 5. Verificar si existe votación del punto; si no, crearla
        let mensajeRespuesta = 'Punto con votos existentes';
        const votosExistentes = yield votos_punto_1.default.findOne({ where: { id_punto: puntoDestino } });
        if (!votosExistentes) {
            const listadoDiputados = yield obtenerListadoDiputados(evento);
            const votospunto = listadoDiputados.map((dip) => ({
                sentido: 0,
                mensaje: 'PENDIENTE',
                id_punto: puntoDestino,
                id_tema_punto_voto: null,
                id_diputado: dip.id_diputado,
                id_partido: dip.id_partido,
                id_comision_dip: dip.comision_dip_id,
                id_cargo_dip: dip.id_cargo_dip,
            }));
            yield votos_punto_1.default.bulkCreate(votospunto);
            mensajeRespuesta = 'Votacion creada correctamente';
        }
        // 6. Obtener y retornar resultados
        const integrantes = yield obtenerResultadosVotacionOptimizado(null, puntoDestino, tipoEvento);
        return res.status(200).json({
            msg: mensajeRespuesta,
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
function crearAsistencias(evento, esSesion) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const listadoDiputados = [];
        if (esSesion) {
            const { Op } = require('sequelize');
            const fechaEvento = new Date(evento.fecha).toISOString().split('T')[0];
            if (!fechaEvento) {
                throw new Error('El evento no tiene fecha válida');
            }
            // Para sesiones: todos los diputados de la legislatura actual
            const legislatura = yield legislaturas_1.default.findOne({
                order: [["fecha_inicio", "DESC"]],
            });
            if (legislatura) {
                const diputados = yield integrante_legislaturas_1.default.findAll({
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
                            model: diputado_1.default,
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
        }
        else {
            // Para comisiones: solo integrantes de las comisiones anfitrionas
            const comisiones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
            });
            if (comisiones.length > 0) {
                const comisionIds = comisiones.map((c) => c.autor_id);
                const integrantes = yield integrante_comisions_1.default.findAll({
                    where: { comision_id: comisionIds },
                    include: [
                        {
                            model: integrante_legislaturas_1.default,
                            as: "integranteLegislatura",
                            include: [{ model: diputado_1.default, as: "diputado" }],
                        },
                    ],
                });
                for (const inte of integrantes) {
                    if ((_a = inte.integranteLegislatura) === null || _a === void 0 ? void 0 : _a.diputado) {
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
        yield asistencia_votos_1.default.bulkCreate(asistencias);
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
            paranoid: false
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
const eliminarAsistenciaYVotacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // ── Asistencia ──
        const totalAsistencia = yield asistencia_votos_1.default.count({
            where: { id_agenda: id, deletedAt: null },
        });
        if (totalAsistencia === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No hay registros de asistencia para este evento',
            });
        }
        yield asistencia_votos_1.default.destroy({
            where: { id_agenda: id },
        });
        // ── Votación ──
        let totalVotos = 0;
        // 1. Votos de temas directos del evento (sin punto)
        const temasEvento = yield temas_puntos_votos_1.default.findAll({
            where: { id_evento: id, deletedAt: null },
        });
        for (const tema of temasEvento) {
            totalVotos += yield votos_punto_1.default.destroy({
                where: { id_tema_punto_voto: tema.id },
            });
        }
        // 2. Puntos del evento
        const puntos = yield puntos_ordens_1.default.findAll({
            where: { id_evento: id, deletedAt: null },
        });
        for (const punto of puntos) {
            // 2a. Votos directos del punto (sin tema)
            totalVotos += yield votos_punto_1.default.destroy({
                where: { id_punto: punto.id },
            });
            // 2b. Temas del punto → sus votos
            const temasPunto = yield temas_puntos_votos_1.default.findAll({
                where: { id_punto: punto.id, deletedAt: null },
            });
            for (const tema of temasPunto) {
                totalVotos += yield votos_punto_1.default.destroy({
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
    }
    catch (error) {
        console.error('Error eliminarAsistenciaYVotacion:', error);
        return res.status(500).json({ ok: false, msg: 'Error al eliminar asistencia y votación' });
    }
});
exports.eliminarAsistenciaYVotacion = eliminarAsistenciaYVotacion;
const getVotosDictamen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idPunto = yield getIdPuntoDeIniciativa(id);
        if (!idPunto) {
            return res.status(404).json({ msg: 'No se encontró el punto de la iniciativa' });
        }
        const puntoDestino = yield getPuntoDestino(idPunto, '2');
        if (!puntoDestino) {
            return res.status(404).json({ msg: 'No hay dictamen registrado para esta iniciativa' });
        }
        return yield getVotacionPorPunto(puntoDestino, res);
    }
    catch (error) {
        console.error('Error getVotosDictamen:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});
exports.getVotosDictamen = getVotosDictamen;
