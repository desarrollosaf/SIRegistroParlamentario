import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface proponentesAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
}

export type proponentesPk = "id";
export type proponentesId = proponentes[proponentesPk];
export type proponentesOptionalAttributes = "created_at" | "updated_at";
export type proponentesCreationAttributes = Optional<proponentesAttributes, proponentesOptionalAttributes>;

export class proponentes extends Model<proponentesAttributes, proponentesCreationAttributes> implements proponentesAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof proponentes {
    return proponentes.init({
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
    tableName: 'proponentes',
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
