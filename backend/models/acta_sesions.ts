import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface acta_sesionsAttributes {
  id: number;
  path_acta: string;
  id_evento: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type acta_sesionsPk = "id";
export type acta_sesionsId = acta_sesions[acta_sesionsPk];
export type acta_sesionsOptionalAttributes = "id" | "created_at" | "updated_at";
export type acta_sesionsCreationAttributes = Optional<acta_sesionsAttributes, acta_sesionsOptionalAttributes>;

export class acta_sesions extends Model<acta_sesionsAttributes, acta_sesionsCreationAttributes> implements acta_sesionsAttributes {
  id!: number;
  path_acta!: string;
  id_evento!: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof acta_sesions {
    return acta_sesions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    path_acta: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'acta_sesions',
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
