import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface orden_diasAttributes {
  id: number;
  path_orden: string;
  id_evento: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type orden_diasPk = "id";
export type orden_diasId = orden_dias[orden_diasPk];
export type orden_diasOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type orden_diasCreationAttributes = Optional<orden_diasAttributes, orden_diasOptionalAttributes>;

export class orden_dias extends Model<orden_diasAttributes, orden_diasCreationAttributes> implements orden_diasAttributes {
  id!: number;
  path_orden!: string;
  id_evento!: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof orden_dias {
    return orden_dias.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    path_orden: {
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
    tableName: 'orden_dias',
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
