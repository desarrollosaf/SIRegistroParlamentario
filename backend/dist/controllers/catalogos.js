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
exports.saveProponentes = exports.saveCategoriaInicitavias = exports.saveTitularProponente = exports.deleteCategoriaProponente = exports.saveCategoriaProponente = exports.getCatalogo = exports.getCatalogos = void 0;
const proponentes_1 = __importDefault(require("../models/proponentes"));
const ProponentesTipoCategoriaDetalle_1 = __importDefault(require("../models/ProponentesTipoCategoriaDetalle"));
const tipo_categoria_iniciativas_1 = __importDefault(require("../models/tipo_categoria_iniciativas"));
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const sequelize_1 = require("sequelize");
require("../models/associations");
const getCatalogos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proponentes = yield proponentes_1.default.findAll();
        console.log('propo', proponentes);
        return res.status(200).json({
            msg: "Exito",
            data: proponentes
        });
    }
    catch (error) {
        console.error("Error obteniendo catalogos:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener los catalogos",
            error: error.message
        });
    }
});
exports.getCatalogos = getCatalogos;
const getCatalogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const proponenteId = Number(id);
        const proponenteConCategorias = yield proponentes_1.default.findOne({
            where: { id: proponenteId },
            include: [{
                    model: tipo_categoria_iniciativas_1.default,
                    as: 'categorias',
                    through: { attributes: [] }
                }]
        });
        let dtSlctTemp = [];
        if ((proponenteConCategorias === null || proponenteConCategorias === void 0 ? void 0 : proponenteConCategorias.valor) === 'Gobernadora o Gobernador del Estado') {
            const gobernadora = yield cat_fun_dep_1.default.findAll({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Gobernadora o Gobernador del Estado%' },
                    vigente: 1
                },
            });
            dtSlctTemp = gobernadora.map(gobernadora => ({
                id: `${proponenteConCategorias.id}/${gobernadora.id}`,
                id_original: gobernadora.id,
                valor: gobernadora.nombre_titular,
                proponente_id: proponenteConCategorias.id,
                proponente_valor: proponenteConCategorias.valor,
                tipo: gobernadora.nombre_dependencia
            }));
        }
        else if ((proponenteConCategorias === null || proponenteConCategorias === void 0 ? void 0 : proponenteConCategorias.valor) === 'Tribunal Superior de Justicia') {
            const tribunal = yield cat_fun_dep_1.default.findAll({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
                    vigente: 1
                },
            });
            dtSlctTemp = tribunal.map(data => ({
                id: `${proponenteConCategorias.id}/${data.id}`,
                id_original: data.id,
                valor: data.nombre_titular,
                proponente_id: proponenteConCategorias.id,
                proponente_valor: proponenteConCategorias.valor,
                tipo: data.nombre_dependencia
            }));
        }
        else if ((proponenteConCategorias === null || proponenteConCategorias === void 0 ? void 0 : proponenteConCategorias.valor) === 'Ciudadanas y ciudadanos del Estado' ||
            (proponenteConCategorias === null || proponenteConCategorias === void 0 ? void 0 : proponenteConCategorias.valor) === 'Fiscalía General de Justicia del Estado de México') {
            const fiscalia = yield cat_fun_dep_1.default.findAll({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
                    vigente: 1
                },
            });
            dtSlctTemp = fiscalia.map(data => ({
                id: `${proponenteConCategorias.id}/${data.id}`,
                id_original: data.id,
                valor: data.nombre_titular,
                proponente_id: proponenteConCategorias.id,
                proponente_valor: proponenteConCategorias.valor,
                tipo: data.nombre_dependencia
            }));
        }
        console.log('proponente', proponenteConCategorias);
        const categoriasInciativas = yield tipo_categoria_iniciativas_1.default.findAll();
        console.log('categoriasIniciativas: ', categoriasInciativas);
        return res.status(200).json({
            msg: "Exito",
            data: proponenteConCategorias,
            tiposProponentes: dtSlctTemp,
            categoriasInciativas: categoriasInciativas
        });
    }
    catch (error) {
        console.error("Error obteniendo catalogos:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener los catalogos",
            error: error.message
        });
    }
});
exports.getCatalogo = getCatalogo;
const saveCategoriaProponente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        console.log(body);
        const saveDatos = yield ProponentesTipoCategoriaDetalle_1.default.create({
            proponente_id: body.proponete,
            tipo_categoria_id: body.categoria
        });
        const proponentactualizado = yield proponentes_1.default.findOne({
            where: { id: body.proponete },
            include: [{
                    model: tipo_categoria_iniciativas_1.default,
                    as: 'categorias',
                    through: { attributes: [] }
                }]
        });
        return res.status(200).json({
            msg: `sucess`,
            data: proponentactualizado,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al guardar categoria proponente:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.saveCategoriaProponente = saveCategoriaProponente;
const deleteCategoriaProponente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        console.log(body);
        const deleteeDatos = yield ProponentesTipoCategoriaDetalle_1.default.destroy({
            where: {
                proponente_id: body.proponete,
                tipo_categoria_id: body.categoria
            }
        });
        const proponentactualizado = yield proponentes_1.default.findOne({
            where: { id: body.proponete },
            include: [{
                    model: tipo_categoria_iniciativas_1.default,
                    as: 'categorias',
                    through: { attributes: [] }
                }]
        });
        return res.status(200).json({
            msg: `sucess`,
            data: proponentactualizado,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al eliminar categoria:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.deleteCategoriaProponente = deleteCategoriaProponente;
const saveTitularProponente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        console.log(body);
        const proponente = yield proponentes_1.default.findOne({
            where: { id: body.proponenteId },
        });
        let dtSlctTemp = [];
        if ((proponente === null || proponente === void 0 ? void 0 : proponente.valor) === 'Gobernadora o Gobernador del Estado') {
            const saveCatFun = yield cat_fun_dep_1.default.create({
                nombre_dependencia: 'Gobernadora o Gobernador del Estado',
                nombre_titular: body.nombre,
                vigente: true,
                fecha_inicio: body.fecha_inicio,
                fecha_fin: body.fecha_fin,
                tipo: proponente.id
            });
            const gobernadora = yield cat_fun_dep_1.default.findAll({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Gobernadora o Gobernador del Estado%' },
                    vigente: 1
                },
            });
            dtSlctTemp = gobernadora.map(gobernadora => ({
                id: `${proponente.id}/${gobernadora.id}`,
                id_original: gobernadora.id,
                valor: gobernadora.nombre_titular,
                proponente_id: proponente.id,
                proponente_valor: proponente.valor,
                tipo: gobernadora.nombre_dependencia
            }));
        }
        else if ((proponente === null || proponente === void 0 ? void 0 : proponente.valor) === 'Tribunal Superior de Justicia') {
            const saveCatFun = yield cat_fun_dep_1.default.create({
                nombre_dependencia: 'Tribunal Superior de Justicia del Estado de México',
                nombre_titular: body.nombre,
                vigente: true,
                fecha_inicio: body.fecha_inicio,
                fecha_fin: body.fecha_fin,
                tipo: proponente.id
            });
            const tribunal = yield cat_fun_dep_1.default.findAll({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
                    vigente: 1
                },
            });
            dtSlctTemp = tribunal.map(data => ({
                id: `${proponente.id}/${data.id}`,
                id_original: data.id,
                valor: data.nombre_titular,
                proponente_id: proponente.id,
                proponente_valor: proponente.valor,
                tipo: data.nombre_dependencia
            }));
        }
        else if ((proponente === null || proponente === void 0 ? void 0 : proponente.valor) === 'Ciudadanas y ciudadanos del Estado' ||
            (proponente === null || proponente === void 0 ? void 0 : proponente.valor) === 'Fiscalía General de Justicia del Estado de México') {
            const saveCatFun = yield cat_fun_dep_1.default.create({
                nombre_dependencia: proponente === null || proponente === void 0 ? void 0 : proponente.valor,
                nombre_titular: body.nombre,
                vigente: true,
                fecha_inicio: body.fecha_inicio,
                fecha_fin: body.fecha_fin,
                tipo: proponente.id
            });
            const fiscalia = yield cat_fun_dep_1.default.findAll({
                where: {
                    nombre_dependencia: { [sequelize_1.Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
                    vigente: 1
                },
            });
            dtSlctTemp = fiscalia.map(data => ({
                id: `${proponente.id}/${data.id}`,
                id_original: data.id,
                valor: data.nombre_titular,
                proponente_id: proponente.id,
                proponente_valor: proponente.valor,
                tipo: data.nombre_dependencia
            }));
        }
        return res.status(200).json({
            msg: `sucess`,
            data: dtSlctTemp,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al guardar titular:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.saveTitularProponente = saveTitularProponente;
const saveCategoriaInicitavias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        console.log(body);
        const saveDatos = yield tipo_categoria_iniciativas_1.default.create({
            valor: body.valor,
        });
        return res.status(200).json({
            msg: `sucess`,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al guardar categoria proponente:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.saveCategoriaInicitavias = saveCategoriaInicitavias;
const saveProponentes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        console.log(body);
        const saveDatos = yield proponentes_1.default.create({
            valor: body.valor,
        });
        return res.status(200).json({
            msg: `sucess`,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al guardar categoria proponente:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.saveProponentes = saveProponentes;
