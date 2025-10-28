import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface avisos_terminosAttributes {
  id: number;
  rfc_usuario: string;
  path_aviso: string;
  path_terminos: string;
  created_at?: Date;
  updated_at?: Date;
}

export type avisos_terminosPk = "id";
export type avisos_terminosId = avisos_terminos[avisos_terminosPk];
export type avisos_terminosOptionalAttributes = "id" | "created_at" | "updated_at";
export type avisos_terminosCreationAttributes = Optional<avisos_terminosAttributes, avisos_terminosOptionalAttributes>;

export class avisos_terminos extends Model<avisos_terminosAttributes, avisos_terminosCreationAttributes> implements avisos_terminosAttributes {
  id!: number;
  rfc_usuario!: string;
  path_aviso!: string;
  path_terminos!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof avisos_terminos {
    return avisos_terminos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    rfc_usuario: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path_aviso: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    path_terminos: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'avisos_terminos',
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
