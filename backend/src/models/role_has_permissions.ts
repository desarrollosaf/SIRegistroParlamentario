import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { permissions, permissionsId } from './permissions';
import type { roles, rolesId } from './roles';

export interface role_has_permissionsAttributes {
  permission_id: number;
  role_id: number;
}

export type role_has_permissionsPk = "permission_id" | "role_id";
export type role_has_permissionsId = role_has_permissions[role_has_permissionsPk];
export type role_has_permissionsCreationAttributes = role_has_permissionsAttributes;

export class role_has_permissions extends Model<role_has_permissionsAttributes, role_has_permissionsCreationAttributes> implements role_has_permissionsAttributes {
  permission_id!: number;
  role_id!: number;

  // role_has_permissions belongsTo permissions via permission_id
  permission!: permissions;
  getPermission!: Sequelize.BelongsToGetAssociationMixin<permissions>;
  setPermission!: Sequelize.BelongsToSetAssociationMixin<permissions, permissionsId>;
  createPermission!: Sequelize.BelongsToCreateAssociationMixin<permissions>;
  // role_has_permissions belongsTo roles via role_id
  role!: roles;
  getRole!: Sequelize.BelongsToGetAssociationMixin<roles>;
  setRole!: Sequelize.BelongsToSetAssociationMixin<roles, rolesId>;
  createRole!: Sequelize.BelongsToCreateAssociationMixin<roles>;

  static initModel(sequelize: Sequelize.Sequelize): typeof role_has_permissions {
    return role_has_permissions.init({
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'role_has_permissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "permission_id" },
          { name: "role_id" },
        ]
      },
      {
        name: "role_has_permissions_role_id_foreign",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
    ]
  });
  }
}
