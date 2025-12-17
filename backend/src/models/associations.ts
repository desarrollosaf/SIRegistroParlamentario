import Proponentes from './proponentes';
import ProponentesTipoCategoriaDetalle from './ProponentesTipoCategoriaDetalle';
import TipoCategoriaIniciativas from './tipo_categoria_iniciativas';

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
