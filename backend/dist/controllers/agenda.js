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
exports.enviarWhatsPunto = exports.updateAgenda = exports.getAgenda = exports.saveagenda = exports.catalogossave = exports.reiniciarvoto = exports.actualizarvoto = exports.getvotacionpunto = exports.eliminarinter = exports.getintervenciones = exports.saveintervencion = exports.eliminarpunto = exports.actualizarPunto = exports.getpuntos = exports.guardarpunto = exports.getTiposPuntos = exports.catalogos = exports.actualizar = exports.getevento = exports.geteventos = void 0;
const agendas_1 = __importDefault(require("../models/agendas"));
const sedes_1 = __importDefault(require("../models/sedes"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const diputado_1 = __importDefault(require("../models/diputado"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const partidos_1 = __importDefault(require("../models/partidos"));
const proponentes_1 = __importDefault(require("../models/proponentes"));
const comisions_1 = __importDefault(require("../models/comisions"));
const tipo_comisions_1 = __importDefault(require("../models/tipo_comisions"));
const sequelize_1 = require("sequelize");
const admin_cats_1 = __importDefault(require("../models/admin_cats"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const tipo_intervencions_1 = __importDefault(require("../models/tipo_intervencions"));
const intervenciones_1 = __importDefault(require("../models/intervenciones"));
const temas_puntos_votos_1 = __importDefault(require("../models/temas_puntos_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const sequelize_2 = require("sequelize");
const tipo_autors_1 = __importDefault(require("../models/tipo_autors"));
const otros_autores_1 = __importDefault(require("../models/otros_autores"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const secretarias_1 = require("../models/secretarias");
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const puntos_presenta_1 = __importDefault(require("../models/puntos_presenta"));
const axios_1 = __importDefault(require("axios"));
const locale_1 = require("date-fns/locale");
const date_fns_1 = require("date-fns");
const geteventos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
                    attributes: ["id", "nombre"]
                }
            ],
        });
        return res.status(200).json({
            msg: "listoooo :v ",
            citas: eventos
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
const getevento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
        let titulo = "";
        if (((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión") {
            titulo = (_b = evento.descripcion) !== null && _b !== void 0 ? _b : "";
        }
        else {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
            if (comisionIds.length === 0) {
                titulo = "";
            }
            else {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["nombre"],
                    raw: true
                });
                titulo = comisiones.map(c => c.nombre).join(", ");
            }
        }
        const asistenciasExistentes = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            raw: true,
        });
        if (asistenciasExistentes.length > 0) {
            const asistenciasExistentes2 = Object.values(asistenciasExistentes.reduce((acc, curr) => {
                if (!acc[curr.id_diputado])
                    acc[curr.id_diputado] = curr;
                return acc;
            }, {}));
            const resultados = yield Promise.all(asistenciasExistentes2.map((inte) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c;
                const diputado = yield diputado_1.default.findOne({
                    where: { id: inte.id_diputado },
                    attributes: ["apaterno", "amaterno", "nombres"],
                    raw: true,
                });
                const partido = yield partidos_1.default.findOne({
                    where: { id: inte.partido_dip },
                    attributes: ["siglas"],
                    raw: true,
                });
                const nombreCompletoDiputado = diputado
                    ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                    : null;
                return Object.assign(Object.assign({}, inte), { diputado: nombreCompletoDiputado, partido: partido ? partido.siglas : null });
            })));
            return res.status(200).json({
                msg: "Evento con asistencias existentes",
                evento,
                integrantes: resultados,
                titulo
            });
        }
        const listadoDiputados = [];
        let bandera = 1;
        if (((_c = evento.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre) === "Sesión") {
            const legislatura = yield legislaturas_1.default.findOne({
                order: [["fecha_inicio", "DESC"]],
            });
            if (legislatura) {
                const diputados = yield integrante_legislaturas_1.default.findAll({
                    where: { legislatura_id: legislatura.id },
                    include: [{ model: diputado_1.default, as: "diputado" }],
                });
                for (const inteLegis of diputados) {
                    if (inteLegis.diputado) {
                        listadoDiputados.push({
                            id_diputado: inteLegis.diputado.id,
                            id_partido: inteLegis.partido_id,
                            comision_dip_id: null,
                            bandera,
                        });
                    }
                }
            }
        }
        else {
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
                for (const comId of comisionIds) {
                    const deEstaComision = integrantes.filter((i) => { var _a; return i.comision_id === comId && ((_a = i.integranteLegislatura) === null || _a === void 0 ? void 0 : _a.diputado); });
                    for (const inte of deEstaComision) {
                        listadoDiputados.push({
                            id_diputado: inte.integranteLegislatura.diputado.id,
                            id_partido: inte.integranteLegislatura.partido_id,
                            comision_dip_id: inte.comision_id,
                            bandera,
                        });
                    }
                    bandera++;
                }
            }
        }
        const mensaje = "PENDIENTE";
        const timestamp = new Date();
        const asistencias = listadoDiputados.map((diputado) => ({
            sentido_voto: 0,
            mensaje,
            timestamp,
            id_diputado: diputado.id_diputado,
            partido_dip: diputado.id_partido,
            comision_dip_id: diputado.comision_dip_id,
            id_agenda: evento.id,
        }));
        yield asistencia_votos_1.default.bulkCreate(asistencias);
        const asistenciasRaw = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            order: [['created_at', 'DESC']],
            raw: true,
        });
        const nuevasAsistencias = Object.values(asistenciasRaw.reduce((acc, curr) => {
            if (!acc[curr.id_diputado])
                acc[curr.id_diputado] = curr;
            return acc;
        }, {}));
        const resultados = yield Promise.all(nuevasAsistencias.map((inte) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const diputado = yield diputado_1.default.findOne({
                where: { id: inte.id_diputado },
                attributes: ["apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const partido = yield partidos_1.default.findOne({
                where: { id: inte.partido_dip },
                attributes: ["siglas"],
                raw: true,
            });
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return Object.assign(Object.assign({}, inte), { diputado: nombreCompletoDiputado, partido: partido ? partido.siglas : null });
        })));
        return res.status(200).json({
            msg: "Evento generado correctamente",
            evento,
            integrantes: resultados,
            titulo
        });
    }
    catch (error) {
        console.error("Error obteniendo evento:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener el evento",
            error: error.message,
        });
    }
});
exports.getevento = getevento;
const actualizar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const votos = yield asistencia_votos_1.default.findAll({
            where: {
                id_agenda: body.idagenda,
                id_diputado: body.iddiputado,
            },
        });
        if (votos && votos.length > 0) {
            let nuevoSentido;
            let nuevoMensaje;
            switch (body.sentido) {
                case 1:
                    nuevoSentido = 1;
                    nuevoMensaje = "ASISTENCIA";
                    break;
                case 2:
                    nuevoSentido = 2;
                    nuevoMensaje = "ASISTENCIA ZOOM";
                    break;
                case 0:
                    nuevoSentido = 0;
                    nuevoMensaje = "PENDIENTE";
                    break;
                default:
                    break;
            }
            yield asistencia_votos_1.default.update({
                sentido_voto: nuevoSentido,
                mensaje: nuevoMensaje,
            }, {
                where: {
                    id_agenda: body.idagenda,
                    id_diputado: body.iddiputado,
                }
            });
            return res.status(200).json({
                msg: `${votos.length} registro(s) actualizado(s) correctamente`,
                estatus: 200
            });
        }
        else {
            return res.status(404).json({
                msg: "No se encontró el registro de asistencia para este diputado y agenda",
            });
        }
    }
    catch (error) {
        console.error('Error al generar consulta:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
});
exports.actualizar = actualizar;
const catalogos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proponentes = yield proponentes_1.default.findAll({
            attributes: ['id', 'valor'],
            raw: true,
        });
        const comisiones = yield comisions_1.default.findAll({
            attributes: ['id', 'nombre'],
            raw: true,
        });
        const legislatura = yield legislaturas_1.default.findOne({
            order: [["fecha_inicio", "DESC"]],
        });
        let diputadosArray = [];
        if (legislatura) {
            const diputados = yield integrante_legislaturas_1.default.findAll({
                where: { legislatura_id: legislatura.id },
                include: [
                    {
                        model: diputado_1.default,
                        as: "diputado",
                        attributes: ["id", "nombres", "apaterno", "amaterno"],
                    },
                ],
            });
            diputadosArray = diputados
                .filter(d => d.diputado)
                .map(d => {
                var _a, _b, _c;
                return ({
                    id: d.diputado.id,
                    nombre: `${(_a = d.diputado.nombres) !== null && _a !== void 0 ? _a : ""} ${(_b = d.diputado.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = d.diputado.amaterno) !== null && _c !== void 0 ? _c : ""}`.trim(),
                });
            });
        }
        const tipointer = yield tipo_intervencions_1.default.findAll({
            attributes: ['id', 'valor'],
            raw: true,
        });
        return res.json({
            proponentes: proponentes,
            comisiones: comisiones,
            diputados: diputadosArray,
            tipointer: tipointer
        });
    }
    catch (error) {
        console.error('Error al generar consulta:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
});
exports.catalogos = catalogos;
const getTiposPuntos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const proponente = yield proponentes_1.default.findByPk(id);
        if (!proponente) {
            return res.status(404).json({ message: 'Proponente no encontrado' });
        }
        const arr = { proponente };
        let tiposRelacionados = yield proponente.getTipos({ attributes: ['id', 'valor'], joinTableAttributes: [] });
        arr.tipos = tiposRelacionados;
        if (proponente.valor === 'Diputadas y Diputados') {
            const legis = yield legislaturas_1.default.findOne({
                order: [["fecha_inicio", "DESC"]],
            });
            if (legis) {
                const dips = yield integrante_legislaturas_1.default.findAll({
                    where: { legislatura_id: legis.id },
                    include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                });
                const dipss = dips
                    .filter((d) => d.diputado)
                    .map((item) => {
                    var _a, _b, _c;
                    return ({
                        id: item.diputado.id,
                        valor: `${(_a = item.diputado.apaterno) !== null && _a !== void 0 ? _a : ''} ${(_b = item.diputado.amaterno) !== null && _b !== void 0 ? _b : ''} ${(_c = item.diputado.nombres) !== null && _c !== void 0 ? _c : ''}`.trim(),
                    });
                });
                arr.dtSlct = dipss;
            }
        }
        else if (proponente.valor === 'Mesa Directiva en turno') {
            const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Mesa Directiva' } });
            if (idMesa) {
                const mesa = yield comisions_1.default.findOne({
                    where: { tipo_comision_id: idMesa.id },
                    order: [['created_at', 'DESC']],
                });
                if (mesa)
                    arr.dtSlct = { id: mesa.id, valor: mesa.nombre };
            }
        }
        else if (proponente.valor === 'Junta de Coordinación Politica') {
            const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Comisiones Legislativas' } });
            if (idMesa) {
                const mesa = yield comisions_1.default.findOne({
                    where: {
                        tipo_comision_id: idMesa.id,
                        nombre: { [sequelize_1.Op.like]: '%jucopo%' },
                    },
                    order: [['created_at', 'DESC']],
                });
                if (mesa)
                    arr.dtSlct = { id: mesa.id, valor: mesa.nombre };
            }
        }
        else if (proponente.valor === 'Secretarías del GEM') {
            const secretgem = yield secretarias_1.Secretarias.findAll();
            arr.dtSlct = secretgem.map(s => ({
                id: s.id,
                valor: `${s.nombre} / ${s.titular}`
            }));
        }
        else if (proponente.valor === 'Gobernadora o Gobernador del Estado') {
            const gobernadora = yield cat_fun_dep_1.default.findOne({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Gobernadora o Gobernador del Estado%' },
                    vigente: 1
                },
            });
            if (gobernadora)
                arr.dtSlct = { id: gobernadora.id, valor: gobernadora.nombre_titular };
        }
        else if (proponente.valor === 'Ayuntamientos') {
            const municipios = yield municipiosag_1.default.findAll();
            arr.dtSlct = municipios.map(l => ({
                id: l.id,
                valor: l.nombre
            }));
        }
        else if (proponente.valor === 'Comición de Derechos Humanos del Estado de México') {
            const derechoshumanos = yield comisions_1.default.findOne({
                where: {
                    nombre: { [sequelize_1.Op.like]: '%Derechos Humanos%' },
                },
                order: [['created_at', 'DESC']],
            });
            if (derechoshumanos)
                arr.dtSlct = { id: derechoshumanos.id, valor: derechoshumanos.nombre };
        }
        else if (proponente.valor === 'Tribunal Superior de Justicia') {
            const tribunal = yield cat_fun_dep_1.default.findOne({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
                    vigente: 1
                },
            });
            if (tribunal)
                arr.dtSlct = { id: tribunal.id, valor: tribunal.nombre_titular };
        }
        else if (proponente.valor === 'Ciudadanas y ciudadanos del Estado' ||
            proponente.valor === 'Fiscalía General de Justicia del Estado de México') {
            const fiscalia = yield cat_fun_dep_1.default.findOne({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
                    vigente: 1
                },
            });
            if (fiscalia)
                arr.dtSlct = { id: fiscalia.id, valor: fiscalia.nombre_titular };
        }
        else if (proponente.valor === 'Comisiones Legislativas') {
            const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Comisiones Legislativas' } });
            if (idMesa) {
                const comi = yield comisions_1.default.findAll({ where: { tipo_comision_id: idMesa.id } });
                const comisiones = comi.map((item) => ({ id: item.id, valor: item.nombre }));
                arr.dtSlct = comisiones;
            }
        }
        else if (proponente.valor === 'Comisión instaladora') {
            // no acciones extra aparte de tipos
        }
        else if (proponente.valor === 'Municipios') {
            const municipios = yield municipiosag_1.default.findAll();
            arr.dtSlct = municipios.map(l => ({
                id: l.id,
                valor: l.nombre
            }));
        }
        else if (proponente.valor === 'Diputación Permanente') {
            const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Diputación Permanente' } });
            if (idMesa) {
                const mesa = yield comisions_1.default.findOne({
                    where: { tipo_comision_id: idMesa.id },
                    order: [['created_at', 'DESC']],
                });
                if (mesa)
                    arr.dtSlct = { id: mesa.id, valor: mesa.nombre };
            }
        }
        else if (proponente.valor === 'Cámara de Diputados del H. Congreso de la Unión' ||
            proponente.valor === 'Cámara de Senadores del H. Congreso de la Unión') {
            // no actions extra
        }
        else if (proponente.valor === 'Grupo Parlamentario') {
            const partidos = yield partidos_1.default.findAll();
            arr.dtSlct = partidos.map(l => ({
                id: l.id,
                valor: l.siglas
            }));
        }
        else if (proponente.valor === 'Legislatura') {
            const legislaturas = yield legislaturas_1.default.findAll();
            arr.dtSlct = legislaturas.map(l => ({
                id: l.id,
                valor: l.numero
            }));
        }
        const combo = yield admin_cats_1.default.findAll({ where: { id_presenta: proponente.id } });
        arr.combo = combo;
        arr.tipoCombo = proponente;
        return res.json(arr);
    }
    catch (error) {
        console.error('Error en getTiposPuntos:', error);
        return res.status(500).json({ message: 'Error al obtener tipos de puntos', error: error.message });
    }
});
exports.getTiposPuntos = getTiposPuntos;
const guardarpunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { body } = req;
        const file = req.file;
        const presenta = (body.presenta || "")
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
        const evento = yield agendas_1.default.findOne({ where: { id } });
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        const puntonuevo = yield puntos_ordens_1.default.create({
            id_evento: evento.id,
            nopunto: body.numpunto,
            id_proponente: body.proponente,
            id_tipo: body.tipo,
            tribuna: body.tribuna,
            path_doc: file ? `storage/puntos/${file.filename}` : null,
            punto: body.punto,
            observaciones: body.observaciones,
        });
        for (const autorId of presenta) {
            yield puntos_presenta_1.default.create({
                id_punto: puntonuevo.id,
                id_tipo_presenta: body.proponente,
                id_presenta: autorId
            });
        }
        return res.status(201).json({
            message: "Punto creado correctamente",
            data: puntonuevo,
        });
    }
    catch (error) {
        console.error("Error al guardar el punto:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.guardarpunto = guardarpunto;
const getpuntos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const puntos = yield puntos_ordens_1.default.findAll({
            where: { id_evento: id },
            order: [['nopunto', 'DESC']],
            include: [
                {
                    model: puntos_presenta_1.default,
                    as: "presentan",
                    attributes: ["id", "id_presenta"],
                },
            ],
        });
        if (!puntos) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        return res.status(201).json({
            message: "Se encontraron registros",
            data: puntos,
        });
    }
    catch (error) {
        console.error("Error al guardar el punto:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getpuntos = getpuntos;
const actualizarPunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { id } = req.params;
        const { body } = req;
        const file = req.file;
        const presenta = (body.presenta || "")
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
        const punto = yield puntos_ordens_1.default.findOne({ where: { id } });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const nuevoPath = file ? `storage/puntos/${file.filename}` : punto.path_doc;
        yield punto.update({
            nopunto: (_a = body.numpunto) !== null && _a !== void 0 ? _a : punto.nopunto,
            id_proponente: (_b = body.proponente) !== null && _b !== void 0 ? _b : punto.id_proponente,
            id_tipo: (_c = body.tipo) !== null && _c !== void 0 ? _c : punto.id_tipo,
            tribuna: (_d = body.tribuna) !== null && _d !== void 0 ? _d : punto.tribuna,
            path_doc: nuevoPath,
            punto: (_e = body.punto) !== null && _e !== void 0 ? _e : punto.punto,
            observaciones: (_f = body.observaciones) !== null && _f !== void 0 ? _f : punto.observaciones,
            editado: 1,
        });
        yield puntos_presenta_1.default.destroy({
            where: { id_punto: punto.id }
        });
        for (const autorId of presenta) {
            yield puntos_presenta_1.default.create({
                id_punto: punto.id,
                id_tipo_presenta: body.proponente,
                id_presenta: autorId
            });
        }
        return res.status(200).json({
            message: "Punto actualizado correctamente",
            data: punto,
        });
    }
    catch (error) {
        console.error("Error al actualizar el punto:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.actualizarPunto = actualizarPunto;
const eliminarpunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const punto = yield puntos_ordens_1.default.findOne({ where: { id } });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        yield punto.destroy();
        return res.status(200).json({
            message: "Punto eliminado correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar el punto:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.eliminarpunto = eliminarpunto;
const saveintervencion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const registros = body.id_diputado.map((diputadoId) => ({
            id_punto: body.id_punto,
            id_evento: body.id_evento,
            id_diputado: diputadoId,
            id_tipo_intervencion: body.id_tipo_intervencion,
            mensaje: body.comentario,
            tipo: body.tipo,
            destacado: body.destacada,
        }));
        const nuevasIntervenciones = yield intervenciones_1.default.bulkCreate(registros, {
            returning: true,
        });
        if (body.destacada == 1) {
            for (const intervencion of nuevasIntervenciones) {
                yield enviarWhatsIntervencion(intervencion);
            }
        }
        return res.status(200).json({
            message: "Intervenciones guardadas correctamente",
        });
    }
    catch (error) {
        console.error("Error al guardar intervenciones:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.saveintervencion = saveintervencion;
const getintervenciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const intervenci = yield intervenciones_1.default.findAll({
            where: {
                id_evento: body.idagenda,
                tipo: body.tipo,
                id_punto: body.idpunto,
            },
            include: [
                {
                    model: tipo_intervencions_1.default,
                    as: "tipointerven",
                    attributes: ["id", "valor"],
                },
            ],
        });
        const resultados = yield Promise.all(intervenci.map((inte) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const diputado = yield diputado_1.default.findOne({
                where: { id: inte.id_diputado },
                attributes: ["apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return {
                id: inte.id,
                id_evento: inte.id_evento,
                id_punto: inte.id_punto,
                mensaje: inte.mensaje,
                tipo: inte.tipo,
                destacado: inte.destacado,
                tipointerven: inte.tipointerven,
                diputado: nombreCompletoDiputado,
            };
        })));
        return res.status(200).json({
            data: resultados,
        });
    }
    catch (error) {
        console.error("Error al traer el evento:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getintervenciones = getintervenciones;
const eliminarinter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const inter = yield intervenciones_1.default.findOne({ where: { id } });
        if (!inter) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        yield inter.destroy();
        return res.status(200).json({
            message: "Intervencion eliminada correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar la intervencion:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.eliminarinter = eliminarinter;
const getvotacionpunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const punto = yield puntos_ordens_1.default.findOne({ where: { id } });
        if (!punto) {
            return res.status(404).json({ msg: "Punto no encontrado" });
        }
        const evento = yield agendas_1.default.findOne({
            where: { id: punto.id_evento },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        let temavotos = yield temas_puntos_votos_1.default.findOne({ where: { id_punto: id } });
        let mensajeRespuesta = "Punto con votos existentes";
        if (!temavotos) {
            const listadoDiputados = yield obtenerListadoDiputados(evento);
            temavotos = yield temas_puntos_votos_1.default.create({
                id_punto: punto.id,
                id_evento: punto.id_evento,
                tema_votacion: null,
                fecha_votacion: sequelize_2.Sequelize.literal('CURRENT_TIMESTAMP'),
            });
            const votospunto = listadoDiputados.map((dip) => ({
                sentido: 0,
                mensaje: "PENDIENTE",
                id_tema_punto_voto: temavotos.id,
                id_diputado: dip.id_diputado,
                id_partido: dip.id_partido,
                id_comision_dip: dip.comision_dip_id,
            }));
            yield votos_punto_1.default.bulkCreate(votospunto);
            mensajeRespuesta = "Votacion creada correctamente";
        }
        const integrantes = yield obtenerResultadosVotacionOptimizado(temavotos.id);
        return res.status(200).json({
            msg: mensajeRespuesta,
            evento,
            integrantes,
        });
    }
    catch (error) {
        console.error("Error al traer los votos:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getvotacionpunto = getvotacionpunto;
function obtenerListadoDiputados(evento) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const listadoDiputados = [];
        if (((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión") {
            const legislatura = yield legislaturas_1.default.findOne({
                order: [["fecha_inicio", "DESC"]],
            });
            if (legislatura) {
                const diputados = yield integrante_legislaturas_1.default.findAll({
                    where: { legislatura_id: legislatura.id },
                    include: [{ model: diputado_1.default, as: "diputado" }],
                });
                for (const inteLegis of diputados) {
                    if (inteLegis.diputado) {
                        listadoDiputados.push({
                            id_diputado: inteLegis.diputado.id,
                            id_partido: inteLegis.partido_id,
                            comision_dip_id: null,
                        });
                    }
                }
            }
        }
        else {
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
                    if ((_b = inte.integranteLegislatura) === null || _b === void 0 ? void 0 : _b.diputado) {
                        listadoDiputados.push({
                            id_diputado: inte.integranteLegislatura.diputado.id,
                            id_partido: inte.integranteLegislatura.partido_id,
                            comision_dip_id: inte.comision_id,
                        });
                    }
                }
            }
        }
        return listadoDiputados;
    });
}
function obtenerResultadosVotacionOptimizado(idTemaPuntoVoto) {
    return __awaiter(this, void 0, void 0, function* () {
        const votosRaw = yield votos_punto_1.default.findAll({
            where: { id_tema_punto_voto: idTemaPuntoVoto },
            raw: true,
        });
        const votosUnicos = Object.values(votosRaw.reduce((acc, curr) => {
            if (!curr.id_diputado)
                return acc;
            acc[curr.id_diputado] = curr;
            return acc;
        }, {}));
        if (votosUnicos.length === 0) {
            return [];
        }
        const diputadoIds = votosUnicos.map(v => v.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = votosUnicos.map(v => v.id_partido).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        return votosUnicos.map((voto) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(voto.id_diputado);
            const partido = partidosMap.get(voto.id_partido);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return Object.assign(Object.assign({}, voto), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null });
        });
    });
}
const actualizarvoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.idpunto || !body.iddiputado || body.sentido === undefined) {
            return res.status(400).json({
                msg: "Faltan datos requeridos: idpunto, iddiputado y sentido",
            });
        }
        const temavotos = yield temas_puntos_votos_1.default.findOne({
            where: { id_punto: body.idpunto }
        });
        if (!temavotos) {
            return res.status(404).json({
                msg: "No se encontró el tema de votación para este punto",
            });
        }
        let nuevoSentido;
        let nuevoMensaje;
        switch (body.sentido) {
            case 1:
                nuevoSentido = 1;
                nuevoMensaje = "A FAVOR";
                break;
            case 2:
                nuevoSentido = 2;
                nuevoMensaje = "ABSTENCIÓN";
                break;
            case 0:
            case 3:
                nuevoSentido = 3;
                nuevoMensaje = "EN CONTRA";
                break;
            default:
                return res.status(400).json({
                    msg: "Sentido de voto inválido. Usa 1 (A FAVOR), 2 (ABSTENCIÓN) o 0/3 (EN CONTRA)",
                });
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: nuevoSentido,
            mensaje: nuevoMensaje,
        }, {
            where: {
                id_tema_punto_voto: temavotos.id,
                id_diputado: body.iddiputado,
            }
        });
        if (cantidadActualizada === 0) {
            return res.status(404).json({
                msg: "No se encontró el voto del diputado para este punto",
            });
        }
        return res.status(200).json({
            msg: "Voto actualizado correctamente",
            estatus: 200,
            registrosActualizados: cantidadActualizada,
        });
    }
    catch (error) {
        console.error('Error al actualizar el voto:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.actualizarvoto = actualizarvoto;
const reiniciarvoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.idpunto) {
            return res.status(400).json({
                msg: "Falta el parámetro requerido: idpunto",
            });
        }
        const temavotos = yield temas_puntos_votos_1.default.findOne({
            where: { id_punto: body.idpunto }
        });
        if (!temavotos) {
            return res.status(404).json({
                msg: "No se encontró el tema de votación para este punto",
            });
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: 0,
            mensaje: "PENDIENTE",
        }, {
            where: {
                id_tema_punto_voto: temavotos.id,
            }
        });
        if (cantidadActualizada === 0) {
            return res.status(404).json({
                msg: "No se encontraron votos para reiniciar",
            });
        }
        return res.status(200).json({
            msg: `${cantidadActualizada} voto(s) reiniciado(s) correctamente a PENDIENTE`,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al reiniciar las votaciones:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.reiniciarvoto = reiniciarvoto;
const catalogossave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sedes = yield sedes_1.default.findAll({
            attributes: ['id', ['sede', 'name']]
        });
        const comisiones = yield comisions_1.default.findAll({
            attributes: ['id', ['nombre', 'name']]
        });
        const municipios = yield municipiosag_1.default.findAll({
            attributes: ['id', ['nombre', 'name']],
        });
        const partidos = yield partidos_1.default.findAll({
            attributes: ['id', ['nombre', 'name']]
        });
        const tipoAutores = yield tipo_autors_1.default.findAll({
            attributes: ['id', ['valor', 'name']]
        });
        const otros = yield otros_autores_1.default.findAll({
            attributes: ['id', ['valor', 'name']]
        });
        const legislatura = yield legislaturas_1.default.findAll({
            attributes: ['id', ['numero', 'name']]
        });
        const tipoevento = yield tipo_eventos_1.default.findAll({
            attributes: ['id', ['nombre', 'name']]
        });
        const idComites = yield tipo_comisions_1.default.findOne({
            where: { valor: 'Comités' }
        });
        let comites = {};
        if (idComites) {
            const com = yield comisions_1.default.findAll({
                where: { tipo_comision_id: idComites.id },
                attributes: ['id', ['nombre', 'name']]
            });
            comites = Object.fromEntries(com.map(item => [item.id, item.nombre]));
        }
        const idPermanente = yield tipo_comisions_1.default.findOne({
            where: { valor: 'Diputación Permanente' }
        });
        let permanente = {};
        if (idPermanente) {
            const dips = yield comisions_1.default.findAll({
                where: { tipo_comision_id: idPermanente.id },
                attributes: ['id', ['nombre', 'name']]
            });
            permanente = Object.fromEntries(dips.map(item => [item.id, item.nombre]));
        }
        const legisla = yield legislaturas_1.default.findOne({
            order: [["fecha_inicio", "DESC"]],
        });
        let diputadosArray = [];
        if (legisla) {
            const diputados = yield integrante_legislaturas_1.default.findAll({
                where: { legislatura_id: legisla.id },
                include: [
                    {
                        model: diputado_1.default,
                        as: "diputado",
                        attributes: ["id", "nombres", "apaterno", "amaterno"],
                    },
                ],
            });
            diputadosArray = diputados
                .filter(d => d.diputado)
                .map(d => {
                var _a, _b, _c;
                return ({
                    id: d.diputado.id,
                    nombre: `${(_a = d.diputado.nombres) !== null && _a !== void 0 ? _a : ""} ${(_b = d.diputado.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = d.diputado.amaterno) !== null && _c !== void 0 ? _c : ""}`.trim(),
                });
            });
        }
        return res.json({
            sedes,
            comisiones,
            municipios,
            partidos,
            tipoAutores,
            otros,
            legislatura,
            tipoevento,
            comites,
            permanente,
            diputadosArray
        });
    }
    catch (error) {
        console.error("Error al obtener catálogos de agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.catalogossave = catalogossave;
const saveagenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agendaBody = req.body;
        const anfitriones = req.body.autores || [];
        const agenda = yield agendas_1.default.create({
            descripcion: agendaBody.descripcion,
            fecha: agendaBody.fecha,
            sede_id: agendaBody.sede_id,
            tipo_evento_id: agendaBody.tipo_evento_id,
            transmision: agendaBody.transmite,
            liga: agendaBody.liga || null,
            fecha_hora_inicio: agendaBody.hora_inicio || null,
            fecha_hora_fin: agendaBody.hora_fin || null,
        });
        for (const item of anfitriones) {
            const tipoAutorRecord = yield tipo_autors_1.default.findOne({
                where: { valor: item.tipo }
            });
            const tipoAutorId = tipoAutorRecord === null || tipoAutorRecord === void 0 ? void 0 : tipoAutorRecord.id;
            if (!tipoAutorId)
                continue;
            if (Array.isArray(item.autor_id)) {
                for (const autor of item.autor_id) {
                    yield anfitrion_agendas_1.default.create({
                        agenda_id: agenda.id,
                        tipo_autor_id: tipoAutorId,
                        autor_id: autor.autor_id
                    });
                }
            }
            else if (typeof item.autor_id === "string") {
                yield anfitrion_agendas_1.default.create({
                    agenda_id: agenda.id,
                    tipo_autor_id: tipoAutorId,
                    autor_id: item.autor_id
                });
            }
        }
        return res.json({ response: "success", id: agenda.id });
    }
    catch (error) {
        console.error("Error al guardar la agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.saveagenda = saveagenda;
const getAgenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const agenda = yield agendas_1.default.findByPk(id, {
            include: [
                {
                    model: anfitrion_agendas_1.default,
                    as: "anfitrion_agendas"
                }
            ]
        });
        if (!agenda) {
            return res.status(404).json({ msg: "Agenda no encontrada" });
        }
        return res.json(agenda);
    }
    catch (error) {
        console.error("Error al obtener la agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.getAgenda = getAgenda;
const updateAgenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agendaId = req.params.id;
        const body = req.body;
        const anfitriones = req.body.autores || [];
        const agenda = yield agendas_1.default.findByPk(agendaId);
        if (!agenda) {
            return res.status(404).json({ msg: "Agenda no encontrada" });
        }
        yield agenda.update({
            descripcion: body.descripcion,
            fecha: body.fecha,
            sede_id: body.sede_id,
            tipo_evento_id: body.tipo_evento_id,
            transmision: body.transmite,
            liga: body.liga || null,
            fecha_hora_inicio: body.hora_inicio || null,
            fecha_hora_fin: body.hora_fin || null,
        });
        yield anfitrion_agendas_1.default.destroy({
            where: { agenda_id: agendaId }
        });
        for (const item of anfitriones) {
            const tipoAutorRecord = yield tipo_autors_1.default.findOne({
                where: { valor: item.tipo }
            });
            const tipoAutorId = tipoAutorRecord === null || tipoAutorRecord === void 0 ? void 0 : tipoAutorRecord.id;
            if (!tipoAutorId)
                continue;
            if (Array.isArray(item.autor_id)) {
                for (const autor of item.autor_id) {
                    yield anfitrion_agendas_1.default.create({
                        agenda_id: agendaId,
                        tipo_autor_id: tipoAutorId,
                        autor_id: autor.autor_id
                    });
                }
            }
            else if (typeof item.autor_id === "string") {
                yield anfitrion_agendas_1.default.create({
                    agenda_id: agendaId,
                    tipo_autor_id: tipoAutorId,
                    autor_id: item.autor_id
                });
            }
        }
        return res.json({ response: "success", id: agendaId });
    }
    catch (error) {
        console.error("Error al actualizar la agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.updateAgenda = updateAgenda;
const enviarWhatsIntervencion = (intervencion) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const datos = yield intervenciones_1.default.findOne({
            where: { id: intervencion.id },
            attributes: ['id', 'id_diputado', 'mensaje', 'id_punto', 'id_evento'],
            include: [
                {
                    model: puntos_ordens_1.default,
                    as: "punto",
                    attributes: ["nopunto", "punto"],
                    required: false
                },
                {
                    model: agendas_1.default,
                    as: "evento",
                    attributes: ["descripcion", "fecha"],
                    required: false
                }
            ],
            raw: false
        });
        if (!datos)
            return;
        const diputado = yield diputado_1.default.findOne({
            where: { id: datos.id_diputado },
            attributes: ["apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const nombreCompleto = diputado
            ? [diputado.apaterno, diputado.amaterno, diputado.nombres]
                .filter(Boolean)
                .join(" ")
            : "Diputado";
        let titulo = "Intervención destacada";
        if (datos.punto) {
            titulo = `del punto ${datos.punto.nopunto}.- ${datos.punto.punto}`;
        }
        else if (datos.evento) {
            const fechaFormateada = (0, date_fns_1.format)(new Date(datos.evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
            titulo = `de la ${datos.evento.descripcion} (${fechaFormateada})`;
        }
        yield axios_1.default.post("https://api.ultramsg.com/instance144598/messages/chat", new URLSearchParams({
            token: "ml56a7d6tn7ha7cc",
            to: "+527222035605, +527224986377",
            body: `*Intervención destacada ${titulo}*\n*${nombreCompleto}*: ${datos.mensaje}\n`,
            priority: "1",
            referenceId: "",
            msgId: "",
            mentions: ""
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 5000
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error("Timeout enviando WhatsApp");
        }
        else {
            console.error("Error enviando WhatsApp:", error);
        }
    }
});
const enviarWhatsPunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const datos = yield puntos_ordens_1.default.findOne({
            where: { id },
            include: [
                {
                    model: puntos_presenta_1.default,
                    as: "presentan",
                    required: false
                },
                {
                    model: agendas_1.default,
                    as: "evento",
                    attributes: ["descripcion", "fecha"],
                    required: false
                }
            ],
            raw: false
        });
        if (!datos) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const nopunto = (_b = (_a = datos.nopunto) !== null && _a !== void 0 ? _a : datos.nopunto) !== null && _b !== void 0 ? _b : "";
        const puntoTexto = (_d = (_c = datos.punto) !== null && _c !== void 0 ? _c : datos.punto) !== null && _d !== void 0 ? _d : "";
        const tituloPunto = `${nopunto}.- ${puntoTexto}`;
        const descripcion = (_f = (_e = datos.evento) === null || _e === void 0 ? void 0 : _e.descripcion) !== null && _f !== void 0 ? _f : "Sin descripción";
        let fechaFormateada = "";
        if ((_g = datos.evento) === null || _g === void 0 ? void 0 : _g.fecha) {
            fechaFormateada = (0, date_fns_1.format)(new Date(datos.evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
        }
        const mensaje = `*Punto número ${nopunto}:*\n${puntoTexto}\n\n*Descripción del evento:* ${descripcion}\n*Fecha:* ${fechaFormateada}`;
        const params = {
            token: "ml56a7d6tn7ha7cc",
            to: "+527222035605",
            body: mensaje,
            priority: "1",
            referenceId: "",
            msgId: "",
            mentions: ""
        };
        yield axios_1.default.post("https://api.ultramsg.com/instance144598/messages/chat", new URLSearchParams(params), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        return res.status(200).json({
            message: "WhatsApp enviado correctamente",
            enviado: true
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error("Timeout enviando WhatsApp");
        }
        else {
            console.error("Error enviando WhatsApp:", error);
        }
        return res.status(500).json({ message: "Error enviando WhatsApp" });
    }
});
exports.enviarWhatsPunto = enviarWhatsPunto;
