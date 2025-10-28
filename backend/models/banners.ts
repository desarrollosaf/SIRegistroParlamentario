import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface bannersAttributes {
  id: string;
  descripcion: string;
  url: string;
  type: number;
  orden: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type bannersPk = "id";
export type bannersId = banners[bannersPk];
export type bannersOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type bannersCreationAttributes = Optional<bannersAttributes, bannersOptionalAttributes>;

export class banners extends Model<bannersAttributes, bannersCreationAttributes> implements bannersAttributes {
  id!: string;
  descripcion!: string;
  url!: string;
  type!: number;
  orden!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof banners {
    return banners.init({
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
    }
  }, {
    sequelize,
    tableName: 'banners',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
