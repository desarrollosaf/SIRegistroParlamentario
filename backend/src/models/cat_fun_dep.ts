import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes
} from 'sequelize';

import sequelize from '../database/registrocomisiones';

export class CatFunDep extends Model<
  InferAttributes<CatFunDep>,
  InferCreationAttributes<CatFunDep>
> {
  declare id: CreationOptional<number>;
  declare tipo: string;
  declare nombre_dependencia: string;
  declare nombre_titular: string;
  declare vigente: boolean;
  declare fecha_inicio: string;
  declare fecha_fin: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CatFunDep.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nombre_dependencia: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombre_titular: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
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
    tableName: 'cat_fun_dep',
    timestamps: true
  }
);

export default CatFunDep;
