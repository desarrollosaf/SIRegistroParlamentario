import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import TipoCategoriaIniciativas from './tipo_categoria_iniciativas';
import ProponentesTipoCategoriaDetalle from './ProponentesTipoCategoriaDetalle';

class Proponentes extends Model<InferAttributes<Proponentes>, InferCreationAttributes<Proponentes>> {
  declare id: CreationOptional<string>;
  declare valor: string;
  declare tipo: CreationOptional<Boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  public getTipos!: (options?: any) => Promise<TipoCategoriaIniciativas[]>;
}

Proponentes.init(
  {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'proponentes',
    timestamps: true,
  }
);

Proponentes.belongsToMany(TipoCategoriaIniciativas, {
  through: ProponentesTipoCategoriaDetalle,
  as: "tipos",
  foreignKey: "proponente_id",
});

TipoCategoriaIniciativas.belongsToMany(Proponentes, {
  through: ProponentesTipoCategoriaDetalle,
  as: "proponentes",
  foreignKey: "tipo_categoria_id",
});

export default Proponentes;
