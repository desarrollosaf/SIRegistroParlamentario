import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { informes, informesId } from './informes';

export interface leyes_informesAttributes {
  id: string;
  bullets: string;
  informes_id: string;
  orden: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type leyes_informesPk = "id";
export type leyes_informesId = leyes_informes[leyes_informesPk];
export type leyes_informesOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type leyes_informesCreationAttributes = Optional<leyes_informesAttributes, leyes_informesOptionalAttributes>;

export class leyes_informes extends Model<leyes_informesAttributes, leyes_informesCreationAttributes> implements leyes_informesAttributes {
  id!: string;
  bullets!: string;
  informes_id!: string;
  orden!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // leyes_informes belongsTo informes via informes_id
  informe!: informes;
  getInforme!: Sequelize.BelongsToGetAssociationMixin<informes>;
  setInforme!: Sequelize.BelongsToSetAssociationMixin<informes, informesId>;
  createInforme!: Sequelize.BelongsToCreateAssociationMixin<informes>;

  static initModel(sequelize: Sequelize.Sequelize): typeof leyes_informes {
    return leyes_informes.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    bullets: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    informes_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'informes',
        key: 'id'
      }
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'leyes_informes',
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
        name: "leyes_informes_informes_id_foreign",
        using: "BTREE",
        fields: [
          { name: "informes_id" },
        ]
      },
    ]
  });
  }
}
