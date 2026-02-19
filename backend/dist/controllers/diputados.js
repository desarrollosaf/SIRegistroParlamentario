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
exports.getifnini = exports.selectiniciativas = exports.crariniidits = exports.getiniciativas = exports.eliminariniciativa = exports.creariniciativa = exports.actvototodos = exports.actualizartodos = exports.cargoDiputados = void 0;
const agendas_1 = __importDefault(require("../models/agendas"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const sequelize_1 = require("sequelize");
const temas_puntos_votos_1 = __importDefault(require("../models/temas_puntos_votos"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../models/iniciativas_estudio"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const comisions_1 = __importDefault(require("../models/comisions"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const puntos_comisiones_1 = __importDefault(require("../models/puntos_comisiones"));
const cargoDiputados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('holi');
        const diputados = yield votos_punto_1.default.findAll({
            where: {
                id_comision_dip: {
                    [sequelize_1.Op.ne]: null
                }
            }
        });
        for (const dips of diputados) {
            const integrante = yield integrante_legislaturas_1.default.findOne({
                where: {
                    diputado_id: dips.id_diputado
                }
            });
            const comision = yield integrante_comisions_1.default.findOne({
                where: {
                    comision_id: dips.id_comision_dip,
                    integrante_legislatura_id: integrante === null || integrante === void 0 ? void 0 : integrante.id
                }
            });
            if (comision) {
                yield dips.update({ id_cargo_dip: comision.tipo_cargo_comision_id });
                console.log('entre comision');
            }
        }
        return res.status(200).json({
            msg: "Exito",
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
exports.cargoDiputados = cargoDiputados;
const actualizartodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.id) {
            return res.status(400).json({
                msg: "El campo 'id' es requerido",
                estatus: 400
            });
        }
        if (body.sentido === undefined || body.sentido === null) {
            return res.status(400).json({
                msg: "El campo 'sentido' es requerido",
                estatus: 400
            });
        }
        const voto = yield asistencia_votos_1.default.findAll({
            where: {
                id_agenda: body.id,
            },
        });
        if (!voto) {
            return res.status(404).json({
                msg: "No se encontró el registro de asistencia",
                estatus: 404
            });
        }
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
                return res.status(400).json({
                    msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (ASISTENCIA) o 2 (ASISTENCIA ZOOM)",
                    estatus: 400
                });
        }
        yield asistencia_votos_1.default.update({
            sentido_voto: nuevoSentido,
            mensaje: nuevoMensaje,
        }, {
            where: {
                id_agenda: body.id,
            },
        });
        return res.status(200).json({
            msg: "Actualizados correctamente",
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al actualizar toda la asistencia:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            estatus: 500,
            error: error.message
        });
    }
});
exports.actualizartodos = actualizartodos;
const actvototodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.idpunto || body.sentido === undefined) {
            return res.status(400).json({
                msg: "Faltan datos requeridos: idpunto y sentido",
            });
        }
        let whereCondition;
        if (body.idReserva) {
            const temavotos = yield temas_puntos_votos_1.default.findOne({
                where: { id: body.idReserva }
            });
            if (!temavotos) {
                return res.status(404).json({
                    msg: "No se encontró el tema de votación",
                });
            }
            whereCondition = { id_tema_punto_voto: temavotos.id };
        }
        else {
            const punto = yield puntos_ordens_1.default.findOne({
                where: { id: body.idpunto }
            });
            if (!punto) {
                return res.status(404).json({
                    msg: "No se encontró el punto",
                });
            }
            whereCondition = { id_punto: punto.id };
        }
        let nuevoSentido;
        let nuevoMensaje;
        switch (body.sentido) {
            case 0:
                nuevoSentido = 0;
                nuevoMensaje = "PENDIENTE";
                break;
            case 1:
                nuevoSentido = 1;
                nuevoMensaje = "A FAVOR";
                break;
            case 2:
                nuevoSentido = 2;
                nuevoMensaje = "ABSTENCIÓN";
                break;
            case 3:
                nuevoSentido = 3;
                nuevoMensaje = "EN CONTRA";
                break;
            default:
                return res.status(400).json({
                    msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (A FAVOR), 2 (ABSTENCIÓN) o 3 (EN CONTRA)",
                });
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: nuevoSentido,
            mensaje: nuevoMensaje,
        }, {
            where: whereCondition
        });
        if (cantidadActualizada === 0) {
            return res.status(404).json({
                msg: "No se encontraron votos para actualizar",
            });
        }
        return res.status(200).json({
            msg: "Voto(s) actualizado(s) correctamente",
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
exports.actvototodos = actvototodos;
const creariniciativa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: body.punto },
        });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const nuevoTema = yield inciativas_puntos_ordens_1.default.create({
            id_punto: punto.id,
            id_evento: punto.id_evento,
            iniciativa: body.iniciativa,
            fecha_votacion: null,
            status: 1,
        });
        return res.status(200).json({
            message: "Iniciativa creada exitosamente",
        });
    }
    catch (error) {
        console.error("Error al crear la iniciativa:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.creariniciativa = creariniciativa;
const eliminariniciativa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
            where: { id }
        });
        if (!iniciativa) {
            return res.status(404).json({ message: "Iniciativa no encontrada" });
        }
        // await VotosPunto.destroy({
        //   where: { id_tema_punto_voto: id }
        // });
        yield iniciativa.destroy();
        return res.status(200).json({
            message: "Iniciativa eliminada correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar la iniciativa:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.eliminariniciativa = eliminariniciativa;
const getiniciativas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const iniciativa = yield inciativas_puntos_ordens_1.default.findAll({
            where: { id_punto: id },
            attributes: ["id", "iniciativa"]
        });
        if (!iniciativa) {
            return res.status(404).json({ message: "No tiene iniciativas" });
        }
        return res.status(200).json({
            data: iniciativa,
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
const crariniidits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: body.punto },
        });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
            where: { id: body.iniciativa },
        });
        if (iniciativa) {
            yield iniciativa.update({ id_punto: punto.id });
        }
        return res.status(200).json({
            message: "Iniciativa actualizada correctamente",
        });
    }
    catch (error) {
        console.error("Error al actualizar la iniciativa:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.crariniidits = crariniidits;
const selectiniciativas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iniciativa = yield inciativas_puntos_ordens_1.default.findAll({
            where: {
                id: {
                    [sequelize_1.Op.in]: ['1072', '792']
                }
            },
            attributes: ["id", "iniciativa"]
        });
        return res.status(200).json({
            data: iniciativa,
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
exports.selectiniciativas = selectiniciativas;
const formatearFecha = (fecha) => {
    if (!fecha)
        return '';
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const date = new Date(fecha);
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const anio = date.getUTCFullYear();
    return `${dia} de ${mes} de ${anio}`;
};
const getAnfitriones = (eventoId, tipoEventoNombre) => __awaiter(void 0, void 0, void 0, function* () {
    if (!eventoId || tipoEventoNombre === 'Sesión')
        return {};
    const anfitriones = yield anfitrion_agendas_1.default.findAll({
        where: { agenda_id: eventoId },
        attributes: ["autor_id"],
        raw: true
    });
    const comisionIds = anfitriones.map((a) => a.autor_id).filter(Boolean);
    if (comisionIds.length === 0)
        return { comisiones: null };
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIds },
        attributes: ['nombre'],
        raw: true,
    });
    return {
        comisiones: comisiones.map((c) => c.nombre).join(', ')
    };
});
const getComisionesTurnado = (puntoId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!puntoId)
        return { turnado: false, comisiones_turnado: null };
    const puntosComisiones = yield puntos_comisiones_1.default.findAll({
        where: { id_punto: puntoId },
        attributes: ["id_comision"],
        raw: true
    });
    if (puntosComisiones.length === 0)
        return { turnado: false, comisiones_turnado: null };
    const idsRaw = puntosComisiones[0].id_comision || '';
    const comisionIds = idsRaw
        .replace(/[\[\]]/g, '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    if (comisionIds.length === 0)
        return { turnado: false, comisiones_turnado: null };
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIds },
        attributes: ['nombre'],
        raw: true,
    });
    return {
        turnado: true,
        comisiones_turnado: comisiones.map((c) => c.nombre).join(', ')
    };
});
const getifnini = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
            where: { id: id },
            attributes: ["id", "iniciativa", "createdAt"],
            include: [
                {
                    model: puntos_ordens_1.default,
                    as: 'punto',
                    attributes: ["id", "punto", "nopunto"],
                },
                {
                    model: agendas_1.default,
                    as: 'evento',
                    attributes: ["id", "fecha", "descripcion", "liga"],
                    include: [
                        {
                            model: tipo_eventos_1.default,
                            as: 'tipoevento',
                            attributes: ["nombre"]
                        }
                    ]
                },
                {
                    model: iniciativas_estudio_1.default,
                    as: 'estudio',
                    attributes: ["id", "status", "createdAt", "id_punto_evento"],
                    required: false,
                    include: [
                        {
                            model: puntos_ordens_1.default,
                            as: 'puntoEvento',
                            attributes: ["id", "punto", "nopunto"],
                            include: [
                                {
                                    model: agendas_1.default,
                                    as: 'evento',
                                    attributes: ["id", "fecha", "descripcion", "liga"],
                                    include: [
                                        {
                                            model: tipo_eventos_1.default,
                                            as: 'tipoevento',
                                            attributes: ["nombre"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        const trazaIniciativas = yield Promise.all(iniciativas.map((iniciativa) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const data = iniciativa.toJSON();
            const estudios = ((_a = data.estudio) === null || _a === void 0 ? void 0 : _a.filter((e) => e.status === "1")) || [];
            const dictamenes = ((_b = data.estudio) === null || _b === void 0 ? void 0 : _b.filter((e) => e.status === "2")) || [];
            const cierres = ((_c = data.estudio) === null || _c === void 0 ? void 0 : _c.filter((e) => e.status === "3")) || [];
            // Anfitriones y turnado del nació
            const anfitrionesNacio = yield getAnfitriones((_d = data.evento) === null || _d === void 0 ? void 0 : _d.id, (_f = (_e = data.evento) === null || _e === void 0 ? void 0 : _e.tipoevento) === null || _f === void 0 ? void 0 : _f.nombre);
            const turnadoInfo = yield getComisionesTurnado((_g = data.punto) === null || _g === void 0 ? void 0 : _g.id);
            // Estudios con info de evento y anfitriones
            const estudiosConInfo = yield Promise.all(estudios.map((e) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const eventoEstudio = (_a = e.puntoEvento) === null || _a === void 0 ? void 0 : _a.evento;
                const anfitriones = yield getAnfitriones(eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.id, (_b = eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre);
                return Object.assign({ id: e.id, evento: eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.id, fecha: formatearFecha(e.createdAt), tipo_evento: (_c = eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre, fecha_evento: formatearFecha(eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.fecha), liga: eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.liga, descripcion_evento: eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.descripcion, numpunto: (_d = e.puntoEvento) === null || _d === void 0 ? void 0 : _d.nopunto, punto: (_e = e.puntoEvento) === null || _e === void 0 ? void 0 : _e.punto }, anfitriones);
            })));
            // Dictámenes con info de evento y anfitriones
            const dictamenesConInfo = yield Promise.all(dictamenes.map((d) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const eventoDict = (_a = d.puntoEvento) === null || _a === void 0 ? void 0 : _a.evento;
                const anfitriones = yield getAnfitriones(eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.id, (_b = eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre);
                return Object.assign({ id: d.id, evento: eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.id, fecha: formatearFecha(d.createdAt), tipo_evento: (_c = eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre, fecha_evento: formatearFecha(eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.fecha), liga: eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.liga, votacionid: (_d = d.puntoEvento) === null || _d === void 0 ? void 0 : _d.id, descripcion_evento: eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.descripcion, numpunto: (_e = d.puntoEvento) === null || _e === void 0 ? void 0 : _e.nopunto, punto: (_f = d.puntoEvento) === null || _f === void 0 ? void 0 : _f.punto }, anfitriones);
            })));
            const cierresConInfo = yield Promise.all(cierres.map((c) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const eventoCierre = (_a = c.puntoEvento) === null || _a === void 0 ? void 0 : _a.evento;
                return {
                    evento: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.id,
                    tipo_evento: (_b = eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre,
                    fecha: formatearFecha(eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.fecha),
                    descripcion_evento: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.descripcion,
                    liga: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.liga,
                    numpunto: (_c = c.puntoEvento) === null || _c === void 0 ? void 0 : _c.nopunto,
                    punto: (_d = c.puntoEvento) === null || _d === void 0 ? void 0 : _d.punto,
                };
            })));
            return {
                nacio: Object.assign(Object.assign({ evento: (_h = data.evento) === null || _h === void 0 ? void 0 : _h.id, tipo_evento: (_k = (_j = data.evento) === null || _j === void 0 ? void 0 : _j.tipoevento) === null || _k === void 0 ? void 0 : _k.nombre, fecha: formatearFecha((_l = data.evento) === null || _l === void 0 ? void 0 : _l.fecha), descripcion_evento: (_m = data.evento) === null || _m === void 0 ? void 0 : _m.descripcion, numpunto: (_o = data.punto) === null || _o === void 0 ? void 0 : _o.nopunto, punto: (_p = data.punto) === null || _p === void 0 ? void 0 : _p.punto, liga: (_q = data.evento) === null || _q === void 0 ? void 0 : _q.liga }, turnadoInfo), anfitrionesNacio),
                estudio: estudiosConInfo,
                dictamen: dictamenesConInfo,
                cierre: cierresConInfo.length > 0 ? cierresConInfo[0] : null
            };
        })));
        return res.status(200).json({
            data: trazaIniciativas
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
exports.getifnini = getifnini;
