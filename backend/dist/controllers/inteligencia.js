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
exports.getIntegrantesMorena = void 0;
const sequelize_1 = require("sequelize");
const partidos_1 = __importDefault(require("../models/partidos"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const diputado_1 = __importDefault(require("../models/diputado"));
require("../models/associations");
const getIntegrantesMorena = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const partido = yield partidos_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { siglas: { [sequelize_1.Op.like]: '%MORENA%' } },
                    { nombre: { [sequelize_1.Op.like]: '%Morena%' } },
                ],
            },
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: 'integrante_legislaturas',
                    include: [
                        {
                            model: diputado_1.default,
                            as: 'diputado',
                            attributes: ['id', 'apaterno', 'amaterno', 'nombres', 'alias', 'email', 'telefono', 'facebook', 'twitter', 'instagram'],
                        },
                    ],
                },
            ],
        });
        if (!partido) {
            return res.status(404).json({ msg: 'Grupo parlamentario de Morena no encontrado' });
        }
        return res.status(200).json({
            msg: 'Exito',
            data: (_a = partido.integrante_legislaturas) !== null && _a !== void 0 ? _a : [],
        });
    }
    catch (error) {
        console.error('Error obteniendo integrantes de Morena:', error);
        return res.status(500).json({
            msg: 'Ocurrió un error al obtener los integrantes',
            error: error.message,
        });
    }
});
exports.getIntegrantesMorena = getIntegrantesMorena;
