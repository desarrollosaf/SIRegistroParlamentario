import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import sequelize from '../database/registrocomisiones';

export class Secretarias extends Model<
  InferAttributes<Secretarias>,
  InferCreationAttributes<Secretarias>
> {
  declare id: CreationOptional<number>;
  declare nombre: string | null;
  declare titular: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Secretarias.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    titular: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'secretarias',
    timestamps: true
  }
);

export default Secretarias;
