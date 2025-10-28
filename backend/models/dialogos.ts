import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface dialogosAttributes {
  id: string;
  no_dialogo: number;
  anio: number;
  path: string;
  created_at?: Date;
  updated_at?: Date;
}

export type dialogosPk = "id";
export type dialogosId = dialogos[dialogosPk];
export type dialogosOptionalAttributes = "created_at" | "updated_at";
export type dialogosCreationAttributes = Optional<dialogosAttributes, dialogosOptionalAttributes>;

export class dialogos extends Model<dialogosAttributes, dialogosCreationAttributes> implements dialogosAttributes {
  id!: string;
  no_dialogo!: number;
  anio!: number;
  path!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof dialogos {
    return dialogos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    no_dialogo: {
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
    tableName: 'dialogos',
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
