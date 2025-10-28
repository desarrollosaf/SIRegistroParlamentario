import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface comision_usuariosAttributes {
  id: number;
  id_comision: number;
  id_usuario: number;
  id_cargo?: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type comision_usuariosPk = "id";
export type comision_usuariosId = comision_usuarios[comision_usuariosPk];
export type comision_usuariosOptionalAttributes = "id" | "id_cargo" | "status" | "created_at" | "updated_at";
export type comision_usuariosCreationAttributes = Optional<comision_usuariosAttributes, comision_usuariosOptionalAttributes>;

export class comision_usuarios extends Model<comision_usuariosAttributes, comision_usuariosCreationAttributes> implements comision_usuariosAttributes {
  id!: number;
  id_comision!: number;
  id_usuario!: number;
  id_cargo?: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof comision_usuarios {
    return comision_usuarios.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_comision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cargo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'comision_usuarios',
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
