import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class OrdenDias extends Model {
  declare id: CreationOptional<number>;
  declare path_orden: string;
  declare id_evento: number;
  declare status: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// Inicialización
OrdenDias.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    path_orden: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'orden_dias',
    timestamps: true,
  }
);

export default OrdenDias;
