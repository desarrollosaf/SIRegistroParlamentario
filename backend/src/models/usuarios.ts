import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from './users';

export interface usuariosAttributes {
  id: string;
  rfc_usuario: string;
  id_usuario_registra: string;
  id_users: string;
  fecha_registro: Date;
  status: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type usuariosPk = "id";
export type usuariosId = usuarios[usuariosPk];
export type usuariosOptionalAttributes = "fecha_registro" | "status" | "created_at" | "updated_at" | "deleted_at";
export type usuariosCreationAttributes = Optional<usuariosAttributes, usuariosOptionalAttributes>;

export class usuarios extends Model<usuariosAttributes, usuariosCreationAttributes> implements usuariosAttributes {
  id!: string;
  rfc_usuario!: string;
  id_usuario_registra!: string;
  id_users!: string;
  fecha_registro!: Date;
  status!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // usuarios belongsTo users via id_users
  id_users_user!: users;
  getId_users_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setId_users_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createId_users_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // usuarios belongsTo users via id_usuario_registra
  id_usuario_registra_user!: users;
  getId_usuario_registra_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setId_usuario_registra_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createId_usuario_registra_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof usuarios {
    return usuarios.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    rfc_usuario: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_usuario_registra: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    id_users: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'usuarios',
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
        name: "usuarios_id_usuario_registra_foreign",
        using: "BTREE",
        fields: [
          { name: "id_usuario_registra" },
        ]
      },
      {
        name: "usuarios_id_users_foreign",
        using: "BTREE",
        fields: [
          { name: "id_users" },
        ]
      },
    ]
  });
  }
}
