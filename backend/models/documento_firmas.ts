import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { tipo_categoria_iniciativas, tipo_categoria_iniciativasId } from './tipo_categoria_iniciativas';
import type { users, usersId } from './users';

export interface documento_firmasAttributes {
  id: string;
  nombreDoc: string;
  id_tipo_doc: string;
  path_doc: string;
  id_usuario_registro: string;
  tipo_turno: string;
  tipo_flujo?: string;
  tipo_orden?: string;
  uuid?: string;
  path_acuse?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type documento_firmasPk = "id";
export type documento_firmasId = documento_firmas[documento_firmasPk];
export type documento_firmasOptionalAttributes = "tipo_flujo" | "tipo_orden" | "uuid" | "path_acuse" | "status" | "created_at" | "updated_at";
export type documento_firmasCreationAttributes = Optional<documento_firmasAttributes, documento_firmasOptionalAttributes>;

export class documento_firmas extends Model<documento_firmasAttributes, documento_firmasCreationAttributes> implements documento_firmasAttributes {
  id!: string;
  nombreDoc!: string;
  id_tipo_doc!: string;
  path_doc!: string;
  id_usuario_registro!: string;
  tipo_turno!: string;
  tipo_flujo?: string;
  tipo_orden?: string;
  uuid?: string;
  path_acuse?: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // documento_firmas belongsTo tipo_categoria_iniciativas via id_tipo_doc
  id_tipo_doc_tipo_categoria_iniciativa!: tipo_categoria_iniciativas;
  getId_tipo_doc_tipo_categoria_iniciativa!: Sequelize.BelongsToGetAssociationMixin<tipo_categoria_iniciativas>;
  setId_tipo_doc_tipo_categoria_iniciativa!: Sequelize.BelongsToSetAssociationMixin<tipo_categoria_iniciativas, tipo_categoria_iniciativasId>;
  createId_tipo_doc_tipo_categoria_iniciativa!: Sequelize.BelongsToCreateAssociationMixin<tipo_categoria_iniciativas>;
  // documento_firmas belongsTo users via id_usuario_registro
  id_usuario_registro_user!: users;
  getId_usuario_registro_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setId_usuario_registro_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createId_usuario_registro_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof documento_firmas {
    return documento_firmas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    nombreDoc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_tipo_doc: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'tipo_categoria_iniciativas',
        key: 'id'
      }
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_usuario_registro: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    tipo_turno: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tipo_flujo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipo_orden: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    path_acuse: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'documento_firmas',
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
        name: "documento_firmas_id_tipo_doc_foreign",
        using: "BTREE",
        fields: [
          { name: "id_tipo_doc" },
        ]
      },
      {
        name: "documento_firmas_id_usuario_registro_foreign",
        using: "BTREE",
        fields: [
          { name: "id_usuario_registro" },
        ]
      },
    ]
  });
  }
}
