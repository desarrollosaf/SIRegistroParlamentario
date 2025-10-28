import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface admin_catsAttributes {
  id: number;
  id_presenta: string;
  secretaria?: string;
  titular: string;
  periodo_inicio?: string;
  periodo_fin?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type admin_catsPk = "id";
export type admin_catsId = admin_cats[admin_catsPk];
export type admin_catsOptionalAttributes = "id" | "secretaria" | "periodo_inicio" | "periodo_fin" | "status" | "created_at" | "updated_at";
export type admin_catsCreationAttributes = Optional<admin_catsAttributes, admin_catsOptionalAttributes>;

export class admin_cats extends Model<admin_catsAttributes, admin_catsCreationAttributes> implements admin_catsAttributes {
  id!: number;
  id_presenta!: string;
  secretaria?: string;
  titular!: string;
  periodo_inicio?: string;
  periodo_fin?: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof admin_cats {
    return admin_cats.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_presenta: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    secretaria: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    titular: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    periodo_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    periodo_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'admin_cats',
    timestamps: true,
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
