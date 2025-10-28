import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { iniciativas, iniciativasId } from './iniciativas';
import type { nivel_autors, nivel_autorsId } from './nivel_autors';

export interface autor_iniciativasAttributes {
  id: string;
  iniciativa_id: string;
  tipo_autor_id: string;
  autor_id: string;
  nivel_autor_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type autor_iniciativasPk = "id";
export type autor_iniciativasId = autor_iniciativas[autor_iniciativasPk];
export type autor_iniciativasOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type autor_iniciativasCreationAttributes = Optional<autor_iniciativasAttributes, autor_iniciativasOptionalAttributes>;

export class autor_iniciativas extends Model<autor_iniciativasAttributes, autor_iniciativasCreationAttributes> implements autor_iniciativasAttributes {
  id!: string;
  iniciativa_id!: string;
  tipo_autor_id!: string;
  autor_id!: string;
  nivel_autor_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // autor_iniciativas belongsTo iniciativas via iniciativa_id
  iniciativa!: iniciativas;
  getIniciativa!: Sequelize.BelongsToGetAssociationMixin<iniciativas>;
  setIniciativa!: Sequelize.BelongsToSetAssociationMixin<iniciativas, iniciativasId>;
  createIniciativa!: Sequelize.BelongsToCreateAssociationMixin<iniciativas>;
  // autor_iniciativas belongsTo nivel_autors via nivel_autor_id
  nivel_autor!: nivel_autors;
  getNivel_autor!: Sequelize.BelongsToGetAssociationMixin<nivel_autors>;
  setNivel_autor!: Sequelize.BelongsToSetAssociationMixin<nivel_autors, nivel_autorsId>;
  createNivel_autor!: Sequelize.BelongsToCreateAssociationMixin<nivel_autors>;

  static initModel(sequelize: Sequelize.Sequelize): typeof autor_iniciativas {
    return autor_iniciativas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    iniciativa_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'iniciativas',
        key: 'id'
      }
    },
    tipo_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    nivel_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'nivel_autors',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'autor_iniciativas',
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
      {
        name: "autor_iniciativas_iniciativa_id_foreign",
        using: "BTREE",
        fields: [
          { name: "iniciativa_id" },
        ]
      },
      {
        name: "autor_iniciativas_nivel_autor_id_foreign",
        using: "BTREE",
        fields: [
          { name: "nivel_autor_id" },
        ]
      },
    ]
  });
  }
}
