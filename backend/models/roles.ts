import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { model_has_roles, model_has_rolesId } from './model_has_roles';
import type { permissions, permissionsId } from './permissions';
import type { role_has_permissions, role_has_permissionsId } from './role_has_permissions';

export interface rolesAttributes {
  id: number;
  name: string;
  guard_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type rolesPk = "id";
export type rolesId = roles[rolesPk];
export type rolesOptionalAttributes = "id" | "created_at" | "updated_at";
export type rolesCreationAttributes = Optional<rolesAttributes, rolesOptionalAttributes>;

export class roles extends Model<rolesAttributes, rolesCreationAttributes> implements rolesAttributes {
  id!: number;
  name!: string;
  guard_name!: string;
  created_at?: Date;
  updated_at?: Date;

  // roles hasMany model_has_roles via role_id
  model_has_roles!: model_has_roles[];
  getModel_has_roles!: Sequelize.HasManyGetAssociationsMixin<model_has_roles>;
  setModel_has_roles!: Sequelize.HasManySetAssociationsMixin<model_has_roles, model_has_rolesId>;
  addModel_has_role!: Sequelize.HasManyAddAssociationMixin<model_has_roles, model_has_rolesId>;
  addModel_has_roles!: Sequelize.HasManyAddAssociationsMixin<model_has_roles, model_has_rolesId>;
  createModel_has_role!: Sequelize.HasManyCreateAssociationMixin<model_has_roles>;
  removeModel_has_role!: Sequelize.HasManyRemoveAssociationMixin<model_has_roles, model_has_rolesId>;
  removeModel_has_roles!: Sequelize.HasManyRemoveAssociationsMixin<model_has_roles, model_has_rolesId>;
  hasModel_has_role!: Sequelize.HasManyHasAssociationMixin<model_has_roles, model_has_rolesId>;
  hasModel_has_roles!: Sequelize.HasManyHasAssociationsMixin<model_has_roles, model_has_rolesId>;
  countModel_has_roles!: Sequelize.HasManyCountAssociationsMixin;
  // roles belongsToMany permissions via role_id and permission_id
  permission_id_permissions!: permissions[];
  getPermission_id_permissions!: Sequelize.BelongsToManyGetAssociationsMixin<permissions>;
  setPermission_id_permissions!: Sequelize.BelongsToManySetAssociationsMixin<permissions, permissionsId>;
  addPermission_id_permission!: Sequelize.BelongsToManyAddAssociationMixin<permissions, permissionsId>;
  addPermission_id_permissions!: Sequelize.BelongsToManyAddAssociationsMixin<permissions, permissionsId>;
  createPermission_id_permission!: Sequelize.BelongsToManyCreateAssociationMixin<permissions>;
  removePermission_id_permission!: Sequelize.BelongsToManyRemoveAssociationMixin<permissions, permissionsId>;
  removePermission_id_permissions!: Sequelize.BelongsToManyRemoveAssociationsMixin<permissions, permissionsId>;
  hasPermission_id_permission!: Sequelize.BelongsToManyHasAssociationMixin<permissions, permissionsId>;
  hasPermission_id_permissions!: Sequelize.BelongsToManyHasAssociationsMixin<permissions, permissionsId>;
  countPermission_id_permissions!: Sequelize.BelongsToManyCountAssociationsMixin;
  // roles hasMany role_has_permissions via role_id
  role_has_permissions!: role_has_permissions[];
  getRole_has_permissions!: Sequelize.HasManyGetAssociationsMixin<role_has_permissions>;
  setRole_has_permissions!: Sequelize.HasManySetAssociationsMixin<role_has_permissions, role_has_permissionsId>;
  addRole_has_permission!: Sequelize.HasManyAddAssociationMixin<role_has_permissions, role_has_permissionsId>;
  addRole_has_permissions!: Sequelize.HasManyAddAssociationsMixin<role_has_permissions, role_has_permissionsId>;
  createRole_has_permission!: Sequelize.HasManyCreateAssociationMixin<role_has_permissions>;
  removeRole_has_permission!: Sequelize.HasManyRemoveAssociationMixin<role_has_permissions, role_has_permissionsId>;
  removeRole_has_permissions!: Sequelize.HasManyRemoveAssociationsMixin<role_has_permissions, role_has_permissionsId>;
  hasRole_has_permission!: Sequelize.HasManyHasAssociationMixin<role_has_permissions, role_has_permissionsId>;
  hasRole_has_permissions!: Sequelize.HasManyHasAssociationsMixin<role_has_permissions, role_has_permissionsId>;
  countRole_has_permissions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof roles {
    return roles.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    guard_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'roles',
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
        name: "roles_name_guard_name_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
          { name: "guard_name" },
        ]
      },
    ]
  });
  }
}
