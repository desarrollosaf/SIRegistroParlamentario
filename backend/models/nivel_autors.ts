import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { autor_iniciativas, autor_iniciativasId } from './autor_iniciativas';

export interface nivel_autorsAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
}

export type nivel_autorsPk = "id";
export type nivel_autorsId = nivel_autors[nivel_autorsPk];
export type nivel_autorsOptionalAttributes = "created_at" | "updated_at";
export type nivel_autorsCreationAttributes = Optional<nivel_autorsAttributes, nivel_autorsOptionalAttributes>;

export class nivel_autors extends Model<nivel_autorsAttributes, nivel_autorsCreationAttributes> implements nivel_autorsAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;

  // nivel_autors hasMany autor_iniciativas via nivel_autor_id
  autor_iniciativas!: autor_iniciativas[];
  getAutor_iniciativas!: Sequelize.HasManyGetAssociationsMixin<autor_iniciativas>;
  setAutor_iniciativas!: Sequelize.HasManySetAssociationsMixin<autor_iniciativas, autor_iniciativasId>;
  addAutor_iniciativa!: Sequelize.HasManyAddAssociationMixin<autor_iniciativas, autor_iniciativasId>;
  addAutor_iniciativas!: Sequelize.HasManyAddAssociationsMixin<autor_iniciativas, autor_iniciativasId>;
  createAutor_iniciativa!: Sequelize.HasManyCreateAssociationMixin<autor_iniciativas>;
  removeAutor_iniciativa!: Sequelize.HasManyRemoveAssociationMixin<autor_iniciativas, autor_iniciativasId>;
  removeAutor_iniciativas!: Sequelize.HasManyRemoveAssociationsMixin<autor_iniciativas, autor_iniciativasId>;
  hasAutor_iniciativa!: Sequelize.HasManyHasAssociationMixin<autor_iniciativas, autor_iniciativasId>;
  hasAutor_iniciativas!: Sequelize.HasManyHasAssociationsMixin<autor_iniciativas, autor_iniciativasId>;
  countAutor_iniciativas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof nivel_autors {
    return nivel_autors.init({
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
    tableName: 'nivel_autors',
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
