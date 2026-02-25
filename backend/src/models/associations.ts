import Proponentes from './proponentes';
import ProponentesTipoCategoriaDetalle from './ProponentesTipoCategoriaDetalle';
import TipoCategoriaIniciativas from './tipo_categoria_iniciativas';
import PuntosOrden from "./puntos_ordens";
import IniciativaPuntoOrden from "./inciativas_puntos_ordens";
import IniciativaEstudio from './iniciativas_estudio';

// Desde Proponentes al catálogo
Proponentes.belongsToMany(TipoCategoriaIniciativas, {
  through: ProponentesTipoCategoriaDetalle,
  foreignKey: 'proponente_id',
  otherKey: 'tipo_categoria_id',
  as: 'categorias', 
});

// Desde TipoCategoriaIniciativas a Proponentes
TipoCategoriaIniciativas.belongsToMany(Proponentes, {
  through: ProponentesTipoCategoriaDetalle,
  foreignKey: 'tipo_categoria_id',
  otherKey: 'proponente_id',
  as: 'proponentesRelacionados', 
});

// Desde el pivote al proponente
ProponentesTipoCategoriaDetalle.belongsTo(Proponentes, {
  foreignKey: 'proponente_id',
  as: 'proponente', 
});

// Desde el pivote al tipo de categoría
ProponentesTipoCategoriaDetalle.belongsTo(TipoCategoriaIniciativas, {
  foreignKey: 'tipo_categoria_id',
  as: 'tipoCategoria', 
});

PuntosOrden.hasMany(IniciativaPuntoOrden, {
  foreignKey: "id_punto",
  as: "iniciativas",
});

IniciativaPuntoOrden.belongsTo(PuntosOrden, { 
  foreignKey: 'id_punto', 
  as: 'punto' 
});


PuntosOrden.hasMany(IniciativaEstudio, { foreignKey: 'punto_origen_id', as: 'estudio' });

IniciativaEstudio.belongsTo(PuntosOrden, { 
  foreignKey: 'punto_origen_id', 
  as: 'iniciativaorigen' 
});


IniciativaEstudio.belongsTo(PuntosOrden, { 
  foreignKey: 'punto_destino_id', 
  as: 'iniciativa' 
});

PuntosOrden.hasMany(IniciativaEstudio, {
  foreignKey: 'punto_destino_id', as: 'puntosestudiados'
});



export default {
  PuntosOrden,
  IniciativaPuntoOrden,
  IniciativaEstudio
};