import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { documento_turnos, documento_turnosId } from './documento_turnos';
import type { tipo_categoria_iniciativas, tipo_categoria_iniciativasId } from './tipo_categoria_iniciativas';
import type { turnos, turnosId } from './turnos';

export interface documentosAttributes {
  id: string;
  nombreDoc: string;
  id_tipo_doc: string;
  path_file: string;
  fojas: number;
  id_usuario_registro: string;
  tipo_turno: string;
  tipo_flujo?: string;
  tipo_orden?: string;
  tipoMesa?: string;
  uuid?: string;
  path_acuse?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type documentosPk = "id";
export type documentosId = documentos[documentosPk];
export type documentosOptionalAttributes = "tipo_flujo" | "tipo_orden" | "tipoMesa" | "uuid" | "path_acuse" | "status" | "created_at" | "updated_at";
export type documentosCreationAttributes = Optional<documentosAttributes, documentosOptionalAttributes>;

export class documentos extends Model<documentosAttributes, documentosCreationAttributes> implements documentosAttributes {
  id!: string;
  nombreDoc!: string;
  id_tipo_doc!: string;
  path_file!: string;
  fojas!: number;
  id_usuario_registro!: string;
  tipo_turno!: string;
  tipo_flujo?: string;
  tipo_orden?: string;
  tipoMesa?: string;
  uuid?: string;
  path_acuse?: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // documentos belongsTo datos_users via id_usuario_registro
  id_usuario_registro_datos_user!: datos_users;
  getId_usuario_registro_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_usuario_registro_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_usuario_registro_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // documentos hasMany documento_turnos via documento_id
  documento_turnos!: documento_turnos[];
  getDocumento_turnos!: Sequelize.HasManyGetAssociationsMixin<documento_turnos>;
  setDocumento_turnos!: Sequelize.HasManySetAssociationsMixin<documento_turnos, documento_turnosId>;
  addDocumento_turno!: Sequelize.HasManyAddAssociationMixin<documento_turnos, documento_turnosId>;
  addDocumento_turnos!: Sequelize.HasManyAddAssociationsMixin<documento_turnos, documento_turnosId>;
  createDocumento_turno!: Sequelize.HasManyCreateAssociationMixin<documento_turnos>;
  removeDocumento_turno!: Sequelize.HasManyRemoveAssociationMixin<documento_turnos, documento_turnosId>;
  removeDocumento_turnos!: Sequelize.HasManyRemoveAssociationsMixin<documento_turnos, documento_turnosId>;
  hasDocumento_turno!: Sequelize.HasManyHasAssociationMixin<documento_turnos, documento_turnosId>;
  hasDocumento_turnos!: Sequelize.HasManyHasAssociationsMixin<documento_turnos, documento_turnosId>;
  countDocumento_turnos!: Sequelize.HasManyCountAssociationsMixin;
  // documentos hasMany turnos via id_documento
  turnos!: turnos[];
  getTurnos!: Sequelize.HasManyGetAssociationsMixin<turnos>;
  setTurnos!: Sequelize.HasManySetAssociationsMixin<turnos, turnosId>;
  addTurno!: Sequelize.HasManyAddAssociationMixin<turnos, turnosId>;
  addTurnos!: Sequelize.HasManyAddAssociationsMixin<turnos, turnosId>;
  createTurno!: Sequelize.HasManyCreateAssociationMixin<turnos>;
  removeTurno!: Sequelize.HasManyRemoveAssociationMixin<turnos, turnosId>;
  removeTurnos!: Sequelize.HasManyRemoveAssociationsMixin<turnos, turnosId>;
  hasTurno!: Sequelize.HasManyHasAssociationMixin<turnos, turnosId>;
  hasTurnos!: Sequelize.HasManyHasAssociationsMixin<turnos, turnosId>;
  countTurnos!: Sequelize.HasManyCountAssociationsMixin;
  // documentos belongsTo tipo_categoria_iniciativas via id_tipo_doc
  id_tipo_doc_tipo_categoria_iniciativa!: tipo_categoria_iniciativas;
  getId_tipo_doc_tipo_categoria_iniciativa!: Sequelize.BelongsToGetAssociationMixin<tipo_categoria_iniciativas>;
  setId_tipo_doc_tipo_categoria_iniciativa!: Sequelize.BelongsToSetAssociationMixin<tipo_categoria_iniciativas, tipo_categoria_iniciativasId>;
  createId_tipo_doc_tipo_categoria_iniciativa!: Sequelize.BelongsToCreateAssociationMixin<tipo_categoria_iniciativas>;

  static initModel(sequelize: Sequelize.Sequelize): typeof documentos {
    return documentos.init({
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
    path_file: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fojas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario_registro: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
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
    tipoMesa: {
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
    tableName: 'documentos',
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
        name: "documentos_id_tipo_doc_foreign",
        using: "BTREE",
        fields: [
          { name: "id_tipo_doc" },
        ]
      },
      {
        name: "documentos_id_usuario_registro_foreign",
        using: "BTREE",
        fields: [
          { name: "id_usuario_registro" },
        ]
      },
    ]
  });
  }
}
