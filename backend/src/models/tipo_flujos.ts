import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface tipo_flujosAttributes {
  id: number;
  tipo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_flujosPk = "id";
export type tipo_flujosId = tipo_flujos[tipo_flujosPk];
export type tipo_flujosOptionalAttributes = "id" | "created_at" | "updated_at";
export type tipo_flujosCreationAttributes = Optional<tipo_flujosAttributes, tipo_flujosOptionalAttributes>;

export class tipo_flujos extends Model<tipo_flujosAttributes, tipo_flujosCreationAttributes> implements tipo_flujosAttributes {
  id!: number;
  tipo!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_flujos {
    return tipo_flujos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_flujos',
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
