import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface tipo_ordensAttributes {
  id: number;
  tipo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_ordensPk = "id";
export type tipo_ordensId = tipo_ordens[tipo_ordensPk];
export type tipo_ordensOptionalAttributes = "id" | "created_at" | "updated_at";
export type tipo_ordensCreationAttributes = Optional<tipo_ordensAttributes, tipo_ordensOptionalAttributes>;

export class tipo_ordens extends Model<tipo_ordensAttributes, tipo_ordensCreationAttributes> implements tipo_ordensAttributes {
  id!: number;
  tipo!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_ordens {
    return tipo_ordens.init({
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
    tableName: 'tipo_ordens',
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
