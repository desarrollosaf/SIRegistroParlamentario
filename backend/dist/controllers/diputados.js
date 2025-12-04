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
exports.actualizartodos = exports.cargoDiputados = void 0;
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const sequelize_1 = require("sequelize");
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
