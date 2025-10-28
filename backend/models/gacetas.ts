import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface gacetasAttributes {
  id: string;
  no_gaceta: number;
  anio: number;
  path: string;
  created_at?: Date;
  updated_at?: Date;
}

export type gacetasPk = "id";
export type gacetasId = gacetas[gacetasPk];
export type gacetasOptionalAttributes = "created_at" | "updated_at";
export type gacetasCreationAttributes = Optional<gacetasAttributes, gacetasOptionalAttributes>;

export class gacetas extends Model<gacetasAttributes, gacetasCreationAttributes> implements gacetasAttributes {
  id!: string;
  no_gaceta!: number;
  anio!: number;
  path!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof gacetas {
    return gacetas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    no_gaceta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'gacetas',
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
