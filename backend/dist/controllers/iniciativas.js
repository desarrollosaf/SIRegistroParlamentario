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
exports.publicarAgenda = exports.actualizarIniciativa = exports.eliminardecreto = exports.getdecretos = exports.guardardecreto = exports.getiniciativas = void 0;
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
const uuid_1 = require("uuid");
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
        attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida", "tipo"],
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
            const nuevoNombre = `${prefijo}_${(0, uuid_1.v4)()}${ext}`;
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
