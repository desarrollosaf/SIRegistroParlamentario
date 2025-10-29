import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';

class Banner extends Model {
  declare id: string;
  declare descripcion: string;
  declare url: string;
  declare type: number;
  declare orden: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Banner.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'banners',
    timestamps: true,
    paranoid: true,
  }
);

export default Banner;