import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Proponentes from './proponentes';
import TipoCategoriaIniciativas from './tipo_categoria_iniciativas';

class ProponentesTipoCategoriaDetalle extends Model<
  InferAttributes<ProponentesTipoCategoriaDetalle>,
  InferCreationAttributes<ProponentesTipoCategoriaDetalle>
> {
  declare id: CreationOptional<number>;
  declare proponente_id: ForeignKey<number>;
  declare tipo_categoria_id: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProponentesTipoCategoriaDetalle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    proponente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo_categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
   createdAt: {
      type: DataTypes.DATE,
      field: 'created_at', 
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at', 
    },
  },
  {
    sequelize,
    tableName: 'proponentes_tipo_categoria_detalle',
    timestamps: true,
  }
);

// TipoCategoriaIniciativas.belongsToMany(Proponentes, {
//   through: ProponentesTipoCategoriaDetalle,
//   foreignKey: 'tipo_categoria_id',
//   otherKey: 'proponente_id',
//   as: 'proponentes',
// });

// TipoCategoriaIniciativas.belongsToMany(Proponentes, {
//   through: ProponentesTipoCategoriaDetalle,
//   foreignKey: 'tipo_categoria_id',
//   otherKey: 'proponente_id',
//   as: 'proponentes',
// });



export default ProponentesTipoCategoriaDetalle;
