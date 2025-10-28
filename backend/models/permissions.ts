import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { model_has_permissions, model_has_permissionsId } from './model_has_permissions';
import type { role_has_permissions, role_has_permissionsId } from './role_has_permissions';
import type { roles, rolesId } from './roles';

export interface permissionsAttributes {
  id: number;
  name: string;
  guard_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type permissionsPk = "id";
export type permissionsId = permissions[permissionsPk];
export type permissionsOptionalAttributes = "id" | "created_at" | "updated_at";
export type permissionsCreationAttributes = Optional<permissionsAttributes, permissionsOptionalAttributes>;

export class permissions extends Model<permissionsAttributes, permissionsCreationAttributes> implements permissionsAttributes {
  id!: number;
  name!: string;
  guard_name!: string;
  created_at?: Date;
  updated_at?: Date;

  // permissions hasMany model_has_permissions via permission_id
  model_has_permissions!: model_has_permissions[];
  getModel_has_permissions!: Sequelize.HasManyGetAssociationsMixin<model_has_permissions>;
  setModel_has_permissions!: Sequelize.HasManySetAssociationsMixin<model_has_permissions, model_has_permissionsId>;
  addModel_has_permission!: Sequelize.HasManyAddAssociationMixin<model_has_permissions, model_has_permissionsId>;
  addModel_has_permissions!: Sequelize.HasManyAddAssociationsMixin<model_has_permissions, model_has_permissionsId>;
  createModel_has_permission!: Sequelize.HasManyCreateAssociationMixin<model_has_permissions>;
  removeModel_has_permission!: Sequelize.HasManyRemoveAssociationMixin<model_has_permissions, model_has_permissionsId>;
  removeModel_has_permissions!: Sequelize.HasManyRemoveAssociationsMixin<model_has_permissions, model_has_permissionsId>;
  hasModel_has_permission!: Sequelize.HasManyHasAssociationMixin<model_has_permissions, model_has_permissionsId>;
  hasModel_has_permissions!: Sequelize.HasManyHasAssociationsMixin<model_has_permissions, model_has_permissionsId>;
  countModel_has_permissions!: Sequelize.HasManyCountAssociationsMixin;
  // permissions hasMany role_has_permissions via permission_id
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
  // permissions belongsToMany roles via permission_id and role_id
  role_id_roles!: roles[];
  getRole_id_roles!: Sequelize.BelongsToManyGetAssociationsMixin<roles>;
  setRole_id_roles!: Sequelize.BelongsToManySetAssociationsMixin<roles, rolesId>;
  addRole_id_role!: Sequelize.BelongsToManyAddAssociationMixin<roles, rolesId>;
  addRole_id_roles!: Sequelize.BelongsToManyAddAssociationsMixin<roles, rolesId>;
  createRole_id_role!: Sequelize.BelongsToManyCreateAssociationMixin<roles>;
  removeRole_id_role!: Sequelize.BelongsToManyRemoveAssociationMixin<roles, rolesId>;
  removeRole_id_roles!: Sequelize.BelongsToManyRemoveAssociationsMixin<roles, rolesId>;
  hasRole_id_role!: Sequelize.BelongsToManyHasAssociationMixin<roles, rolesId>;
  hasRole_id_roles!: Sequelize.BelongsToManyHasAssociationsMixin<roles, rolesId>;
  countRole_id_roles!: Sequelize.BelongsToManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof permissions {
    return permissions.init({
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
    tableName: 'permissions',
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
        name: "permissions_name_guard_name_unique",
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
