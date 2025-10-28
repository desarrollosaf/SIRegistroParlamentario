import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { users, usersId } from './users';

export interface certificadosAttributes {
  id: string;
  id_diputado: string;
  rfc: string;
  vigencia_inicio: string;
  vigencia_fin: string;
  path_firma_autografa: string;
  path_doc_validacion: string;
  path_certificado: string;
  id_usuario_registro: string;
  hash_certificado: string;
  status: number;
  fecha_revocacion?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type certificadosPk = "id";
export type certificadosId = certificados[certificadosPk];
export type certificadosOptionalAttributes = "status" | "fecha_revocacion" | "created_at" | "updated_at";
export type certificadosCreationAttributes = Optional<certificadosAttributes, certificadosOptionalAttributes>;

export class certificados extends Model<certificadosAttributes, certificadosCreationAttributes> implements certificadosAttributes {
  id!: string;
  id_diputado!: string;
  rfc!: string;
  vigencia_inicio!: string;
  vigencia_fin!: string;
  path_firma_autografa!: string;
  path_doc_validacion!: string;
  path_certificado!: string;
  id_usuario_registro!: string;
  hash_certificado!: string;
  status!: number;
  fecha_revocacion?: Date;
  created_at?: Date;
  updated_at?: Date;

  // certificados belongsTo datos_users via id_diputado
  id_diputado_datos_user!: datos_users;
  getId_diputado_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_diputado_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_diputado_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // certificados belongsTo users via id_usuario_registro
  id_usuario_registro_user!: users;
  getId_usuario_registro_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setId_usuario_registro_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createId_usuario_registro_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof certificados {
    return certificados.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    vigencia_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    vigencia_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    path_firma_autografa: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path_doc_validacion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path_certificado: {
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
    hash_certificado: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    fecha_revocacion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'certificados',
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
        name: "certificados_id_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "id_diputado" },
        ]
      },
      {
        name: "certificados_id_usuario_registro_foreign",
        using: "BTREE",
        fields: [
          { name: "id_usuario_registro" },
        ]
      },
    ]
  });
  }
}
