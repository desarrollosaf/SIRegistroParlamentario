import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class Comision extends Model {
  declare id: CreationOptional<number>;
  declare random: string;
  declare name: string;
  declare tipo: number;
  declare status: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Comision.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    random: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'comisiones',
    timestamps: true,
  }
);

export default Comision;