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
exports.crariniidits = exports.getiniciativas = exports.eliminariniciativa = exports.creariniciativa = exports.actvototodos = exports.actualizartodos = exports.cargoDiputados = void 0;
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const sequelize_1 = require("sequelize");
const temas_puntos_votos_1 = __importDefault(require("../models/temas_puntos_votos"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
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
        console.log(id);
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
