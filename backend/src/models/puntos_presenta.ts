import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import sequelize from '../database/registrocomisiones';
import type PuntosOrdens from './puntos_ordens';

export class PuntosPresenta extends Model<
  InferAttributes<PuntosPresenta>,
  InferCreationAttributes<PuntosPresenta>
> {
  declare id: CreationOptional<number>;

  declare id_punto: number;
  declare id_tipo_presenta: number | null;
  declare id_presenta: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare puntos_ordens?: PuntosOrdens;
}

PuntosPresenta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    id_punto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'puntos_ordens',
        key: 'id',
      },
    },

    id_tipo_presenta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    id_presenta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt'
    }
  },
  {
    sequelize,
    tableName: 'puntos_presenta',
    timestamps: true,
  }
);

export default PuntosPresenta;
