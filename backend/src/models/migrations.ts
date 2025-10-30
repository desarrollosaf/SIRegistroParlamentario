import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class Migrations extends Model {
  declare id: CreationOptional<number>;
  declare migration: string;
  declare batch: number;
}

// Inicialización
Migrations.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    migration: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'migrations',
    timestamps: false,
  }
);

export default Migrations;
