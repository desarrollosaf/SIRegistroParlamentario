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
exports.getTotalesPorPeriodo = exports.getIniciativasPorGrupoYDiputado = exports.getIniciativasAprobadas = exports.getIniciativasEnEstudio = exports.getifnini = void 0;
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
const deduplicarPorId = (items) => {
    return items.filter((e, index, self) => index === self.findIndex((x) => x.id === e.id));
};
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
const getAnfitriones = (eventoId, tipoEventoNombre) => __awaiter(void 0, void 0, void 0, function* () {
    if (!eventoId || tipoEventoNombre === "Sesión") {
        return { comisiones: null };
    }
    const anfitriones = yield anfitrion_agendas_1.default.findAll({
        where: { agenda_id: eventoId },
        attributes: ["autor_id"],
        raw: true
    });
    const comisionIds = anfitriones.map((a) => a.autor_id).filter(Boolean);
    if (comisionIds.length === 0) {
        return { comisiones: null };
    }
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIds },
        attributes: ["nombre"],
        raw: true
    });
    return {
        comisiones: comisiones.map((c) => c.nombre).join(", ")
    };
});
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
const getPresentantesDePunto = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    let proponentesString = "";
    let presentaString = "";
    const diputados = [];
    const gruposParlamentarios = [];
    if (!id) {
        return { proponentesString, presentaString, diputados, gruposParlamentarios };
    }
    const presentan = yield iniciativaspresenta_1.default.findAll({
        where: { id_iniciativa: id },
        include: [
            {
                model: proponentes_1.default,
                as: "tipo_presenta",
                attributes: ["id", "valor"]
            }
        ]
    });
    const proponentesUnicos = new Map();
    const presentanData = [];
    for (const p of presentan) {
        const tipoValor = (_b = (_a = p.tipo_presenta) === null || _a === void 0 ? void 0 : _a.valor) !== null && _b !== void 0 ? _b : "";
        let valor = "";
        if (tipoValor === "Diputadas y Diputados") {
            const dip = yield diputado_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            if (dip) {
                valor = `${(_c = dip.apaterno) !== null && _c !== void 0 ? _c : ""} ${(_d = dip.amaterno) !== null && _d !== void 0 ? _d : ""} ${(_e = dip.nombres) !== null && _e !== void 0 ? _e : ""}`.trim();
                if (valor)
                    diputados.push(valor);
                if (dip.partido_id) {
                    const partido = yield partidos_1.default.findOne({
                        where: { id: dip.partido_id },
                        attributes: ["nombre"],
                        raw: true
                    });
                    if (partido === null || partido === void 0 ? void 0 : partido.nombre) {
                        gruposParlamentarios.push(partido.nombre);
                    }
                }
            }
        }
        else if (["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)) {
            const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_f = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _f !== void 0 ? _f : "";
        }
        else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
            const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_g = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _g !== void 0 ? _g : "";
        }
        else if (tipoValor === "Grupo Parlamentario") {
            const partido = yield partidos_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_h = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _h !== void 0 ? _h : "";
            if (valor)
                gruposParlamentarios.push(valor);
        }
        else if (tipoValor === "Legislatura") {
            const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_j = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _j !== void 0 ? _j : "";
        }
        else if (tipoValor === "Secretarías del GEM") {
            const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = `${(_k = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _k !== void 0 ? _k : ""} / ${(_l = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _l !== void 0 ? _l : ""}`.trim();
        }
        else {
            const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_m = cat === null || cat === void 0 ? void 0 : cat.nombre_titular) !== null && _m !== void 0 ? _m : "";
        }
        if (tipoValor && !proponentesUnicos.has(tipoValor)) {
            proponentesUnicos.set(tipoValor, tipoValor);
        }
        if (valor) {
            presentanData.push({
                proponente: tipoValor,
                valor,
                id_presenta: p.id_presenta
            });
        }
    }
    proponentesString = Array.from(proponentesUnicos.keys()).join(", ");
    presentaString = presentanData.map((p) => p.valor).join(", ");
    return {
        proponentesString,
        presentaString,
        diputados: [...new Set(diputados)],
        gruposParlamentarios: [...new Set(gruposParlamentarios)]
    };
});
const obtenerIniciativasBase = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield inciativas_puntos_ordens_1.default.findAll({
        attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente"],
        include: [
            {
                model: puntos_ordens_1.default,
                as: "punto",
                attributes: ["id", "punto", "nopunto", "tribuna"],
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const data = iniciativa.toJSON();
        const { proponentesString, presentaString, diputados, gruposParlamentarios } = yield getPresentantesDePunto(data.id);
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
        const posiblesPuntosIds = [
            (_b = data.punto) === null || _b === void 0 ? void 0 : _b.id,
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
        const cierresDB = ((_c = whereCierres[sequelize_1.Op.or]) === null || _c === void 0 ? void 0 : _c.length) > 0
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
        let observacion = "Pendiente";
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
            observacion = "Dictaminada";
        }
        else if (estudios.length > 0) {
            observacion = "En estudio";
        }
        const turnadoInfo = yield getComisionesTurnado((_d = data.punto) === null || _d === void 0 ? void 0 : _d.id);
        const anfitrionesNacio = yield getAnfitriones((_e = data.evento) === null || _e === void 0 ? void 0 : _e.id, (_g = (_f = data.evento) === null || _f === void 0 ? void 0 : _f.tipoevento) === null || _g === void 0 ? void 0 : _g.nombre);
        const fechaExpedicion = ((_j = (_h = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _h === void 0 ? void 0 : _h.evento) === null || _j === void 0 ? void 0 : _j.fecha)
            ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
            : "-";
        const diputado = diputados.length > 0 ? diputados.join(", ") : "-";
        const grupoParlamentario = gruposParlamentarios.length > 0 ? gruposParlamentarios.join(", ") : "-";
        const fechaEventoRaw = (_l = (_k = data.evento) === null || _k === void 0 ? void 0 : _k.fecha) !== null && _l !== void 0 ? _l : null;
        return {
            no: index + 1,
            id: normalizarTexto(data.id),
            autor: normalizarTexto(proponentesString),
            autor_detalle: normalizarTexto(presentaString),
            iniciativa: normalizarTexto(data.iniciativa),
            materia: normalizarTexto((_m = data.punto) === null || _m === void 0 ? void 0 : _m.punto),
            presentac: formatearFechaCorta(fechaEventoRaw),
            fecha_evento_raw: fechaEventoRaw,
            comisiones: normalizarTexto(turnadoInfo.comisiones_turnado || anfitrionesNacio.comisiones),
            expedicion: fechaExpedicion,
            observac: observacion,
            diputado,
            grupo_parlamentario: grupoParlamentario,
            periodo: obtenerPeriodo(fechaEventoRaw)
        };
    })));
    return reporte;
});
const aplicarEstiloHoja = (worksheet) => {
    const headerRow = worksheet.getRow(1);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
        cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }
        };
        cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true
        };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00B050" }
        };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1)
            return;
        row.eachCell((cell) => {
            cell.alignment = {
                vertical: "top",
                horizontal: "left",
                wrapText: true
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
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
    data.forEach((item, index) => {
        worksheet.addRow(Object.assign(Object.assign({}, item), { no: index + 1 }));
    });
    aplicarEstiloHoja(worksheet);
    const ultimaColumna = String.fromCharCode(64 + columnas.length);
    worksheet.autoFilter = {
        from: "A1",
        to: `${ultimaColumna}1`
    };
    const columnasCentradas = ["A"];
    columnasCentradas.forEach((col) => {
        worksheet.getColumn(col).alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true
        };
    });
    return yield enviarWorkbook(res, workbook, nombreArchivo);
});
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
            { header: "PERIODO", key: "periodo", width: 15 }
        ], reporte);
    }
    catch (error) {
        console.error("Error al generar Excel general de iniciativas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getifnini = getifnini;
const getIniciativasEnEstudio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const filtrado = reporte.filter((item) => item.observac === "En estudio");
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
            { header: "PERIODO", key: "periodo", width: 15 }
        ], filtrado);
    }
    catch (error) {
        console.error("Error al generar Excel de iniciativas en estudio:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getIniciativasEnEstudio = getIniciativasEnEstudio;
const getIniciativasAprobadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const filtrado = reporte.filter((item) => item.observac === "Aprobada");
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
            { header: "PERIODO", key: "periodo", width: 15 }
        ], filtrado);
    }
    catch (error) {
        console.error("Error al generar Excel de iniciativas aprobadas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
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
            if (!mapa.has(llave)) {
                mapa.set(llave, {
                    diputado,
                    grupo_parlamentario: grupo,
                    en_estudio: 0,
                    aprobadas: 0,
                    total: 0
                });
            }
            const fila = mapa.get(llave);
            if (item.observac === "En estudio") {
                fila.en_estudio += 1;
            }
            if (item.observac === "Aprobada") {
                fila.aprobadas += 1;
            }
            fila.total += 1;
        }
        const resultado = Array.from(mapa.values()).sort((a, b) => {
            if (a.grupo_parlamentario < b.grupo_parlamentario)
                return -1;
            if (a.grupo_parlamentario > b.grupo_parlamentario)
                return 1;
            if (a.diputado < b.diputado)
                return -1;
            if (a.diputado > b.diputado)
                return 1;
            return 0;
        });
        return yield generarExcelSimple(res, "Grupo y Diputado", "reporte_iniciativas_grupo_diputado.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "DIPUTADO", key: "diputado", width: 35 },
            { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 30 },
            { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
            { header: "APROBADAS", key: "aprobadas", width: 15 },
            { header: "TOTAL", key: "total", width: 12 }
        ], resultado);
    }
    catch (error) {
        console.error("Error al generar Excel por grupo y diputado:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getIniciativasPorGrupoYDiputado = getIniciativasPorGrupoYDiputado;
const getTotalesPorPeriodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const mapa = new Map();
        for (const item of reporte) {
            const periodo = item.periodo || "-";
            if (!mapa.has(periodo)) {
                mapa.set(periodo, {
                    periodo,
                    pendientes: 0,
                    en_estudio: 0,
                    aprobadas: 0,
                    total: 0
                });
            }
            const fila = mapa.get(periodo);
            if (item.observac === "En estudio") {
                fila.en_estudio += 1;
            }
            if (item.observac === "Aprobada") {
                fila.aprobadas += 1;
            }
            if (item.observac === "Pendiente") {
                fila.pendientes += 1;
            }
            fila.total += 1;
        }
        const resultado = Array.from(mapa.values()).sort((a, b) => {
            if (a.periodo < b.periodo)
                return -1;
            if (a.periodo > b.periodo)
                return 1;
            return 0;
        });
        return yield generarExcelSimple(res, "Totales por periodo", "reporte_iniciativas_totales_periodo.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "PERIODO", key: "periodo", width: 18 },
            { header: "PENDIENTES", key: "pendientes", width: 15 },
            { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
            { header: "APROBADAS", key: "aprobadas", width: 15 },
            { header: "TOTAL", key: "total", width: 12 }
        ], resultado);
    }
    catch (error) {
        console.error("Error al generar Excel total por periodo:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getTotalesPorPeriodo = getTotalesPorPeriodo;
