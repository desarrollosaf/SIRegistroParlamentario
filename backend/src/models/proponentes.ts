import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class Proponentes extends Model<InferAttributes<Proponentes>, InferCreationAttributes<Proponentes>> {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Proponentes.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'proponentes',
    timestamps: true,
  }
);

export default Proponentes;
