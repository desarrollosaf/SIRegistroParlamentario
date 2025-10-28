import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';

export interface generosAttributes {
  id: string;
  genero: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type generosPk = "id";
export type generosId = generos[generosPk];
export type generosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type generosCreationAttributes = Optional<generosAttributes, generosOptionalAttributes>;

export class generos extends Model<generosAttributes, generosCreationAttributes> implements generosAttributes {
  id!: string;
  genero!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // generos hasMany datos_users via genero_id
  datos_users!: datos_users[];
  getDatos_users!: Sequelize.HasManyGetAssociationsMixin<datos_users>;
  setDatos_users!: Sequelize.HasManySetAssociationsMixin<datos_users, datos_usersId>;
  addDatos_user!: Sequelize.HasManyAddAssociationMixin<datos_users, datos_usersId>;
  addDatos_users!: Sequelize.HasManyAddAssociationsMixin<datos_users, datos_usersId>;
  createDatos_user!: Sequelize.HasManyCreateAssociationMixin<datos_users>;
  removeDatos_user!: Sequelize.HasManyRemoveAssociationMixin<datos_users, datos_usersId>;
  removeDatos_users!: Sequelize.HasManyRemoveAssociationsMixin<datos_users, datos_usersId>;
  hasDatos_user!: Sequelize.HasManyHasAssociationMixin<datos_users, datos_usersId>;
  hasDatos_users!: Sequelize.HasManyHasAssociationsMixin<datos_users, datos_usersId>;
  countDatos_users!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof generos {
    return generos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    genero: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'generos',
    timestamps: true,
    paranoid: true,
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
