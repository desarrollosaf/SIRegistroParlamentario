import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface comisionesAttributes {
  id: number;
  random: string;
  name: string;
  tipo: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type comisionesPk = "id";
export type comisionesId = comisiones[comisionesPk];
export type comisionesOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type comisionesCreationAttributes = Optional<comisionesAttributes, comisionesOptionalAttributes>;

export class comisiones extends Model<comisionesAttributes, comisionesCreationAttributes> implements comisionesAttributes {
  id!: number;
  random!: string;
  name!: string;
  tipo!: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof comisiones {
    return comisiones.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    random: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo: {
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
    tableName: 'comisiones',
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
