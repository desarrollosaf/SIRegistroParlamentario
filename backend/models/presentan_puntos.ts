import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { puntos_ordens, puntos_ordensId } from './puntos_ordens';
import type { tipo_presentas, tipo_presentasId } from './tipo_presentas';

export interface presentan_puntosAttributes {
  id: string;
  id_punto: string;
  id_tipo_presenta?: string;
  id_diputado?: string;
  otro?: string;
  id_comision?: string;
  id_grupo?: string;
  id_presenta_titular?: string;
  id_proponente?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type presentan_puntosPk = "id";
export type presentan_puntosId = presentan_puntos[presentan_puntosPk];
export type presentan_puntosOptionalAttributes = "id_tipo_presenta" | "id_diputado" | "otro" | "id_comision" | "id_grupo" | "id_presenta_titular" | "id_proponente" | "created_at" | "updated_at" | "deleted_at";
export type presentan_puntosCreationAttributes = Optional<presentan_puntosAttributes, presentan_puntosOptionalAttributes>;

export class presentan_puntos extends Model<presentan_puntosAttributes, presentan_puntosCreationAttributes> implements presentan_puntosAttributes {
  id!: string;
  id_punto!: string;
  id_tipo_presenta?: string;
  id_diputado?: string;
  otro?: string;
  id_comision?: string;
  id_grupo?: string;
  id_presenta_titular?: string;
  id_proponente?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // presentan_puntos belongsTo datos_users via id_diputado
  id_diputado_datos_user!: datos_users;
  getId_diputado_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_diputado_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_diputado_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // presentan_puntos belongsTo puntos_ordens via id_punto
  id_punto_puntos_orden!: puntos_ordens;
  getId_punto_puntos_orden!: Sequelize.BelongsToGetAssociationMixin<puntos_ordens>;
  setId_punto_puntos_orden!: Sequelize.BelongsToSetAssociationMixin<puntos_ordens, puntos_ordensId>;
  createId_punto_puntos_orden!: Sequelize.BelongsToCreateAssociationMixin<puntos_ordens>;
  // presentan_puntos belongsTo tipo_presentas via id_tipo_presenta
  id_tipo_presenta_tipo_presenta!: tipo_presentas;
  getId_tipo_presenta_tipo_presenta!: Sequelize.BelongsToGetAssociationMixin<tipo_presentas>;
  setId_tipo_presenta_tipo_presenta!: Sequelize.BelongsToSetAssociationMixin<tipo_presentas, tipo_presentasId>;
  createId_tipo_presenta_tipo_presenta!: Sequelize.BelongsToCreateAssociationMixin<tipo_presentas>;

  static initModel(sequelize: Sequelize.Sequelize): typeof presentan_puntos {
    return presentan_puntos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'puntos_ordens',
        key: 'id'
      }
    },
    id_tipo_presenta: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_presentas',
        key: 'id'
      }
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    otro: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_comision: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_grupo: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_presenta_titular: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_proponente: {
      type: DataTypes.CHAR(36),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'presentan_puntos',
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
      {
        name: "presentan_puntos_id_punto_foreign",
        using: "BTREE",
        fields: [
          { name: "id_punto" },
        ]
      },
      {
        name: "presentan_puntos_id_tipo_presenta_foreign",
        using: "BTREE",
        fields: [
          { name: "id_tipo_presenta" },
        ]
      },
      {
        name: "presentan_puntos_id_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "id_diputado" },
        ]
      },
    ]
  });
  }
}
