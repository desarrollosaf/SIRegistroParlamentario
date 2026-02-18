"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proponentes_1 = __importDefault(require("./proponentes"));
const ProponentesTipoCategoriaDetalle_1 = __importDefault(require("./ProponentesTipoCategoriaDetalle"));
const tipo_categoria_iniciativas_1 = __importDefault(require("./tipo_categoria_iniciativas"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("./inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("./iniciativas_estudio"));
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
puntos_ordens_1.default.hasMany(inciativas_puntos_ordens_1.default, {
    foreignKey: "id_punto",
    as: "iniciativas",
});
inciativas_puntos_ordens_1.default.belongsTo(puntos_ordens_1.default, {
    foreignKey: 'id_punto',
    as: 'punto'
});
inciativas_puntos_ordens_1.default.hasMany(iniciativas_estudio_1.default, { foreignKey: 'id_iniciativa', as: 'estudio' });
iniciativas_estudio_1.default.belongsTo(inciativas_puntos_ordens_1.default, {
    foreignKey: 'id_iniciativa',
    as: 'iniciativa'
});
exports.default = {
    PuntosOrden: puntos_ordens_1.default,
    IniciativaPuntoOrden: inciativas_puntos_ordens_1.default,
    IniciativaEstudio: iniciativas_estudio_1.default
};
