"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proponentes_1 = __importDefault(require("./proponentes"));
const ProponentesTipoCategoriaDetalle_1 = __importDefault(require("./ProponentesTipoCategoriaDetalle"));
const tipo_categoria_iniciativas_1 = __importDefault(require("./tipo_categoria_iniciativas"));
// Desde Proponentes al catálogo
proponentes_1.default.belongsToMany(tipo_categoria_iniciativas_1.default, {
    through: ProponentesTipoCategoriaDetalle_1.default,
    foreignKey: 'proponente_id',
    otherKey: 'tipo_categoria_id',
    as: 'categorias',
});
// Desde TipoCategoriaIniciativas a Proponentes
tipo_categoria_iniciativas_1.default.belongsToMany(proponentes_1.default, {
    through: ProponentesTipoCategoriaDetalle_1.default,
    foreignKey: 'tipo_categoria_id',
    otherKey: 'proponente_id',
    as: 'proponentesRelacionados',
});
// Desde el pivote al proponente
ProponentesTipoCategoriaDetalle_1.default.belongsTo(proponentes_1.default, {
    foreignKey: 'proponente_id',
    as: 'proponente',
});
// Desde el pivote al tipo de categoría
ProponentesTipoCategoriaDetalle_1.default.belongsTo(tipo_categoria_iniciativas_1.default, {
    foreignKey: 'tipo_categoria_id',
    as: 'tipoCategoria',
});
