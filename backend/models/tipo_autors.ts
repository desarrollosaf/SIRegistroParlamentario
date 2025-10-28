import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface tipo_autorsAttributes {
  id: string;
  valor: string;
  model: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type tipo_autorsPk = "id";
export type tipo_autorsId = tipo_autors[tipo_autorsPk];
export type tipo_autorsOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type tipo_autorsCreationAttributes = Optional<tipo_autorsAttributes, tipo_autorsOptionalAttributes>;

export class tipo_autors extends Model<tipo_autorsAttributes, tipo_autorsCreationAttributes> implements tipo_autorsAttributes {
  id!: string;
  valor!: string;
  model!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_autors {
    return tipo_autors.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_autors',
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
    ]
  });
  }
}
