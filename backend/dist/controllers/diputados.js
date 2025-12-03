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
exports.cargoDiputados = void 0;
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const sequelize_1 = require("sequelize");
const cargoDiputados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('holi');
        const diputados = yield asistencia_votos_1.default.findAll({
            where: {
                comision_dip_id: {
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
                    comision_id: dips.comision_dip_id,
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
