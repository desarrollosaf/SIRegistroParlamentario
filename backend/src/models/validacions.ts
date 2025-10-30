import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface validacionsAttributes {
  id: number;
  validacion: string;
  created_at?: Date;
  updated_at?: Date;
}

export type validacionsPk = "id";
export type validacionsId = validacions[validacionsPk];
export type validacionsOptionalAttributes = "id" | "created_at" | "updated_at";
export type validacionsCreationAttributes = Optional<validacionsAttributes, validacionsOptionalAttributes>;

export class validacions extends Model<validacionsAttributes, validacionsCreationAttributes> implements validacionsAttributes {
  id!: number;
  validacion!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof validacions {
    return validacions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    validacion: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'validacions',
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
