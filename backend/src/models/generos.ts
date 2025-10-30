import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import type { datos_users } from './datos_users';

export class Generos extends Model<InferAttributes<Generos>, InferCreationAttributes<Generos>> {
  declare id: string;
  declare genero: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones
  declare datos_users?: NonAttribute<datos_users[]>;
  declare getDatos_users: HasManyGetAssociationsMixin<datos_users>;
  declare setDatos_users: HasManySetAssociationsMixin<datos_users, string>;
  declare addDatos_user: HasManyAddAssociationMixin<datos_users, string>;
  declare addDatos_users: HasManyAddAssociationsMixin<datos_users, string>;
  declare createDatos_user: HasManyAddAssociationMixin<datos_users, string>;
  declare removeDatos_user: HasManyRemoveAssociationMixin<datos_users, string>;
  declare removeDatos_users: HasManyRemoveAssociationsMixin<datos_users, string>;
  declare hasDatos_user: HasManyHasAssociationMixin<datos_users, string>;
  declare hasDatos_users: HasManyHasAssociationsMixin<datos_users, string>;
  declare countDatos_users: HasManyCountAssociationsMixin;
}

Generos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    genero: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'generos',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
    ],
  }
);

export default Generos;
