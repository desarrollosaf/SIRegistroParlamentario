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
exports.eliminarpunto = exports.actualizarPunto = exports.getpuntos = exports.guardarpunto = exports.getTiposPuntos = exports.catalogos = exports.actualizar = exports.getevento = exports.geteventos = void 0;
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
            });
        }
        const listadoDiputados = [];
        let bandera = 1;
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
        return res.json({
            proponentes: proponentes,
            comisiones: comisiones,
            diputados: diputadosArray
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
                        diputado: `${(_a = item.diputado.apaterno) !== null && _a !== void 0 ? _a : ''} ${(_b = item.diputado.amaterno) !== null && _b !== void 0 ? _b : ''} ${(_c = item.diputado.nombres) !== null && _c !== void 0 ? _c : ''}`.trim(),
                    });
                });
                arr.diputados = dipss;
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
                    arr.mesa = { id: mesa.id, valor: mesa.nombre };
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
                    arr.mesa = { id: mesa.id, valor: mesa.nombre };
            }
        }
        else if (proponente.valor === 'Secretarías del GEM') {
        }
        else if (proponente.valor === 'Gobernadora o Gobernador del Estado') {
            // no acciones extra aparte de tipos
        }
        else if (proponente.valor === 'Tribunal Superior de Justicia' ||
            proponente.valor === 'Ayuntamientos' ||
            proponente.valor === 'Ciudadanas y ciudadanos del Estado' ||
            proponente.valor === 'Comición de Derechos Humanos del Estado de México' ||
            proponente.valor === 'Fiscalía General de Justicia del Estado de México') {
            // no acciones extra aparte de tipos
        }
        else if (proponente.valor === 'Comisiones Legislativas') {
            const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Comisiones Legislativas' } });
            if (idMesa) {
                const comi = yield comisions_1.default.findAll({ where: { tipo_comision_id: idMesa.id } });
                const comisiones = comi.map((item) => ({ id: item.id, comision: item.nombre }));
                arr.comisiones = comisiones;
            }
        }
        else if (proponente.valor === 'Comisión instaladora') {
            // no acciones extra aparte de tipos
        }
        else if (proponente.valor === 'Municipios') {
            // no actions extra
        }
        else if (proponente.valor === 'Diputación Permanente') {
            const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Diputación Permanente' } });
            if (idMesa) {
                const mesa = yield comisions_1.default.findOne({
                    where: { tipo_comision_id: idMesa.id },
                    order: [['created_at', 'DESC']],
                });
                if (mesa)
                    arr.mesa = { id: mesa.id, valor: mesa.nombre };
            }
        }
        else if (proponente.valor === 'Cámara de Diputados del H. Congreso de la Unión' ||
            proponente.valor === 'Cámara de Senadores del H. Congreso de la Unión') {
            // no actions extra
        }
        else if (proponente.valor === 'Grupo Parlamentario') {
            const partidos = yield partidos_1.default.findAll();
            arr.partidos = partidos;
            //  console.log(arr.partidos)
            // return(500)
        }
        else if (proponente.valor === 'Legislatura') {
            const legislaturas = yield legislaturas_1.default.findAll();
            arr.legislaturas = legislaturas;
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
        console.log(file);
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
            order: [['nopunto', 'DESC']]
        });
        if (!puntos) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        const tipointer = yield tipo_intervencions_1.default.findAll({
            attributes: ['id', 'valor'],
            raw: true,
        });
        return res.status(201).json({
            message: "Se encontraron registros",
            data: puntos,
            tipointervencion: tipointer,
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
