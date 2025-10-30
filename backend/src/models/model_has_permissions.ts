import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { permissions, permissionsId } from './permissions';

export interface model_has_permissionsAttributes {
  permission_id: number;
  model_type: string;
  model_id: number;
}

export type model_has_permissionsPk = "permission_id" | "model_type" | "model_id";
export type model_has_permissionsId = model_has_permissions[model_has_permissionsPk];
export type model_has_permissionsCreationAttributes = model_has_permissionsAttributes;

export class model_has_permissions extends Model<model_has_permissionsAttributes, model_has_permissionsCreationAttributes> implements model_has_permissionsAttributes {
  permission_id!: number;
  model_type!: string;
  model_id!: number;

  // model_has_permissions belongsTo permissions via permission_id
  permission!: permissions;
  getPermission!: Sequelize.BelongsToGetAssociationMixin<permissions>;
  setPermission!: Sequelize.BelongsToSetAssociationMixin<permissions, permissionsId>;
  createPermission!: Sequelize.BelongsToCreateAssociationMixin<permissions>;

  static initModel(sequelize: Sequelize.Sequelize): typeof model_has_permissions {
    return model_has_permissions.init({
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    model_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    model_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'model_has_permissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "permission_id" },
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
      {
        name: "model_has_permissions_model_id_model_type_index",
        using: "BTREE",
        fields: [
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
    ]
  });
  }
}
