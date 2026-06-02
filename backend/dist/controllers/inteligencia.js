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
exports.getIntegrantesVerde = exports.getIntegrantesMorena = void 0;
const partidos_1 = __importDefault(require("../models/partidos"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const diputado_1 = __importDefault(require("../models/diputado"));
require("../models/associations");
const COORDINADOR_MORENA = { apaterno: 'Vázquez', amaterno: 'Rodríguez', nombres: 'José Francisco' };
const COORDINADOR_VERDE = { apaterno: 'Couttolenc', amaterno: 'Buentello', nombres: 'José Alberto' };
function mapIntegrantes(lista, coordinador) {
    return lista.map((i) => {
        const d = i.diputado;
        const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
        const esCoordinador = (d === null || d === void 0 ? void 0 : d.apaterno) === coordinador.apaterno &&
            (d === null || d === void 0 ? void 0 : d.amaterno) === coordinador.amaterno &&
            (d === null || d === void 0 ? void 0 : d.nombres) === coordinador.nombres;
        return { id: i.id, nombre, coordinador: esCoordinador };
    });
}
const getIntegrantesMorena = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const partido = yield partidos_1.default.findOne({
            where: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480' },
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: 'integrante_legislaturas',
                    where: { fecha_fin: null },
                    include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                },
            ],
        });
        if (!partido) {
            return res.status(404).json({ msg: 'Grupo parlamentario de Morena no encontrado' });
        }
        const integrantes = mapIntegrantes((_a = partido.integrante_legislaturas) !== null && _a !== void 0 ? _a : [], COORDINADOR_MORENA);
        return res.status(200).json({ msg: 'Exito', total: integrantes.length, integrantes });
    }
    catch (error) {
        console.error('Error obteniendo integrantes de Morena:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: error.message });
    }
});
exports.getIntegrantesMorena = getIntegrantesMorena;
const getIntegrantesVerde = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const partido = yield partidos_1.default.findOne({
            where: { id: '1342c104-d5ec-4eda-b5ca-7d653b440a5e' },
            include: [
                {
                    model: integrante_legislaturas_1.default,
                    as: 'integrante_legislaturas',
                    where: { fecha_fin: null },
                    include: [{ model: diputado_1.default, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
                },
            ],
        });
        if (!partido) {
            return res.status(404).json({ msg: 'Grupo parlamentario del Partido Verde no encontrado' });
        }
        const integrantes = mapIntegrantes((_a = partido.integrante_legislaturas) !== null && _a !== void 0 ? _a : [], COORDINADOR_VERDE);
        return res.status(200).json({ msg: 'Exito', total: integrantes.length, integrantes });
    }
    catch (error) {
        console.error('Error obteniendo integrantes del Verde:', error);
        return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: error.message });
    }
});
exports.getIntegrantesVerde = getIntegrantesVerde;
