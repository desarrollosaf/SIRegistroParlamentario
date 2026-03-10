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
exports.getifnini = void 0;
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
const puntos_presenta_1 = __importDefault(require("../models/puntos_presenta"));
const proponentes_1 = __importDefault(require("../models/proponentes"));
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const secretarias_1 = __importDefault(require("../models/secretarias"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const partidos_1 = __importDefault(require("../models/partidos"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const diputado_1 = __importDefault(require("../models/diputado"));
const expedientes_estudio_puntos_1 = __importDefault(require("../models/expedientes_estudio_puntos"));
const getifnini = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
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
        const reporte = yield Promise.all(iniciativas.map((iniciativa, index) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const data = iniciativa.toJSON();
            const { proponentesString, presentaString } = yield getPresentantesDePunto(data.id_punto);
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
                attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
            });
            const expedienteIds = [
                ...new Set(expedientesRelacionados
                    .map((e) => e.expediente_id)
                    .filter(Boolean))
            ];
            const cierresDB = yield iniciativas_estudio_1.default.findAll({
                where: {
                    status: "3",
                    [sequelize_1.Op.or]: [
                        {
                            punto_origen_id: {
                                [sequelize_1.Op.in]: posiblesPuntosUnicos
                            }
                        },
                        {
                            punto_origen_id: {
                                [sequelize_1.Op.in]: expedienteIds
                            }
                        }
                    ]
                },
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
            });
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
            const turnadoInfo = yield getComisionesTurnado((_c = data.punto) === null || _c === void 0 ? void 0 : _c.id);
            const anfitrionesNacio = yield getAnfitriones((_d = data.evento) === null || _d === void 0 ? void 0 : _d.id, (_f = (_e = data.evento) === null || _e === void 0 ? void 0 : _e.tipoevento) === null || _f === void 0 ? void 0 : _f.nombre);
            const fechaExpedicion = ((_h = (_g = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _g === void 0 ? void 0 : _g.evento) === null || _h === void 0 ? void 0 : _h.fecha)
                ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
                : "-";
            return {
                no: index + 1,
                autor: proponentesString || "-",
                autor_detalle: presentaString || "-",
                iniciativa: (_j = data.iniciativa) !== null && _j !== void 0 ? _j : "-",
                materia: (_l = (_k = data.punto) === null || _k === void 0 ? void 0 : _k.punto) !== null && _l !== void 0 ? _l : "-",
                presentac: formatearFechaCorta((_m = data.evento) === null || _m === void 0 ? void 0 : _m.fecha),
                comisiones: turnadoInfo.comisiones_turnado || anfitrionesNacio.comisiones || "-",
                expedicion: fechaExpedicion,
                observac: observacion
            };
        })));
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte Iniciativas");
        worksheet.columns = [
            { header: "NO.", key: "no", width: 8 },
            { header: "AUTOR", key: "autor", width: 25 },
            { header: "PRESENTA", key: "autor_detalle", width: 35 },
            { header: "INICIATIVA", key: "iniciativa", width: 55 },
            { header: "MATERIA", key: "materia", width: 45 },
            { header: "PRESENTAC.", key: "presentac", width: 15 },
            { header: "COMISIONES", key: "comisiones", width: 40 },
            { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
            { header: "OBSERVAC.", key: "observac", width: 20 }
        ];
        reporte.forEach((item) => {
            worksheet.addRow(item);
        });
        // Estilo encabezados
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
        // Estilo celdas
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
            row.height = 35;
        });
        // Centrar algunas columnas
        const columnasCentradas = ["A", "F", "H", "I"];
        columnasCentradas.forEach((col) => {
            worksheet.getColumn(col).alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true
            };
        });
        // Filtro automático
        worksheet.autoFilter = {
            from: "A1",
            to: "I1"
        };
        // Congelar encabezado
        worksheet.views = [
            { state: "frozen", ySplit: 1 }
        ];
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="reporte_iniciativas.xlsx"');
        yield workbook.xlsx.write(res);
        return res.end();
    }
    catch (error) {
        console.error("Error al generar Excel de iniciativas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getifnini = getifnini;
const deduplicarPorId = (items) => {
    return items.filter((e, index, self) => index === self.findIndex((x) => x.id === e.id));
};
const getPresentantesDePunto = (id_punto) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    let proponentesString = "";
    let presentaString = "";
    if (!id_punto) {
        return { proponentesString, presentaString };
    }
    const presentan = yield puntos_presenta_1.default.findAll({
        where: { id_punto },
        include: [
            {
                model: proponentes_1.default,
                as: "tipo_presenta",
                attributes: ["valor"]
            }
        ]
    });
    const proponentesUnicos = new Map();
    const presentanData = [];
    for (const p of presentan) {
        const tipoValor = (_b = (_a = p.tipo_presenta) === null || _a === void 0 ? void 0 : _a.valor) !== null && _b !== void 0 ? _b : "";
        let valor = "";
        if (tipoValor === "Diputadas y Diputados") {
            const dip = yield diputado_1.default.findOne({ where: { id: p.id_presenta } });
            valor = `${(_c = dip === null || dip === void 0 ? void 0 : dip.apaterno) !== null && _c !== void 0 ? _c : ""} ${(_d = dip === null || dip === void 0 ? void 0 : dip.amaterno) !== null && _d !== void 0 ? _d : ""} ${(_e = dip === null || dip === void 0 ? void 0 : dip.nombres) !== null && _e !== void 0 ? _e : ""}`.trim();
        }
        else if (["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)) {
            const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_f = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _f !== void 0 ? _f : "";
        }
        else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
            const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_g = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _g !== void 0 ? _g : "";
        }
        else if (tipoValor === "Grupo Parlamentario") {
            const partido = yield partidos_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_h = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _h !== void 0 ? _h : "";
        }
        else if (tipoValor === "Legislatura") {
            const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_j = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _j !== void 0 ? _j : "";
        }
        else if (tipoValor === "Secretarías del GEM") {
            const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta } });
            valor = `${(_k = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _k !== void 0 ? _k : ""} / ${(_l = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _l !== void 0 ? _l : ""}`.trim();
        }
        else {
            const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta } });
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
    return { proponentesString, presentaString };
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
    const idsRaw = puntosComisiones[0].id_comision || "";
    const comisionIds = idsRaw
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    if (comisionIds.length === 0) {
        return { turnado: false, comisiones_turnado: null };
    }
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIds },
        attributes: ["nombre"],
        raw: true
    });
    return {
        turnado: true,
        comisiones_turnado: comisiones.map((c) => c.nombre).join(", ")
    };
});
