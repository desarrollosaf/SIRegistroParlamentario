import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import type { Sesiones } from './sesiones';

export class RegimenSesions extends Model<InferAttributes<RegimenSesions>, InferCreationAttributes<RegimenSesions>> {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociación hasMany sesiones
  declare sesiones?: Sesiones[];
}

RegimenSesions.init(
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
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'regimen_sesions',
    timestamps: true,
    paranoid: true,
  }
);

export default RegimenSesions;
