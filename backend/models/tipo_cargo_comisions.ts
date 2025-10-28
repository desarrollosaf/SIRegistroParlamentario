import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { integrante_comisions, integrante_comisionsId } from './integrante_comisions';

export interface tipo_cargo_comisionsAttributes {
  id: string;
  valor: string;
  nivel: number;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_cargo_comisionsPk = "id";
export type tipo_cargo_comisionsId = tipo_cargo_comisions[tipo_cargo_comisionsPk];
export type tipo_cargo_comisionsOptionalAttributes = "created_at" | "updated_at";
export type tipo_cargo_comisionsCreationAttributes = Optional<tipo_cargo_comisionsAttributes, tipo_cargo_comisionsOptionalAttributes>;

export class tipo_cargo_comisions extends Model<tipo_cargo_comisionsAttributes, tipo_cargo_comisionsCreationAttributes> implements tipo_cargo_comisionsAttributes {
  id!: string;
  valor!: string;
  nivel!: number;
  created_at?: Date;
  updated_at?: Date;

  // tipo_cargo_comisions hasMany integrante_comisions via tipo_cargo_comision_id
  integrante_comisions!: integrante_comisions[];
  getIntegrante_comisions!: Sequelize.HasManyGetAssociationsMixin<integrante_comisions>;
  setIntegrante_comisions!: Sequelize.HasManySetAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  addIntegrante_comision!: Sequelize.HasManyAddAssociationMixin<integrante_comisions, integrante_comisionsId>;
  addIntegrante_comisions!: Sequelize.HasManyAddAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  createIntegrante_comision!: Sequelize.HasManyCreateAssociationMixin<integrante_comisions>;
  removeIntegrante_comision!: Sequelize.HasManyRemoveAssociationMixin<integrante_comisions, integrante_comisionsId>;
  removeIntegrante_comisions!: Sequelize.HasManyRemoveAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  hasIntegrante_comision!: Sequelize.HasManyHasAssociationMixin<integrante_comisions, integrante_comisionsId>;
  hasIntegrante_comisions!: Sequelize.HasManyHasAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  countIntegrante_comisions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_cargo_comisions {
    return tipo_cargo_comisions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_cargo_comisions',
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
