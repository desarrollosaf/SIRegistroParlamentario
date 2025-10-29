import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';

class AvisoTermino extends Model {
  declare id: CreationOptional<number>;
  declare rfc_usuario: string;
  declare path_aviso: string;
  declare path_terminos: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AvisoTermino.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    rfc_usuario: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path_aviso: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    path_terminos: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'avisos_terminos',
    timestamps: true,
  }
);

export default AvisoTermino;