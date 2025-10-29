import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';

class ComisionUsuario extends Model {
  declare id: CreationOptional<number>;
  declare id_comision: number;
  declare id_usuario: number;
  declare id_cargo: number | null;
  declare status: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ComisionUsuario.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    id_comision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cargo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'comision_usuarios',
    timestamps: true,
  }
);

export default ComisionUsuario;