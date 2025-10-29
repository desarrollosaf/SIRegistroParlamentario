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
exports.geteventos = void 0;
const agendas_1 = __importDefault(require("../models/agendas"));
const sedes_1 = __importDefault(require("../models/sedes"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
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
