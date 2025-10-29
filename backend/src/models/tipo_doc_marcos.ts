import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface tipo_doc_marcosAttributes {
  uuid: string;
  tipo: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_doc_marcosOptionalAttributes = "status" | "created_at" | "updated_at";
export type tipo_doc_marcosCreationAttributes = Optional<tipo_doc_marcosAttributes, tipo_doc_marcosOptionalAttributes>;

export class tipo_doc_marcos extends Model<tipo_doc_marcosAttributes, tipo_doc_marcosCreationAttributes> implements tipo_doc_marcosAttributes {
  uuid!: string;
  tipo!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_doc_marcos {
    return tipo_doc_marcos.init({
    uuid: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'tipo_doc_marcos',
    timestamps: true
  });
  }
}
