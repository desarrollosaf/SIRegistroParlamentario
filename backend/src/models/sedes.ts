import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import type Agendas from '../models/agendas';

export class Sedes extends Model<InferAttributes<Sedes>, InferCreationAttributes<Sedes>> {
  declare id: string;
  declare sede: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociación hasMany agendas
  declare agendas?: Agendas[];
  
}

Sedes.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    sede: {
      type: DataTypes.TEXT,
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
    tableName: 'sedes',
    timestamps: true,
  }
);

export default Sedes;
