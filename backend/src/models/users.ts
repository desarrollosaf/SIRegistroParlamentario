import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { certificados, certificadosId } from './certificados';
import type { datos_users, datos_usersId } from './datos_users';
import type { documento_firmas, documento_firmasId } from './documento_firmas';
import type { usuarios, usuariosId } from './usuarios';

export interface usersAttributes {
  id: string;
  email: string;
  email_verified_at?: Date;
  password: string;
  permisoAcceso: number;
  permisoAccesoTodos: number;
  status: number;
  pass: number;
  remember_token?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "email_verified_at" | "permisoAcceso" | "permisoAccesoTodos" | "status" | "pass" | "remember_token" | "created_at" | "updated_at" | "deleted_at";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: string;
  email!: string;
  email_verified_at?: Date;
  password!: string;
  permisoAcceso!: number;
  permisoAccesoTodos!: number;
  status!: number;
  pass!: number;
  remember_token?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // users hasMany certificados via id_usuario_registro
  certificados!: certificados[];
  getCertificados!: Sequelize.HasManyGetAssociationsMixin<certificados>;
  setCertificados!: Sequelize.HasManySetAssociationsMixin<certificados, certificadosId>;
  addCertificado!: Sequelize.HasManyAddAssociationMixin<certificados, certificadosId>;
  addCertificados!: Sequelize.HasManyAddAssociationsMixin<certificados, certificadosId>;
  createCertificado!: Sequelize.HasManyCreateAssociationMixin<certificados>;
  removeCertificado!: Sequelize.HasManyRemoveAssociationMixin<certificados, certificadosId>;
  removeCertificados!: Sequelize.HasManyRemoveAssociationsMixin<certificados, certificadosId>;
  hasCertificado!: Sequelize.HasManyHasAssociationMixin<certificados, certificadosId>;
  hasCertificados!: Sequelize.HasManyHasAssociationsMixin<certificados, certificadosId>;
  countCertificados!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany datos_users via user_id
  datos_users!: datos_users[];
  getDatos_users!: Sequelize.HasManyGetAssociationsMixin<datos_users>;
  setDatos_users!: Sequelize.HasManySetAssociationsMixin<datos_users, datos_usersId>;
  addDatos_user!: Sequelize.HasManyAddAssociationMixin<datos_users, datos_usersId>;
  addDatos_users!: Sequelize.HasManyAddAssociationsMixin<datos_users, datos_usersId>;
  createDatos_user!: Sequelize.HasManyCreateAssociationMixin<datos_users>;
  removeDatos_user!: Sequelize.HasManyRemoveAssociationMixin<datos_users, datos_usersId>;
  removeDatos_users!: Sequelize.HasManyRemoveAssociationsMixin<datos_users, datos_usersId>;
  hasDatos_user!: Sequelize.HasManyHasAssociationMixin<datos_users, datos_usersId>;
  hasDatos_users!: Sequelize.HasManyHasAssociationsMixin<datos_users, datos_usersId>;
  countDatos_users!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany documento_firmas via id_usuario_registro
  documento_firmas!: documento_firmas[];
  getDocumento_firmas!: Sequelize.HasManyGetAssociationsMixin<documento_firmas>;
  setDocumento_firmas!: Sequelize.HasManySetAssociationsMixin<documento_firmas, documento_firmasId>;
  addDocumento_firma!: Sequelize.HasManyAddAssociationMixin<documento_firmas, documento_firmasId>;
  addDocumento_firmas!: Sequelize.HasManyAddAssociationsMixin<documento_firmas, documento_firmasId>;
  createDocumento_firma!: Sequelize.HasManyCreateAssociationMixin<documento_firmas>;
  removeDocumento_firma!: Sequelize.HasManyRemoveAssociationMixin<documento_firmas, documento_firmasId>;
  removeDocumento_firmas!: Sequelize.HasManyRemoveAssociationsMixin<documento_firmas, documento_firmasId>;
  hasDocumento_firma!: Sequelize.HasManyHasAssociationMixin<documento_firmas, documento_firmasId>;
  hasDocumento_firmas!: Sequelize.HasManyHasAssociationsMixin<documento_firmas, documento_firmasId>;
  countDocumento_firmas!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany usuarios via id_users
  usuarios!: usuarios[];
  getUsuarios!: Sequelize.HasManyGetAssociationsMixin<usuarios>;
  setUsuarios!: Sequelize.HasManySetAssociationsMixin<usuarios, usuariosId>;
  addUsuario!: Sequelize.HasManyAddAssociationMixin<usuarios, usuariosId>;
  addUsuarios!: Sequelize.HasManyAddAssociationsMixin<usuarios, usuariosId>;
  createUsuario!: Sequelize.HasManyCreateAssociationMixin<usuarios>;
  removeUsuario!: Sequelize.HasManyRemoveAssociationMixin<usuarios, usuariosId>;
  removeUsuarios!: Sequelize.HasManyRemoveAssociationsMixin<usuarios, usuariosId>;
  hasUsuario!: Sequelize.HasManyHasAssociationMixin<usuarios, usuariosId>;
  hasUsuarios!: Sequelize.HasManyHasAssociationsMixin<usuarios, usuariosId>;
  countUsuarios!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany usuarios via id_usuario_registra
  id_usuario_registra_usuarios!: usuarios[];
  getId_usuario_registra_usuarios!: Sequelize.HasManyGetAssociationsMixin<usuarios>;
  setId_usuario_registra_usuarios!: Sequelize.HasManySetAssociationsMixin<usuarios, usuariosId>;
  addId_usuario_registra_usuario!: Sequelize.HasManyAddAssociationMixin<usuarios, usuariosId>;
  addId_usuario_registra_usuarios!: Sequelize.HasManyAddAssociationsMixin<usuarios, usuariosId>;
  createId_usuario_registra_usuario!: Sequelize.HasManyCreateAssociationMixin<usuarios>;
  removeId_usuario_registra_usuario!: Sequelize.HasManyRemoveAssociationMixin<usuarios, usuariosId>;
  removeId_usuario_registra_usuarios!: Sequelize.HasManyRemoveAssociationsMixin<usuarios, usuariosId>;
  hasId_usuario_registra_usuario!: Sequelize.HasManyHasAssociationMixin<usuarios, usuariosId>;
  hasId_usuario_registra_usuarios!: Sequelize.HasManyHasAssociationsMixin<usuarios, usuariosId>;
  countId_usuario_registra_usuarios!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return users.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "users_email_unique"
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    permisoAcceso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    permisoAccesoTodos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    pass: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "users_email_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
