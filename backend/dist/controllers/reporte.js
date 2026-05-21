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
exports.getExcelVotacionesDetalle = exports.getEstadisticasIniciativas = exports.getDatosAsistenciaDiputado = exports.getReporteAsistenciaDiputado = exports.getComisionesDiputadoAsistencia = exports.getDiputadosAsistencia = exports.getIniciativasTurnadasComision = exports.getReportePorPeriodoLegislativo = exports.crearPeriodoLegislativo = exports.getPeriodosLegislativos = exports.getReporteIniciativasIntegrantes = exports.getTotalesPorPeriodo = exports.getIniciativasPorGrupoYDiputado = exports.getIniciativasAprobadas = exports.getIniciativasEnEstudio = exports.getifnini = void 0;
const sequelize_1 = require("sequelize");
const periodo_legislativo_1 = __importDefault(require("../models/periodo_legislativo"));
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
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const gender_1 = __importDefault(require("../models/gender"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
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
        comisiones: comisiones.map((c) => c.nombre).join(" - ")
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
        comisiones_turnado: comisiones.map((c) => c.nombre).join(" - ")
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
                paranoid: false,
                include: [
                    {
                        model: integrante_legislaturas_1.default,
                        as: "integrante",
                        paranoid: false,
                    }
                ]
            });
            if (dip) {
                valor = `${(_b = dip.nombres) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.apaterno) !== null && _c !== void 0 ? _c : ""} ${(_d = dip.amaterno) !== null && _d !== void 0 ? _d : ""}`.trim();
                if (valor)
                    diputados.push(valor);
                if (p.id_presenta)
                    diputadoIds.push(String(p.id_presenta));
                if (dip.integrante) {
                    const partido = yield partidos_1.default.findOne({
                        where: { id: dip.integrante.partido_id },
                        attributes: ["id", "nombre"],
                        raw: true,
                        paranoid: false
                    });
                    if (partido === null || partido === void 0 ? void 0 : partido.nombre)
                        gruposParlamentarios.push(partido.nombre);
                    if (partido === null || partido === void 0 ? void 0 : partido.id)
                        grupoParlamentarioIds.push(String(partido.id));
                }
            }
        }
        else if (["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)) {
            const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta }, raw: true, paranoid: false });
            valor = (_e = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _e !== void 0 ? _e : "";
        }
        else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
            const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta }, raw: true, paranoid: false });
            valor = (_f = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _f !== void 0 ? _f : "";
        }
        else if (tipoValor === "Grupo Parlamentario") {
            const partido = yield partidos_1.default.findOne({
                where: { id: p.id_presenta },
                attributes: ["id", "nombre"],
                raw: true,
                paranoid: false
            });
            valor = (_g = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _g !== void 0 ? _g : "";
            if (valor)
                gruposParlamentarios.push(valor);
            if (partido === null || partido === void 0 ? void 0 : partido.id)
                grupoParlamentarioIds.push(String(partido.id));
        }
        else if (tipoValor === "Legislatura") {
            const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta }, raw: true, paranoid: false });
            valor = (_h = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _h !== void 0 ? _h : "";
        }
        else if (tipoValor === "Secretarías del GEM") {
            const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta }, raw: true, paranoid: false });
            valor = `${(_j = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _j !== void 0 ? _j : ""} / ${(_k = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _k !== void 0 ? _k : ""}`.trim();
        }
        else {
            const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta }, raw: true, paranoid: false });
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
    proponentesString = Array.from(proponentesUnicos.keys()).join(" - ");
    presentaString = presentanData.map((p) => p.valor).join(" - ");
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
        attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida", "tipo", "id_sap"],
        include: [
            {
                model: puntos_ordens_1.default,
                as: "punto",
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa", "se_turna_comision"],
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        const data = iniciativa.toJSON();
        const { proponentesString, presentaString, diputados, diputadoIds, gruposParlamentarios, grupoParlamentarioIds } = yield getPresentantesDePunto(data.id);
        const todosEstudios = [
            ...(Array.isArray((_a = data.punto) === null || _a === void 0 ? void 0 : _a.estudio) ? data.punto.estudio : []),
            ...(Array.isArray(data.expedienteturno)
                ? data.expedienteturno.flatMap((exp) => Array.isArray(exp.estudio)
                    ? exp.estudio
                    : exp.estudio
                        ? [exp.estudio]
                        : [])
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
        const anfitrionesNacio = yield getAnfitriones((_f = data.evento) === null || _f === void 0 ? void 0 : _f.id, (_h = (_g = data.evento) === null || _g === void 0 ? void 0 : _g.tipoevento) === null || _h === void 0 ? void 0 : _h.nombre);
        const fechaExpedicion = ((_k = (_j = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _j === void 0 ? void 0 : _j.evento) === null || _k === void 0 ? void 0 : _k.fecha)
            ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
            : "-";
        const diputado = diputados.length > 0 ? diputados.join(", ") : "-";
        const grupoParlamentario = gruposParlamentarios.length > 0
            ? gruposParlamentarios.join(", ")
            : "-";
        const fechaEventoRaw = (_m = (_l = data.evento) === null || _l === void 0 ? void 0 : _l.fecha) !== null && _m !== void 0 ? _m : null;
        const tipoTexto = (tipo) => {
            switch (tipo) {
                case 1: return "Iniciativa";
                case 2: return "Punto de acuerdo";
                case 3: return "Minuta";
                default: return "Desconocido";
            }
        };
        return {
            no: index + 1,
            id: normalizarTexto(data.id),
            id_sap: data.id_sap,
            autor: normalizarTexto(proponentesString),
            autor_detalle: normalizarTexto(presentaString),
            iniciativa: normalizarTexto(data.iniciativa),
            materia: normalizarTexto((_o = data.punto) === null || _o === void 0 ? void 0 : _o.punto),
            presentac: formatearFechaCorta(fechaEventoRaw),
            fecha_evento_raw: fechaEventoRaw,
            comisiones: normalizarTexto(turnadoInfo.comisiones_turnado || ''),
            expedicion: fechaExpedicion,
            observac: observacion,
            diputado,
            grupo_parlamentario: grupoParlamentario,
            diputado_ids: diputadoIds,
            grupo_parlamentario_ids: grupoParlamentarioIds,
            periodo: obtenerPeriodo(fechaEventoRaw),
            // ✅ AQUÍ ESTÁ EL FIX
            tipo: tipoTexto((_p = data.tipo) !== null && _p !== void 0 ? _p : (_q = data.punto) === null || _q === void 0 ? void 0 : _q.tipo),
            se_turna_comision: String((_r = data.punto) === null || _r === void 0 ? void 0 : _r.se_turna_comision) === "1" || ((_s = data.punto) === null || _s === void 0 ? void 0 : _s.se_turna_comision) === true,
            votingPuntoIntId: dispensa
                ? ((_u = (_t = data.punto) === null || _t === void 0 ? void 0 : _t.id) !== null && _u !== void 0 ? _u : null)
                : ((_w = (_v = cierrePrincipal === null || cierrePrincipal === void 0 ? void 0 : cierrePrincipal.iniciativa) === null || _v === void 0 ? void 0 : _v.id) !== null && _w !== void 0 ? _w : null),
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
            { header: "ID_SAP", key: "id_sap", width: 40 },
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
            { header: "TIPO", key: "tipo", width: 15 }
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
const getPeriodosLegislativos = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const periodos = yield periodo_legislativo_1.default.findAll({
            order: [["fecha_inicio", "DESC"]],
            raw: true
        });
        return res.json({ data: periodos });
    }
    catch (error) {
        console.error("Error al obtener periodos legislativos:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getPeriodosLegislativos = getPeriodosLegislativos;
const crearPeriodoLegislativo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, anio_legislativo, fecha_inicio, fecha_termino, tipo } = req.body;
        if (!nombre || !fecha_inicio || !fecha_termino || !tipo) {
            return res.status(400).json({ message: "Faltan campos requeridos: nombre, fecha_inicio, fecha_termino, tipo" });
        }
        if (![1, 2].includes(Number(tipo))) {
            return res.status(400).json({ message: "tipo debe ser 1 (ordinario) o 2 (extraordinario)" });
        }
        if (new Date(fecha_inicio) > new Date(fecha_termino)) {
            return res.status(400).json({ message: "fecha_inicio no puede ser mayor que fecha_termino" });
        }
        const periodo = yield periodo_legislativo_1.default.create({
            nombre,
            anio_legislativo: anio_legislativo || null,
            fecha_inicio,
            fecha_termino,
            tipo
        });
        return res.status(201).json({ data: periodo });
    }
    catch (error) {
        console.error("Error al crear periodo legislativo:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.crearPeriodoLegislativo = crearPeriodoLegislativo;
const getReportePorPeriodoLegislativo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { periodo_ids } = req.body;
        const ids = Array.isArray(periodo_ids) ? periodo_ids : (periodo_ids ? [periodo_ids] : []);
        if (ids.length === 0) {
            return res.status(400).json({ message: "periodo_ids es requerido" });
        }
        const periodos = yield periodo_legislativo_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: ids } },
            order: [["fecha_inicio", "ASC"]],
            raw: true
        });
        if (!periodos.length) {
            return res.status(404).json({ message: "Periodos legislativos no encontrados" });
        }
        const reporte = yield construirReporteBase();
        const columnas = [
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
            { header: "TIPO", key: "tipo", width: 15 }
        ];
        if (periodos.length === 1) {
            const periodo = periodos[0];
            const fechaInicio = new Date(periodo.fecha_inicio + "T00:00:00Z");
            const fechaTermino = new Date(periodo.fecha_termino + "T23:59:59Z");
            const filtrado = reporte.filter((item) => {
                if (!item.fecha_evento_raw)
                    return false;
                const fechaEvento = new Date(item.fecha_evento_raw);
                return fechaEvento >= fechaInicio && fechaEvento <= fechaTermino;
            });
            const tipoPeriodo = periodo.tipo === 1 ? "Ordinario" : "Extraordinario";
            const nombreSeguro = periodo.nombre.replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ ]/g, "").trim();
            const nombreArchivo = `reporte_${tipoPeriodo.toLowerCase()}_${nombreSeguro.replace(/\s+/g, "_")}.xlsx`;
            return yield generarExcelSimple(res, `${tipoPeriodo} - ${periodo.nombre}`, nombreArchivo, columnas, filtrado);
        }
        // Múltiples periodos: una hoja por periodo dentro del mismo workbook
        const workbook = new ExcelJS.Workbook();
        for (const periodo of periodos) {
            const fechaInicio = new Date(periodo.fecha_inicio + "T00:00:00Z");
            const fechaTermino = new Date(periodo.fecha_termino + "T23:59:59Z");
            const filtrado = reporte.filter((item) => {
                if (!item.fecha_evento_raw)
                    return false;
                const fechaEvento = new Date(item.fecha_evento_raw);
                return fechaEvento >= fechaInicio && fechaEvento <= fechaTermino;
            });
            const tipoPeriodo = periodo.tipo === 1 ? "Ord." : "Ext.";
            const nombreHoja = `${tipoPeriodo} ${periodo.nombre}`.substring(0, 31);
            const worksheet = workbook.addWorksheet(nombreHoja);
            worksheet.columns = columnas;
            filtrado.forEach((item, index) => {
                worksheet.addRow(Object.assign(Object.assign({}, item), { no: index + 1 }));
            });
            aplicarEstiloHoja(worksheet);
            const ultimaColumna = String.fromCharCode(64 + columnas.length);
            worksheet.autoFilter = { from: "A1", to: `${ultimaColumna}1` };
            worksheet.getColumn("A").alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        }
        return yield enviarWorkbook(res, workbook, "reporte_periodos_multiples.xlsx");
    }
    catch (error) {
        console.error("Error al generar reporte por periodo legislativo:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getReportePorPeriodoLegislativo = getReportePorPeriodoLegislativo;
const getIniciativasTurnadasComision = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporte = yield construirReporteBase();
        const filtrado = reporte.filter((item) => item.se_turna_comision && item.comisiones && item.comisiones !== "-");
        const rows = filtrado.map((item) => ({
            comisiones: item.comisiones !== "-" ? item.comisiones.replace(/, /g, " / ") : "-",
            iniciativa: item.iniciativa,
            info: `${item.presentac} / ${item.autor_detalle} / ${item.observac}`
        }));
        return yield generarExcelSimple(res, "Turnadas a Comisión", "reporte_turnadas_comision.xlsx", [
            { header: "NO.", key: "no", width: 8 },
            { header: "COMISIÓN(ES)", key: "comisiones", width: 55 },
            { header: "INICIATIVA", key: "iniciativa", width: 60 },
            { header: "INFO INICIATIVA", key: "info", width: 55 }
        ], rows);
    }
    catch (error) {
        console.error("Error al generar Excel de iniciativas turnadas a comisión:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getIniciativasTurnadasComision = getIniciativasTurnadasComision;
// ─────────────────────────────────────────────────────────────────────────────
//  REPORTE DE ASISTENCIA POR DIPUTADO
// ─────────────────────────────────────────────────────────────────────────────
const labelSentido = (sentido) => {
    switch (sentido) {
        case 1: return "ASISTENCIA";
        case 2: return "ASISTENCIA ZOOM";
        case 3: return "ASISTENCIA JUSTIFICADA";
        case 0: return "PENDIENTE";
        default: return "SIN REGISTRO";
    }
};
const getDiputadosAsistencia = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const diputados = yield diputado_1.default.findAll({
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            order: [["apaterno", "ASC"], ["nombres", "ASC"]],
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: "integrante",
                    attributes: [],
                    where: {
                        [sequelize_1.Op.or]: [
                            { fecha_fin: null },
                            { fecha_fin: "" }
                        ]
                    },
                    required: true,
                }
            ],
            raw: true
        });
        return res.status(200).json({ data: diputados });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al obtener diputados", error: error.message });
    }
});
exports.getDiputadosAsistencia = getDiputadosAsistencia;
const getComisionesDiputadoAsistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id } = req.params;
        const integrante = yield integrante_legislaturas_1.default.findOne({
            where: { diputado_id },
            order: [["fecha_inicio", "DESC"]],
            raw: true
        });
        if (!integrante) {
            return res.status(404).json({ message: "No se encontró integrante legislatura para el diputado" });
        }
        const integrantesComision = yield integrante_comisions_1.default.findAll({
            where: { integrante_legislatura_id: integrante.id },
            include: [{ model: comisions_1.default, as: "comision", attributes: ["id", "nombre"] }]
        });
        const comisiones = integrantesComision.map(ic => ic.comision).filter(Boolean);
        return res.status(200).json({ data: comisiones });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al obtener comisiones", error: error.message });
    }
});
exports.getComisionesDiputadoAsistencia = getComisionesDiputadoAsistencia;
const getReporteAsistenciaDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id } = req.body;
        if (!diputado_id)
            return res.status(400).json({ message: "diputado_id es requerido" });
        // 1. Diputado
        const diputado = yield diputado_1.default.findOne({ where: { id: diputado_id }, raw: true });
        if (!diputado)
            return res.status(404).json({ message: "Diputado no encontrado" });
        const nombreDiputado = `${diputado.apaterno} ${diputado.amaterno} ${diputado.nombres}`.trim();
        // 2. Integrante legislatura (más reciente)
        const integrante = yield integrante_legislaturas_1.default.findOne({
            where: { diputado_id },
            order: [["fecha_inicio", "DESC"]],
            raw: true
        });
        if (!integrante)
            return res.status(404).json({ message: "No se encontró integrante legislatura" });
        // 3. Comisiones del diputado
        const integrantesComision = yield integrante_comisions_1.default.findAll({
            where: { integrante_legislatura_id: integrante.id },
            include: [{ model: comisions_1.default, as: "comision", attributes: ["id", "nombre"] }]
        });
        if (!integrantesComision.length) {
            return res.status(404).json({ message: "El diputado no tiene comisiones asignadas" });
        }
        const comisionIds = integrantesComision.map(ic => ic.comision_id);
        const comisionNombreMap = new Map(integrantesComision.map(ic => { var _a; return [ic.comision_id, ((_a = ic.comision) === null || _a === void 0 ? void 0 : _a.nombre) || "-"]; }));
        // 4. Agendas donde esas comisiones son anfitrión
        const anfitriones = yield anfitrion_agendas_1.default.findAll({
            where: { autor_id: { [sequelize_1.Op.in]: comisionIds } },
            raw: true
        });
        if (!anfitriones.length) {
            return res.status(404).json({ message: "No se encontraron eventos para las comisiones del diputado" });
        }
        const agendaComisionMap = new Map();
        for (const anf of anfitriones) {
            if (!agendaComisionMap.has(anf.agenda_id)) {
                agendaComisionMap.set(anf.agenda_id, anf.autor_id);
            }
        }
        const agendaIds = Array.from(agendaComisionMap.keys());
        // 5. Detalle de agendas con tipo de evento
        const agendas = yield agendas_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: agendaIds } },
            include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }],
            order: [["fecha", "ASC"]]
        });
        // 6. Asistencias del diputado en esos eventos
        const asistencias = yield asistencia_votos_1.default.findAll({
            where: { id_diputado: diputado_id, id_agenda: { [sequelize_1.Op.in]: agendaIds } },
            raw: true
        });
        const asistenciaMap = new Map(asistencias.map(a => [a.id_agenda, a]));
        // 7. Construir filas
        const rows = agendas.map((agenda) => {
            var _a, _b;
            const asistencia = asistenciaMap.get(agenda.id);
            const comisionId = agendaComisionMap.get(agenda.id);
            const comision = comisionNombreMap.get(comisionId || "") || "-";
            const sentido = (_a = asistencia === null || asistencia === void 0 ? void 0 : asistencia.sentido_voto) !== null && _a !== void 0 ? _a : null;
            return {
                fecha: agenda.fecha ? new Date(agenda.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-",
                comision,
                tipo_evento: ((_b = agenda.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) || "-",
                descripcion: agenda.descripcion || "-",
                asistencia: labelSentido(sentido),
                sentido_raw: sentido
            };
        });
        // 8. Totales
        const totales = {
            presencial: rows.filter(r => r.sentido_raw === 1).length,
            zoom: rows.filter(r => r.sentido_raw === 2).length,
            justificada: rows.filter(r => r.sentido_raw === 3).length,
            pendiente: rows.filter(r => r.sentido_raw === 0).length,
            sin_registro: rows.filter(r => r.sentido_raw === null).length,
            total: rows.length
        };
        // 9. Generar Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(nombreDiputado.substring(0, 31));
        worksheet.columns = [
            { header: "NO.", key: "no", width: 6 },
            { header: "FECHA", key: "fecha", width: 15 },
            { header: "COMISIÓN", key: "comision", width: 40 },
            { header: "TIPO DE EVENTO", key: "tipo_evento", width: 25 },
            { header: "DESCRIPCIÓN", key: "descripcion", width: 45 },
            { header: "ASISTENCIA", key: "asistencia", width: 25 },
        ];
        rows.forEach((row, index) => {
            const excelRow = worksheet.addRow({
                no: index + 1,
                fecha: row.fecha,
                comision: row.comision,
                tipo_evento: row.tipo_evento,
                descripcion: row.descripcion,
                asistencia: row.asistencia
            });
            // Color por tipo de asistencia
            const colorMap = {
                1: "FFD1FAE5", // verde suave
                2: "FFDBEAFE", // azul suave
                3: "FFFEF9C3", // amarillo suave
                0: "FFF3F4F6", // gris suave
            };
            const color = row.sentido_raw !== null ? colorMap[row.sentido_raw] : "FFFFF7ED";
            if (color) {
                excelRow.getCell("asistencia").fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
            }
        });
        aplicarEstiloHoja(worksheet);
        worksheet.autoFilter = { from: "A1", to: "F1" };
        worksheet.getColumn("A").alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        // Sección de resumen
        worksheet.addRow([]);
        const headerRow = worksheet.addRow(["", "", "", "", "RESUMEN DE ASISTENCIA", ""]);
        headerRow.getCell(5).font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF800048" } };
        const resumen = [
            ["ASISTENCIA PRESENCIAL", totales.presencial, "FFD1FAE5"],
            ["ASISTENCIA ZOOM", totales.zoom, "FFDBEAFE"],
            ["ASISTENCIA JUSTIFICADA", totales.justificada, "FFFEF9C3"],
            ["PENDIENTE", totales.pendiente, "FFF3F4F6"],
            ["SIN REGISTRO", totales.sin_registro, "FFFFF7ED"],
            ["TOTAL EVENTOS", totales.total, "FFE9D5FF"],
        ];
        resumen.forEach(([label, value, argb]) => {
            const r = worksheet.addRow(["", "", "", "", label, value]);
            r.getCell(5).font = { bold: true };
            r.getCell(6).font = { bold: true };
            r.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
            r.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
        });
        const nombreArchivo = `reporte_asistencia_${nombreDiputado.replace(/\s+/g, "_").substring(0, 30)}.xlsx`;
        return yield enviarWorkbook(res, workbook, nombreArchivo);
    }
    catch (error) {
        console.error("Error al generar reporte de asistencia por diputado:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getReporteAsistenciaDiputado = getReporteAsistenciaDiputado;
// ─── Endpoint JSON para vista visual de asistencia ────────────────────────────
const getDatosAsistenciaDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id } = req.body;
        if (!diputado_id)
            return res.status(400).json({ message: "diputado_id es requerido" });
        const diputado = yield diputado_1.default.findOne({ where: { id: diputado_id }, raw: true });
        if (!diputado)
            return res.status(404).json({ message: "Diputado no encontrado" });
        const nombreDiputado = `${diputado.apaterno} ${diputado.amaterno}`.trim() + `, ${diputado.nombres}`;
        const integrante = yield integrante_legislaturas_1.default.findOne({
            where: { diputado_id },
            order: [["fecha_inicio", "DESC"]],
            raw: true
        });
        if (!integrante)
            return res.status(404).json({ message: "No se encontró integrante legislatura" });
        const integrantesComision = yield integrante_comisions_1.default.findAll({
            where: { integrante_legislatura_id: integrante.id },
            include: [{ model: comisions_1.default, as: "comision", attributes: ["id", "nombre"] }]
        });
        if (!integrantesComision.length) {
            return res.status(200).json({ diputado: { id: diputado.id, nombre: nombreDiputado }, comisiones: [] });
        }
        const comisionIds = integrantesComision.map(ic => ic.comision_id);
        const comisionNombreMap = new Map(integrantesComision.map(ic => { var _a; return [ic.comision_id, ((_a = ic.comision) === null || _a === void 0 ? void 0 : _a.nombre) || "-"]; }));
        // Agendas donde esas comisiones son anfitrión
        const anfitriones = yield anfitrion_agendas_1.default.findAll({
            where: { autor_id: { [sequelize_1.Op.in]: comisionIds } },
            raw: true
        });
        // Mapas de relaciones
        const comisionAgendaMap = new Map();
        const agendaToComisionesMap = new Map();
        for (const anf of anfitriones) {
            if (!comisionAgendaMap.has(anf.autor_id))
                comisionAgendaMap.set(anf.autor_id, new Set());
            comisionAgendaMap.get(anf.autor_id).add(anf.agenda_id);
            if (!agendaToComisionesMap.has(anf.agenda_id))
                agendaToComisionesMap.set(anf.agenda_id, []);
            agendaToComisionesMap.get(anf.agenda_id).push(anf.autor_id);
        }
        const agendaIds = [...new Set(anfitriones.map(a => a.agenda_id))];
        const agendas = yield agendas_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: agendaIds } },
            include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }],
            order: [["fecha", "ASC"]]
        });
        const agendaDetailMap = new Map(agendas.map(a => [a.id, a]));
        const asistencias = yield asistencia_votos_1.default.findAll({
            where: { id_diputado: diputado_id, id_agenda: { [sequelize_1.Op.in]: agendaIds } },
            raw: true
        });
        const asistenciaMap = new Map(asistencias.map(a => [a.id_agenda, a]));
        const comisiones = integrantesComision.map(ic => {
            var _a;
            const agendaSet = comisionAgendaMap.get(ic.comision_id) || new Set();
            const eventos = Array.from(agendaSet)
                .map(agendaId => {
                var _a, _b;
                const agenda = agendaDetailMap.get(agendaId);
                if (!agenda)
                    return null;
                const asistencia = asistenciaMap.get(agendaId);
                const sentido = (_a = asistencia === null || asistencia === void 0 ? void 0 : asistencia.sentido_voto) !== null && _a !== void 0 ? _a : null;
                const comisionesEvento = agendaToComisionesMap.get(agendaId) || [];
                const otrasComisiones = comisionesEvento
                    .filter(c => c !== ic.comision_id && comisionIds.includes(c))
                    .map(c => comisionNombreMap.get(c) || c);
                return {
                    id: agenda.id,
                    fecha: agenda.fecha,
                    fecha_display: agenda.fecha
                        ? new Date(agenda.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "-",
                    descripcion: agenda.descripcion || "-",
                    tipo_evento: ((_b = agenda.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) || "-",
                    asistencia: labelSentido(sentido),
                    sentido_voto: sentido,
                    es_evento_unido: otrasComisiones.length > 0,
                    otras_comisiones: otrasComisiones
                };
            })
                .filter(Boolean)
                .sort((a, b) => a.fecha && b.fecha ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime() : 0);
            const totales = {
                presencial: eventos.filter((e) => (e === null || e === void 0 ? void 0 : e.sentido_voto) === 1).length,
                zoom: eventos.filter((e) => (e === null || e === void 0 ? void 0 : e.sentido_voto) === 2).length,
                justificada: eventos.filter((e) => (e === null || e === void 0 ? void 0 : e.sentido_voto) === 3).length,
                pendiente: eventos.filter((e) => (e === null || e === void 0 ? void 0 : e.sentido_voto) === 0).length,
                sin_registro: eventos.filter((e) => (e === null || e === void 0 ? void 0 : e.sentido_voto) === null).length,
                total: eventos.length
            };
            return { id: ic.comision_id, nombre: ((_a = ic.comision) === null || _a === void 0 ? void 0 : _a.nombre) || "-", eventos, totales };
        });
        return res.status(200).json({ diputado: { id: diputado.id, nombre: nombreDiputado }, comisiones });
    }
    catch (error) {
        console.error("Error al obtener datos de asistencia:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getDatosAsistenciaDiputado = getDatosAsistenciaDiputado;
const getEstadisticasIniciativas = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // ── 1. construirReporteBase: source of truth for observac/tipo/comisiones ─
        const reporte = yield construirReporteBase();
        const iniIds = reporte.map(r => r.id).filter(Boolean);
        // ── 2. Simple aggregations from reporte fields ────────────────────────────
        const conteoEstatus = {};
        const conteoTipo = {};
        const mesCounts = {};
        const comisionCounts = {};
        const allDipIdsSet = new Set();
        for (const item of reporte) {
            conteoEstatus[item.observac] = (conteoEstatus[item.observac] || 0) + 1;
            if (item.tipo)
                conteoTipo[item.tipo] = (conteoTipo[item.tipo] || 0) + 1;
            if (item.periodo && item.periodo !== '-')
                mesCounts[item.periodo] = (mesCounts[item.periodo] || 0) + 1;
            if (item.comisiones && item.comisiones !== '-') {
                for (const c of item.comisiones.split(' - ').filter(Boolean)) {
                    comisionCounts[c] = (comisionCounts[c] || 0) + 1;
                }
            }
            for (const dipId of item.diputado_ids)
                allDipIdsSet.add(dipId);
        }
        const allDipIds = [...allDipIdsSet];
        // ── 3. Batch: presentantes + género + partido ─────────────────────────────
        const [presentanRaw, proponentesAllRaw, diputadosRaw, integrantesRaw, generosRaw] = yield Promise.all([
            iniIds.length > 0
                ? iniciativaspresenta_1.default.findAll({
                    where: { id_iniciativa: { [sequelize_1.Op.in]: iniIds } },
                    attributes: ["id_iniciativa", "id_tipo_presenta", "id_presenta"],
                    paranoid: false, raw: true
                })
                : Promise.resolve([]),
            proponentes_1.default.findAll({ attributes: ["id", "valor"], raw: true }),
            allDipIds.length > 0
                ? diputado_1.default.findAll({ where: { id: { [sequelize_1.Op.in]: allDipIds } }, attributes: ["id", "gender_id"], paranoid: false, raw: true })
                : Promise.resolve([]),
            allDipIds.length > 0
                ? integrante_legislaturas_1.default.findAll({ where: { diputado_id: { [sequelize_1.Op.in]: allDipIds } }, attributes: ["diputado_id", "partido_id"], paranoid: false, raw: true })
                : Promise.resolve([]),
            gender_1.default.findAll({ attributes: ["id", "genero"], paranoid: false, raw: true })
        ]);
        const proponentesMap = new Map(proponentesAllRaw.map((p) => [p.id, p.valor]));
        const generosMap = new Map(generosRaw.map((g) => [g.id, g.genero]));
        const dipGenderMap = new Map();
        for (const d of diputadosRaw) {
            dipGenderMap.set(d.id, d.gender_id ? ((_a = generosMap.get(d.gender_id)) !== null && _a !== void 0 ? _a : "") : "");
        }
        const dipPartidoIdMap = new Map();
        for (const i of integrantesRaw) {
            if (i.diputado_id && i.partido_id && !dipPartidoIdMap.has(i.diputado_id))
                dipPartidoIdMap.set(i.diputado_id, i.partido_id);
        }
        const allPartidoIds = new Set([...dipPartidoIdMap.values()]);
        const presentanPorIni = new Map();
        for (const p of presentanRaw) {
            if (!presentanPorIni.has(p.id_iniciativa))
                presentanPorIni.set(p.id_iniciativa, []);
            presentanPorIni.get(p.id_iniciativa).push(p);
            const tipo = proponentesMap.get(p.id_tipo_presenta);
            if (tipo === "Grupo Parlamentario" && p.id_presenta)
                allPartidoIds.add(p.id_presenta);
        }
        const partidosRaw = allPartidoIds.size > 0
            ? yield partidos_1.default.findAll({ where: { id: { [sequelize_1.Op.in]: [...allPartidoIds] } }, attributes: ["id", "nombre"], paranoid: false, raw: true })
            : [];
        const partidosMap = new Map(partidosRaw.map((p) => [p.id, p.nombre]));
        // ── 4. Aggregations: género + partido + grupoStack + proponente ───────────
        const porGeneroSets = { Mujeres: new Set(), Hombres: new Set(), "S/G": new Set(), Institucional: new Set() };
        const grupoIntegrantes = {};
        const grupoDirecto = {};
        const partidoMiembrosCounts = {};
        const proponenteCounts = {};
        for (const item of reporte) {
            const presentan = presentanPorIni.get(item.id) || [];
            const tiposEnIni = new Set();
            const dipIdsEnIni = new Set(item.diputado_ids);
            const partidosIntEnIni = new Set();
            const partidosDirEnIni = new Set();
            for (const p of presentan) {
                const tPres = proponentesMap.get(p.id_tipo_presenta);
                if (!tPres)
                    continue;
                if (!tiposEnIni.has(tPres)) {
                    tiposEnIni.add(tPres);
                    proponenteCounts[tPres] = (proponenteCounts[tPres] || 0) + 1;
                }
                if (tPres === "Grupo Parlamentario" && p.id_presenta) {
                    const nombre = partidosMap.get(p.id_presenta);
                    if (nombre)
                        partidosDirEnIni.add(nombre);
                }
            }
            if (dipIdsEnIni.size === 0) {
                porGeneroSets["Institucional"].add(item.id);
            }
            else {
                for (const dipId of dipIdsEnIni) {
                    const lc = ((_b = dipGenderMap.get(dipId)) !== null && _b !== void 0 ? _b : "").toLowerCase();
                    if (lc.includes("femen") || lc.includes("mujer"))
                        porGeneroSets["Mujeres"].add(item.id);
                    else if (lc.includes("mascul") || lc.includes("hombre"))
                        porGeneroSets["Hombres"].add(item.id);
                    else
                        porGeneroSets["S/G"].add(item.id);
                    const partidoId = dipPartidoIdMap.get(dipId);
                    if (partidoId) {
                        const n = partidosMap.get(partidoId);
                        if (n)
                            partidosIntEnIni.add(n);
                    }
                }
            }
            for (const n of partidosIntEnIni) {
                grupoIntegrantes[n] = (grupoIntegrantes[n] || 0) + 1;
                partidoMiembrosCounts[n] = (partidoMiembrosCounts[n] || 0) + 1;
            }
            for (const n of partidosDirEnIni) {
                grupoDirecto[n] = (grupoDirecto[n] || 0) + 1;
            }
        }
        const porGenero = Object.entries(porGeneroSets).filter(([, s]) => s.size > 0).map(([genero, s]) => ({ genero, total: s.size }));
        const porPartido = Object.entries(partidoMiembrosCounts).sort((a, b) => b[1] - a[1]).map(([nombre, total]) => ({ nombre, total }));
        const allGrupoNombres = new Set([...Object.keys(grupoIntegrantes), ...Object.keys(grupoDirecto)]);
        const porGrupoStack = [...allGrupoNombres]
            .map(nombre => ({ nombre, integrantes: grupoIntegrantes[nombre] || 0, directo: grupoDirecto[nombre] || 0, total: (grupoIntegrantes[nombre] || 0) + (grupoDirecto[nombre] || 0) }))
            .sort((a, b) => b.total - a.total).slice(0, 10);
        // ── 5. Votación (para aprobadas) ──────────────────────────────────────────
        // VotosPunto.id_punto es INTEGER y se crea con id_tema_punto_voto=null,
        // por eso se consulta directamente por id_punto (PuntosOrden.id INTEGER).
        // construirReporteBase ya resolvió el punto correcto:
        //   dispensa → PuntosOrden.id del punto original
        //   cierre   → PuntosOrden.id del punto destino (cierrePrincipal.iniciativa.id)
        const aprobadas = reporte.filter(r => r.observac === "Aprobada");
        let porVotacion = [];
        let porPorcentajeAprobacion = [];
        if (aprobadas.length > 0) {
            const puntoIds = [...new Set(aprobadas.map(r => r.votingPuntoIntId).filter((id) => id != null))];
            const votosRaw = puntoIds.length > 0
                ? yield votos_punto_1.default.findAll({
                    where: { id_punto: { [sequelize_1.Op.in]: puntoIds }, sentido: { [sequelize_1.Op.in]: [1, 2, 3] } },
                    attributes: ["id_punto", "sentido"],
                    paranoid: false,
                    raw: true
                })
                : [];
            const votosPorPunto = new Map();
            for (const voto of votosRaw) {
                const pid = Number(voto.id_punto);
                if (!votosPorPunto.has(pid))
                    votosPorPunto.set(pid, { favor: 0, contra: 0, abstencion: 0 });
                const e = votosPorPunto.get(pid);
                if (voto.sentido === 1)
                    e.favor++;
                else if (voto.sentido === 2)
                    e.abstencion++;
                else if (voto.sentido === 3)
                    e.contra++;
            }
            const votacionCats = { "Unanimidad (100%)": 0, "90% o más": 0, "80% o más": 0, "Mayoría (50%+1)": 0, "Sin datos de votación": 0 };
            const pctRangoCats = { "100%": 0, "90% – 99%": 0, "80% – 89%": 0, "70% – 79%": 0, "60% – 69%": 0, "50% – 59%": 0, "Sin datos": 0 };
            for (const r of aprobadas) {
                const votos = r.votingPuntoIntId != null ? votosPorPunto.get(r.votingPuntoIntId) : undefined;
                if (!votos) {
                    votacionCats["Sin datos de votación"]++;
                    pctRangoCats["Sin datos"]++;
                    continue;
                }
                const validos = votos.favor + votos.contra + votos.abstencion;
                if (validos === 0) {
                    votacionCats["Sin datos de votación"]++;
                    pctRangoCats["Sin datos"]++;
                    continue;
                }
                const pct = votos.favor / validos;
                if (pct >= 1)
                    votacionCats["Unanimidad (100%)"]++;
                else if (pct >= 0.9)
                    votacionCats["90% o más"]++;
                else if (pct >= 0.8)
                    votacionCats["80% o más"]++;
                else if (votos.favor > validos / 2)
                    votacionCats["Mayoría (50%+1)"]++;
                else
                    votacionCats["Sin datos de votación"]++;
                if (pct >= 1.0)
                    pctRangoCats["100%"]++;
                else if (pct >= 0.9)
                    pctRangoCats["90% – 99%"]++;
                else if (pct >= 0.8)
                    pctRangoCats["80% – 89%"]++;
                else if (pct >= 0.7)
                    pctRangoCats["70% – 79%"]++;
                else if (pct >= 0.6)
                    pctRangoCats["60% – 69%"]++;
                else if (votos.favor > validos / 2)
                    pctRangoCats["50% – 59%"]++;
                else
                    pctRangoCats["Sin datos"]++;
            }
            porVotacion = Object.entries(votacionCats).filter(([, v]) => v > 0).map(([tipo, total]) => ({ tipo, total }));
            porPorcentajeAprobacion = Object.entries(pctRangoCats).filter(([, v]) => v > 0).map(([rango, total]) => ({ rango, total }));
        }
        return res.status(200).json({
            total: reporte.length,
            porTipo: Object.entries(conteoTipo).map(([tipo, total]) => ({ tipo, total })),
            porEstatus: Object.entries(conteoEstatus).map(([estatus, total]) => ({ estatus, total })),
            porGenero,
            porGrupoStack,
            porMes: Object.entries(mesCounts).sort((a, b) => a[0].localeCompare(b[0])).map(([mes, total]) => ({ mes, total })),
            porProponente: Object.entries(proponenteCounts).sort((a, b) => b[1] - a[1]).map(([tipo, total]) => ({ tipo, total })),
            porComision: Object.entries(comisionCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([nombre, total]) => ({ nombre, total })),
            porPartido,
            porVotacion,
            porPorcentajeAprobacion
        });
    }
    catch (error) {
        console.error("Error al obtener estadísticas de iniciativas:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getEstadisticasIniciativas = getEstadisticasIniciativas;
const getExcelVotacionesDetalle = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const reporte = yield construirReporteBase();
        const aprobadas = reporte.filter(r => r.observac === "Aprobada");
        const puntoIds = [...new Set(aprobadas.map(r => r.votingPuntoIntId).filter((id) => id != null))];
        const votosRaw = puntoIds.length > 0
            ? yield votos_punto_1.default.findAll({
                where: { id_punto: { [sequelize_1.Op.in]: puntoIds }, sentido: { [sequelize_1.Op.in]: [1, 2, 3] } },
                attributes: ["id_punto", "sentido"],
                paranoid: false,
                raw: true
            })
            : [];
        const votosPorPunto = new Map();
        for (const voto of votosRaw) {
            const pid = Number(voto.id_punto);
            if (!votosPorPunto.has(pid))
                votosPorPunto.set(pid, { favor: 0, contra: 0, abstencion: 0 });
            const e = votosPorPunto.get(pid);
            if (voto.sentido === 1)
                e.favor++;
            else if (voto.sentido === 2)
                e.abstencion++;
            else if (voto.sentido === 3)
                e.contra++;
        }
        const ORDEN_RANGOS = ['100%', '90% – 99%', '80% – 89%', '70% – 79%', '60% – 69%', '50% – 59%', 'Sin datos de votación'];
        const calcularRango = (votos) => {
            if (!votos)
                return 'Sin datos de votación';
            const validos = votos.favor + votos.contra + votos.abstencion;
            if (validos === 0)
                return 'Sin datos de votación';
            const pct = votos.favor / validos;
            if (pct >= 1.0)
                return '100%';
            else if (pct >= 0.9)
                return '90% – 99%';
            else if (pct >= 0.8)
                return '80% – 89%';
            else if (pct >= 0.7)
                return '70% – 79%';
            else if (pct >= 0.6)
                return '60% – 69%';
            else if (votos.favor > validos / 2)
                return '50% – 59%';
            else
                return 'Sin datos de votación';
        };
        const filas = aprobadas
            .map(r => {
            var _a, _b, _c, _d;
            const votos = r.votingPuntoIntId != null ? votosPorPunto.get(r.votingPuntoIntId) : undefined;
            const validos = votos ? votos.favor + votos.contra + votos.abstencion : 0;
            const pctFavor = validos > 0 ? Math.round((votos.favor / validos) * 100) : null;
            return {
                no: r.no,
                materia: r.materia,
                iniciativa: r.iniciativa,
                autor: r.autor,
                tipo: (_a = r.tipo) !== null && _a !== void 0 ? _a : '-',
                presentac: r.presentac,
                expedicion: r.expedicion,
                favor: (_b = votos === null || votos === void 0 ? void 0 : votos.favor) !== null && _b !== void 0 ? _b : null,
                contra: (_c = votos === null || votos === void 0 ? void 0 : votos.contra) !== null && _c !== void 0 ? _c : null,
                abstencion: (_d = votos === null || votos === void 0 ? void 0 : votos.abstencion) !== null && _d !== void 0 ? _d : null,
                pctFavor,
                rango: calcularRango(votos),
                rangoOrden: ORDEN_RANGOS.indexOf(calcularRango(votos))
            };
        })
            .sort((a, b) => a.rangoOrden - b.rangoOrden);
        const ExcelJS = require("exceljs");
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet("Votaciones por Rango");
        ws.columns = [
            { header: "No.", key: "no", width: 6 },
            { header: "Punto", key: "materia", width: 60 },
            { header: "Iniciativa", key: "iniciativa", width: 60 },
            { header: "Autor", key: "autor", width: 30 },
            { header: "Tipo", key: "tipo", width: 20 },
            { header: "Presentación", key: "presentac", width: 14 },
            { header: "Aprobación", key: "expedicion", width: 14 },
            { header: "Rango % Favor", key: "rango", width: 20 },
            { header: "A Favor", key: "favor", width: 10 },
            { header: "En Contra", key: "contra", width: 10 },
            { header: "Abstenciones", key: "abstencion", width: 13 },
            { header: "% Favor", key: "pctFavor", width: 10 },
        ];
        const COLORES_RANGO = {
            '100%': 'FF10b981',
            '90% – 99%': 'FF34d399',
            '80% – 89%': 'FFfbbf24',
            '70% – 79%': 'FFf97316',
            '60% – 69%': 'FFef4444',
            '50% – 59%': 'FFdc2626',
            'Sin datos de votación': 'FF94a3b8'
        };
        const headerRow = ws.getRow(1);
        headerRow.height = 22;
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800048' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        for (const fila of filas) {
            const row = ws.addRow({
                no: fila.no,
                materia: fila.materia,
                iniciativa: fila.iniciativa,
                autor: fila.autor,
                tipo: fila.tipo,
                presentac: fila.presentac,
                expedicion: fila.expedicion,
                rango: fila.rango,
                favor: (_a = fila.favor) !== null && _a !== void 0 ? _a : '-',
                contra: (_b = fila.contra) !== null && _b !== void 0 ? _b : '-',
                abstencion: (_c = fila.abstencion) !== null && _c !== void 0 ? _c : '-',
                pctFavor: fila.pctFavor != null ? `${fila.pctFavor}%` : '-',
            });
            row.height = 28;
            const color = (_d = COLORES_RANGO[fila.rango]) !== null && _d !== void 0 ? _d : 'FF94a3b8';
            const rangoCell = row.getCell('rango');
            rangoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
            rangoCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            row.eachCell((cell) => {
                cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
        }
        ws.views = [{ state: 'frozen', ySplit: 1 }];
        yield enviarWorkbook(res, workbook, 'votaciones_por_rango.xlsx');
    }
    catch (error) {
        console.error("Error al generar Excel de votaciones:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});
exports.getExcelVotacionesDetalle = getExcelVotacionesDetalle;
