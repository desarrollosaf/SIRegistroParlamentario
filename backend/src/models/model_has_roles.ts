import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { roles, rolesId } from './roles';

export interface model_has_rolesAttributes {
  role_id: number;
  model_type: string;
  model_id: string;
}

export type model_has_rolesPk = "role_id" | "model_type" | "model_id";
export type model_has_rolesId = model_has_roles[model_has_rolesPk];
export type model_has_rolesCreationAttributes = model_has_rolesAttributes;

export class model_has_roles extends Model<model_has_rolesAttributes, model_has_rolesCreationAttributes> implements model_has_rolesAttributes {
  role_id!: number;
  model_type!: string;
  model_id!: string;

  // model_has_roles belongsTo roles via role_id
  role!: roles;
  getRole!: Sequelize.BelongsToGetAssociationMixin<roles>;
  setRole!: Sequelize.BelongsToSetAssociationMixin<roles, rolesId>;
  createRole!: Sequelize.BelongsToCreateAssociationMixin<roles>;

  static initModel(sequelize: Sequelize.Sequelize): typeof model_has_roles {
    return model_has_roles.init({
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    model_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    model_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'model_has_roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_id" },
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
      {
        name: "model_has_roles_model_id_model_type_index",
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
