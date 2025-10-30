import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comisions, comisionsId } from './comisions';

export interface tipo_comisionsAttributes {
  id: string;
  valor: string;
  alias?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_comisionsPk = "id";
export type tipo_comisionsId = tipo_comisions[tipo_comisionsPk];
export type tipo_comisionsOptionalAttributes = "alias" | "created_at" | "updated_at";
export type tipo_comisionsCreationAttributes = Optional<tipo_comisionsAttributes, tipo_comisionsOptionalAttributes>;

export class tipo_comisions extends Model<tipo_comisionsAttributes, tipo_comisionsCreationAttributes> implements tipo_comisionsAttributes {
  id!: string;
  valor!: string;
  alias?: string;
  created_at?: Date;
  updated_at?: Date;

  // tipo_comisions hasMany comisions via tipo_comision_id
  comisions!: comisions[];
  getComisions!: Sequelize.HasManyGetAssociationsMixin<comisions>;
  setComisions!: Sequelize.HasManySetAssociationsMixin<comisions, comisionsId>;
  addComision!: Sequelize.HasManyAddAssociationMixin<comisions, comisionsId>;
  addComisions!: Sequelize.HasManyAddAssociationsMixin<comisions, comisionsId>;
  createComision!: Sequelize.HasManyCreateAssociationMixin<comisions>;
  removeComision!: Sequelize.HasManyRemoveAssociationMixin<comisions, comisionsId>;
  removeComisions!: Sequelize.HasManyRemoveAssociationsMixin<comisions, comisionsId>;
  hasComision!: Sequelize.HasManyHasAssociationMixin<comisions, comisionsId>;
  hasComisions!: Sequelize.HasManyHasAssociationsMixin<comisions, comisionsId>;
  countComisions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_comisions {
    return tipo_comisions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tipo_comisions',
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
    ]
  });
  }
}
