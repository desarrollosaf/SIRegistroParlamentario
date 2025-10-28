import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface marco_juridicosAttributes {
  id: number;
  path_marco: string;
  nombre_documento: string;
  id_evento: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type marco_juridicosPk = "id";
export type marco_juridicosId = marco_juridicos[marco_juridicosPk];
export type marco_juridicosOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type marco_juridicosCreationAttributes = Optional<marco_juridicosAttributes, marco_juridicosOptionalAttributes>;

export class marco_juridicos extends Model<marco_juridicosAttributes, marco_juridicosCreationAttributes> implements marco_juridicosAttributes {
  id!: number;
  path_marco!: string;
  nombre_documento!: string;
  id_evento!: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof marco_juridicos {
    return marco_juridicos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    path_marco: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombre_documento: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'marco_juridicos',
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
