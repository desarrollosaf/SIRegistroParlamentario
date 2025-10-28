import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface decisionsAttributes {
  id: number;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
}

export type decisionsPk = "id";
export type decisionsId = decisions[decisionsPk];
export type decisionsOptionalAttributes = "id" | "created_at" | "updated_at";
export type decisionsCreationAttributes = Optional<decisionsAttributes, decisionsOptionalAttributes>;

export class decisions extends Model<decisionsAttributes, decisionsCreationAttributes> implements decisionsAttributes {
  id!: number;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof decisions {
    return decisions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'decisions',
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
