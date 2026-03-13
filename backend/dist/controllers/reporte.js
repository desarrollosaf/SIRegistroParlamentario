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
exports.getReporteIniciativasIntegrantes = exports.getTotalesPorPeriodo = exports.getIniciativasPorGrupoYDiputado = exports.getIniciativasAprobadas = exports.getIniciativasEnEstudio = exports.getifnini = void 0;
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let proponentesString = "";
    let presentaString = "";
    const diputados = [];
    const diputadoIds = [];
    const gruposParlamentarios = [];
    const grupoParlamentarioIds = [];
    if (!id) {
        return {
            proponentesString,
            presentaString,
            diputados,
            diputadoIds,
            gruposParlamentarios,
            grupoParlamentarioIds
        };
    }
    const presentan = yield iniciativaspresenta_1.default.findAll({
        where: { id_iniciativa: id },
        raw: true
    });
    const proponentesUnicos = new Map();
    const presentanData = [];
    for (const p of presentan) {
        const tipoProponente = yield proponentes_1.default.findOne({
            where: { id: p.id_tipo_presenta },
            attributes: ["id", "valor"],
            raw: true
        });
        const tipoValor = (_a = tipoProponente === null || tipoProponente === void 0 ? void 0 : tipoProponente.valor) !== null && _a !== void 0 ? _a : "";
        let valor = "";
        if (tipoValor === "Diputadas y Diputados") {
            const dip = yield diputado_1.default.findOne({
                where: { id: p.id_presenta },
                raw: true,
                include: [
                    {
                        model: integrante_legislaturas_1.default,
                        as: "integrante",
                    }
                ]
            });
            if (dip) {
                valor = `${(_b = dip.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.amaterno) !== null && _c !== void 0 ? _c : ""} ${(_d = dip.nombres) !== null && _d !== void 0 ? _d : ""}`.trim();
                if (valor)
                    diputados.push(valor);
                if (p.id_presenta)
                    diputadoIds.push(String(p.id_presenta));
                if (dip.integrante) {
                    const partido = yield partidos_1.default.findOne({
                        where: { id: dip.integrante.partido_id },
                        attributes: ["id", "nombre"],
                        raw: true
                    });
                    if (partido === null || partido === void 0 ? void 0 : partido.nombre)
                        gruposParlamentarios.push(partido.nombre);
                    if (partido === null || partido === void 0 ? void 0 : partido.id)
                        grupoParlamentarioIds.push(String(partido.id));
                }
            }
        }
        else if (["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)) {
            const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_e = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _e !== void 0 ? _e : "";
        }
        else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
            const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_f = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _f !== void 0 ? _f : "";
        }
        else if (tipoValor === "Grupo Parlamentario") {
            const partido = yield partidos_1.default.findOne({
                where: { id: p.id_presenta },
                attributes: ["id", "nombre"],
                raw: true
            });
            valor = (_g = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _g !== void 0 ? _g : "";
            if (valor)
                gruposParlamentarios.push(valor);
            if (partido === null || partido === void 0 ? void 0 : partido.id)
                grupoParlamentarioIds.push(String(partido.id));
        }
        else if (tipoValor === "Legislatura") {
            const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_h = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _h !== void 0 ? _h : "";
        }
        else if (tipoValor === "Secretarías del GEM") {
            const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = `${(_j = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _j !== void 0 ? _j : ""} / ${(_k = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _k !== void 0 ? _k : ""}`.trim();
        }
        else {
            const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta }, raw: true });
            valor = (_l = cat === null || cat === void 0 ? void 0 : cat.nombre_titular) !== null && _l !== void 0 ? _l : "";
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
        diputadoIds: [...new Set(diputadoIds)],
        gruposParlamentarios: [...new Set(gruposParlamentarios)],
        grupoParlamentarioIds: [...new Set(grupoParlamentarioIds)]
    };
});
const obtenerIniciativasBase = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield inciativas_puntos_ordens_1.default.findAll({
        attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida"],
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const data = iniciativa.toJSON();
        const { proponentesString, presentaString, diputados, diputadoIds, gruposParlamentarios, grupoParlamentarioIds } = yield getPresentantesDePunto(data.id);
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
        else {
            if (cierrePrincipal || dispensa) {
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
        const anfitrionesNacio = yield getAnfitriones((_f = data.evento) === null || _f === void 0 ? void 0 : _f.id, (_h = (_g = data.evento) === null || _g === void 0 ? void 0 : _g.tipoevento) === null || _h === void 0 ? void 0 : _h.nombre);
        const fechaExpedicion = ((_k = (_j = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _j === void 0 ? void 0 : _j.evento) === null || _k === void 0 ? void 0 : _k.fecha)
            ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
            : "-";
        const diputado = diputados.length > 0 ? diputados.join(", ") : "-";
        const grupoParlamentario = gruposParlamentarios.length > 0 ? gruposParlamentarios.join(", ") : "-";
        const fechaEventoRaw = (_m = (_l = data.evento) === null || _l === void 0 ? void 0 : _l.fecha) !== null && _m !== void 0 ? _m : null;
        return {
            no: index + 1,
            id: normalizarTexto(data.id),
            autor: normalizarTexto(proponentesString),
            autor_detalle: normalizarTexto(presentaString),
            iniciativa: normalizarTexto(data.iniciativa),
            materia: normalizarTexto((_o = data.punto) === null || _o === void 0 ? void 0 : _o.punto),
            presentac: formatearFechaCorta(fechaEventoRaw),
            fecha_evento_raw: fechaEventoRaw,
            comisiones: normalizarTexto(turnadoInfo.comisiones_turnado || anfitrionesNacio.comisiones),
            expedicion: fechaExpedicion,
            observac: observacion,
            diputado,
            grupo_parlamentario: grupoParlamentario,
            diputado_ids: diputadoIds,
            grupo_parlamentario_ids: grupoParlamentarioIds,
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
            // if (diputado  == '-' && grupo == '-'){
            //   console.log(reporte)
            //   return 500;
            // }
            const llave = `${diputado}__${grupo}`;
            if (!mapa.has(llave)) {
                mapa.set(llave, {
                    diputado,
                    grupo_parlamentario: grupo,
                    pendientes: 0,
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
            if (item.observac === "Pendiente") {
                fila.pendientes += 1;
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
            { header: "PENDIENTES", key: "pendientes", width: 15 },
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
// export const getReporteIniciativasIntegrantes = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { id_tipo, id } = req.body;
//     if (![1, 2, "1", "2"].includes(id_tipo)) {
//       return res.status(400).json({
//         message: "id_tipo inválido. Debe ser 1 (Diputado) o 2 (Grupo Parlamentario)"
//       });
//     }
//     if (id === undefined || id === null || id === "") {
//       return res.status(400).json({
//         message: "El campo id es obligatorio. Usa 0 para traer todos."
//       });
//     }
//     const tipo = Number(id_tipo);
//     const filtroId = String(id);
//     let reporte = await construirReporteBase();
//     // id_tipo = 2 => Diputado
//     if (tipo === 2) {
//       if (filtroId !== "0") {
//         reporte = reporte.filter((item: any) =>
//           Array.isArray(item.diputado_ids) &&
//           item.diputado_ids.map(String).includes(filtroId)
//         );
//       }
//       const mapa = new Map<string, any>();
//       for (const item of reporte) {
//         const diputado = item.diputado || "-";
//         let diputadoIds = Array.isArray(item.diputado_ids) ? item.diputado_ids : [];
//         if (filtroId !== "0") {
//           diputadoIds = diputadoIds.filter((x: any) => String(x) === filtroId);
//         }
//         if (diputadoIds.length === 0) {
//           if (filtroId === "0") {
//             diputadoIds = ["0"];
//           } else {
//             continue;
//           }
//         }
//         for (const dipId of diputadoIds) {
//           const llave = String(dipId);
//           if (!mapa.has(llave)) {
//             mapa.set(llave, {
//               diputado_id: String(dipId),
//               diputado,
//               pendientes: 0,
//               en_estudio: 0,
//               dictaminadas: 0,
//               aprobadas: 0,
//               rechazadas_comision: 0,
//               rechazadas_sesion: 0,
//               total: 0
//             });
//           }
//           const fila = mapa.get(llave);
//           if (item.observac === "Pendiente") fila.pendientes += 1;
//           if (item.observac === "En estudio") fila.en_estudio += 1;
//           if (item.observac === "Dictaminada") fila.dictaminadas += 1;
//           if (item.observac === "Aprobada") fila.aprobadas += 1;
//           if (item.observac === "Rechazada en comisión") fila.rechazadas_comision += 1;
//           if (item.observac === "Rechazada en sesión") fila.rechazadas_sesion += 1;
//           fila.total += 1;
//         }
//       }
//       const resultado = Array.from(mapa.values()).sort((a, b) => {
//         if (a.diputado < b.diputado) return -1;
//         if (a.diputado > b.diputado) return 1;
//         return 0;
//       });
//       return await generarExcelSimple(
//         res,
//         "Reporte Diputados",
//         "reporte_iniciativas_diputados.xlsx",
//         [
//           { header: "NO.", key: "no", width: 8 },
//           { header: "ID DIPUTADO", key: "diputado_id", width: 18 },
//           { header: "DIPUTADO", key: "diputado", width: 35 },
//           { header: "PENDIENTES", key: "pendientes", width: 15 },
//           { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
//           { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
//           { header: "APROBADAS", key: "aprobadas", width: 15 },
//           { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
//           { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
//           { header: "TOTAL", key: "total", width: 12 }
//         ],
//         resultado
//       );
//     }
//     // id_tipo = 1 => Grupo Parlamentario
//     if (tipo === 1) {
//       if (filtroId !== "0") {
//         reporte = reporte.filter((item: any) =>
//           Array.isArray(item.grupo_parlamentario_ids) &&
//           item.grupo_parlamentario_ids.map(String).includes(filtroId)
//         );
//       }
//       const mapa = new Map<string, any>();
//       for (const item of reporte) {
//         const grupo = item.grupo_parlamentario || "-";
//         let grupoIds = Array.isArray(item.grupo_parlamentario_ids)
//           ? item.grupo_parlamentario_ids
//           : [];
//         if (filtroId !== "0") {
//           grupoIds = grupoIds.filter((x: any) => String(x) === filtroId);
//         }
//         if (grupoIds.length === 0) {
//           if (filtroId === "0") {
//             grupoIds = ["0"];
//           } else {
//             continue;
//           }
//         }
//         for (const grupoId of grupoIds) {
//           const llave = String(grupoId);
//           if (!mapa.has(llave)) {
//             mapa.set(llave, {
//               grupo_parlamentario_id: String(grupoId),
//               grupo_parlamentario: grupo,
//               pendientes: 0,
//               en_estudio: 0,
//               dictaminadas: 0,
//               aprobadas: 0,
//               rechazadas_comision: 0,
//               rechazadas_sesion: 0,
//               total: 0
//             });
//           }
//           const fila = mapa.get(llave);
//           if (item.observac === "Pendiente") fila.pendientes += 1;
//           if (item.observac === "En estudio") fila.en_estudio += 1;
//           if (item.observac === "Dictaminada") fila.dictaminadas += 1;
//           if (item.observac === "Aprobada") fila.aprobadas += 1;
//           if (item.observac === "Rechazada en comisión") fila.rechazadas_comision += 1;
//           if (item.observac === "Rechazada en sesión") fila.rechazadas_sesion += 1;
//           fila.total += 1;
//         }
//       }
//       const resultado = Array.from(mapa.values()).sort((a, b) => {
//         if (a.grupo_parlamentario < b.grupo_parlamentario) return -1;
//         if (a.grupo_parlamentario > b.grupo_parlamentario) return 1;
//         return 0;
//       });
//       return await generarExcelSimple(
//         res,
//         "Reporte Grupos",
//         "reporte_iniciativas_grupos_parlamentarios.xlsx",
//         [
//           { header: "NO.", key: "no", width: 8 },
//           { header: "ID GRUPO", key: "grupo_parlamentario_id", width: 18 },
//           { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 35 },
//           { header: "PENDIENTES", key: "pendientes", width: 15 },
//           { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
//           { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
//           { header: "APROBADAS", key: "aprobadas", width: 15 },
//           { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
//           { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
//           { header: "TOTAL", key: "total", width: 12 }
//         ],
//         resultado
//       );
//     }
//     return res.status(400).json({
//       message: "No se pudo procesar la solicitud"
//     });
//   } catch (error: any) {
//     console.error("Error al generar Excel de integrantes:", error);
//     return res.status(500).json({
//       message: "Error interno del servidor",
//       error: error.message
//     });
//   }
// };
const getReporteIniciativasIntegrantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id_tipo, id } = req.body;
        if (![1, 2, "1", "2"].includes(id_tipo)) {
            return res.status(400).json({
                message: "id_tipo inválido. Debe ser 1 (Diputado) o 2 (Grupo Parlamentario)"
            });
        }
        if (id === undefined || id === null || id === "") {
            return res.status(400).json({
                message: "El campo id es obligatorio. Usa 0 para traer todos."
            });
        }
        const tipo = Number(id_tipo);
        const filtroId = String(id);
        // AJUSTA ESTOS IDS SEGÚN TU CATÁLOGO proponentes
        const ID_TIPO_PRESENTA_DIPUTADO = 9;
        const ID_TIPO_PRESENTA_GRUPO = 19;
        let wherePresenta = {};
        if (tipo === 2) {
            // Diputado
            wherePresenta.id_tipo_presenta = ID_TIPO_PRESENTA_DIPUTADO;
            if (filtroId !== "0") {
                wherePresenta.id_presenta = filtroId;
            }
        }
        if (tipo === 1) {
            // Grupo Parlamentario
            wherePresenta.id_tipo_presenta = ID_TIPO_PRESENTA_GRUPO;
            if (filtroId !== "0") {
                wherePresenta.id_presenta = filtroId;
            }
        }
        const relaciones = yield iniciativaspresenta_1.default.findAll({
            where: wherePresenta,
            attributes: ["id_iniciativa", "id_presenta"],
            raw: true
        });
        if (!relaciones.length) {
            return res.status(404).json({
                message: "No se encontraron iniciativas para el filtro enviado"
            });
        }
        const iniciativasIds = [...new Set(relaciones.map((r) => String(r.id_iniciativa)).filter(Boolean))];
        let reporte = yield construirReporteBase();
        reporte = reporte.filter((item) => iniciativasIds.includes(String(item.id)));
        if (!reporte.length) {
            return res.status(404).json({
                message: "No se encontraron datos en el reporte base para esas iniciativas"
            });
        }
        // =========================
        // REPORTE POR DIPUTADO
        // =========================
        if (tipo === 2) {
            const diputadosIds = [...new Set(relaciones.map((r) => String(r.id_presenta)).filter(Boolean))];
            const diputadosDB = yield diputado_1.default.findAll({
                where: {
                    id: {
                        [sequelize_1.Op.in]: diputadosIds
                    }
                },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true
            });
            const diputadosMap = new Map();
            for (const dip of diputadosDB) {
                const nombre = `${(_a = dip.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = dip.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.nombres) !== null && _c !== void 0 ? _c : ""}`.trim();
                diputadosMap.set(String(dip.id), nombre || "-");
            }
            const iniciativasPorDiputado = new Map();
            for (const row of relaciones) {
                const dipId = String(row.id_presenta);
                const iniId = String(row.id_iniciativa);
                if (!iniciativasPorDiputado.has(dipId)) {
                    iniciativasPorDiputado.set(dipId, new Set());
                }
                iniciativasPorDiputado.get(dipId).add(iniId);
            }
            const resultado = [];
            for (const dipId of diputadosIds) {
                const iniciativasDelDip = iniciativasPorDiputado.get(dipId);
                if (!iniciativasDelDip || iniciativasDelDip.size === 0) {
                    continue;
                }
                const itemsDip = reporte.filter((item) => iniciativasDelDip.has(String(item.id)));
                if (!itemsDip.length) {
                    continue;
                }
                const fila = {
                    diputado_id: dipId,
                    diputado: diputadosMap.get(dipId) || "-",
                    pendientes: 0,
                    en_estudio: 0,
                    dictaminadas: 0,
                    aprobadas: 0,
                    rechazadas_comision: 0,
                    rechazadas_sesion: 0,
                    total: 0
                };
                for (const item of itemsDip) {
                    if (item.observac === "Pendiente")
                        fila.pendientes += 1;
                    if (item.observac === "En estudio")
                        fila.en_estudio += 1;
                    if (item.observac === "Dictaminada")
                        fila.dictaminadas += 1;
                    if (item.observac === "Aprobada")
                        fila.aprobadas += 1;
                    if (item.observac === "Rechazada en comisión")
                        fila.rechazadas_comision += 1;
                    if (item.observac === "Rechazada en sesión")
                        fila.rechazadas_sesion += 1;
                    fila.total += 1;
                }
                if (fila.diputado !== "-" && fila.total > 0) {
                    resultado.push(fila);
                }
            }
            resultado.sort((a, b) => a.diputado.localeCompare(b.diputado));
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
                { header: "TOTAL", key: "total", width: 12 }
            ], resultado);
        }
        // =========================
        // REPORTE POR GRUPO
        // =========================
        if (tipo === 1) {
            const gruposIds = [...new Set(relaciones.map((r) => String(r.id_presenta)).filter(Boolean))];
            const gruposDB = yield partidos_1.default.findAll({
                where: {
                    id: {
                        [sequelize_1.Op.in]: gruposIds
                    }
                },
                attributes: ["id", "nombre"],
                raw: true
            });
            const gruposMap = new Map();
            for (const grupo of gruposDB) {
                gruposMap.set(String(grupo.id), grupo.nombre || "-");
            }
            const iniciativasPorGrupo = new Map();
            for (const row of relaciones) {
                const grupoId = String(row.id_presenta);
                const iniId = String(row.id_iniciativa);
                if (!iniciativasPorGrupo.has(grupoId)) {
                    iniciativasPorGrupo.set(grupoId, new Set());
                }
                iniciativasPorGrupo.get(grupoId).add(iniId);
            }
            const resultado = [];
            for (const grupoId of gruposIds) {
                const iniciativasDelGrupo = iniciativasPorGrupo.get(grupoId);
                if (!iniciativasDelGrupo || iniciativasDelGrupo.size === 0) {
                    continue;
                }
                const itemsGrupo = reporte.filter((item) => iniciativasDelGrupo.has(String(item.id)));
                if (!itemsGrupo.length) {
                    continue;
                }
                const fila = {
                    grupo_parlamentario_id: grupoId,
                    grupo_parlamentario: gruposMap.get(grupoId) || "-",
                    pendientes: 0,
                    en_estudio: 0,
                    dictaminadas: 0,
                    aprobadas: 0,
                    rechazadas_comision: 0,
                    rechazadas_sesion: 0,
                    total: 0
                };
                for (const item of itemsGrupo) {
                    if (item.observac === "Pendiente")
                        fila.pendientes += 1;
                    if (item.observac === "En estudio")
                        fila.en_estudio += 1;
                    if (item.observac === "Dictaminada")
                        fila.dictaminadas += 1;
                    if (item.observac === "Aprobada")
                        fila.aprobadas += 1;
                    if (item.observac === "Rechazada en comisión")
                        fila.rechazadas_comision += 1;
                    if (item.observac === "Rechazada en sesión")
                        fila.rechazadas_sesion += 1;
                    fila.total += 1;
                }
                if (fila.grupo_parlamentario !== "-" && fila.total > 0) {
                    resultado.push(fila);
                }
            }
            resultado.sort((a, b) => a.grupo_parlamentario.localeCompare(b.grupo_parlamentario));
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
                { header: "TOTAL", key: "total", width: 12 }
            ], resultado);
        }
        return res.status(400).json({
            message: "No se pudo procesar la solicitud"
        });
    }
    catch (error) {
        console.error("Error al generar Excel de integrantes:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getReporteIniciativasIntegrantes = getReporteIniciativasIntegrantes;
