import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { puntos_ordens, puntos_ordensId } from './puntos_ordens';

export interface presenta_puntosAttributes {
  id: string;
  id_presenta?: string;
  id_punto?: string;
  tipo_presenta?: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type presenta_puntosPk = "id";
export type presenta_puntosId = presenta_puntos[presenta_puntosPk];
export type presenta_puntosOptionalAttributes = "id_presenta" | "id_punto" | "tipo_presenta" | "status" | "created_at" | "updated_at";
export type presenta_puntosCreationAttributes = Optional<presenta_puntosAttributes, presenta_puntosOptionalAttributes>;

export class presenta_puntos extends Model<presenta_puntosAttributes, presenta_puntosCreationAttributes> implements presenta_puntosAttributes {
  id!: string;
  id_presenta?: string;
  id_punto?: string;
  tipo_presenta?: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // presenta_puntos belongsTo datos_users via id_presenta
  id_presenta_datos_user!: datos_users;
  getId_presenta_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_presenta_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_presenta_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // presenta_puntos belongsTo puntos_ordens via id_punto
  id_punto_puntos_orden!: puntos_ordens;
  getId_punto_puntos_orden!: Sequelize.BelongsToGetAssociationMixin<puntos_ordens>;
  setId_punto_puntos_orden!: Sequelize.BelongsToSetAssociationMixin<puntos_ordens, puntos_ordensId>;
  createId_punto_puntos_orden!: Sequelize.BelongsToCreateAssociationMixin<puntos_ordens>;

  static initModel(sequelize: Sequelize.Sequelize): typeof presenta_puntos {
    return presenta_puntos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_presenta: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'puntos_ordens',
        key: 'id'
      }
    },
    tipo_presenta: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "0 diputados, 1 grupo parlamentario"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'presenta_puntos',
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
      {
        name: "presenta_puntos_id_punto_foreign",
        using: "BTREE",
        fields: [
          { name: "id_punto" },
        ]
      },
      {
        name: "presenta_puntos_id_presenta_foreign",
        using: "BTREE",
        fields: [
          { name: "id_presenta" },
        ]
      },
    ]
  });
  }
}
