import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';

class Dialogo extends Model {
  declare id: string;
  declare no_dialogo: number;
  declare anio: number;
  declare path: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Dialogo.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    no_dialogo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(255),
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
    tableName: 'dialogos',
    timestamps: true,
    underscored: true, // usa created_at y updated_at
  }
);

export default Dialogo;
