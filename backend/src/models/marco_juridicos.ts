import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class MarcoJuridico extends Model {
  declare id: CreationOptional<number>;
  declare path_marco: string;
  declare nombre_documento: string;
  declare id_evento: number;
  declare status: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MarcoJuridico.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    path_marco: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombre_documento: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_evento: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'marco_juridicos',
    timestamps: true,
  }
);

export default MarcoJuridico;
