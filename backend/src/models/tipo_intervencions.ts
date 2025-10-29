import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface tipo_intervencionsAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_intervencionsPk = "id";
export type tipo_intervencionsId = tipo_intervencions[tipo_intervencionsPk];
export type tipo_intervencionsOptionalAttributes = "created_at" | "updated_at";
export type tipo_intervencionsCreationAttributes = Optional<tipo_intervencionsAttributes, tipo_intervencionsOptionalAttributes>;

export class tipo_intervencions extends Model<tipo_intervencionsAttributes, tipo_intervencionsCreationAttributes> implements tipo_intervencionsAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_intervencions {
    return tipo_intervencions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_intervencions',
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
