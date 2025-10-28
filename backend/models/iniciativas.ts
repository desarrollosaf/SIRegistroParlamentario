import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { autor_iniciativas, autor_iniciativasId } from './autor_iniciativas';
import type { decreto_iniciativas, decreto_iniciativasId } from './decreto_iniciativas';

export interface iniciativasAttributes {
  id: string;
  folio: number;
  categoria_id: string;
  iniciativa: string;
  fecha_presentacion: string;
  fecha_expedicion: string;
  created_at?: Date;
  updated_at?: Date;
}

export type iniciativasPk = "id";
export type iniciativasId = iniciativas[iniciativasPk];
export type iniciativasOptionalAttributes = "created_at" | "updated_at";
export type iniciativasCreationAttributes = Optional<iniciativasAttributes, iniciativasOptionalAttributes>;

export class iniciativas extends Model<iniciativasAttributes, iniciativasCreationAttributes> implements iniciativasAttributes {
  id!: string;
  folio!: number;
  categoria_id!: string;
  iniciativa!: string;
  fecha_presentacion!: string;
  fecha_expedicion!: string;
  created_at?: Date;
  updated_at?: Date;

  // iniciativas hasMany autor_iniciativas via iniciativa_id
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
  // iniciativas hasMany decreto_iniciativas via iniciativa_id
  decreto_iniciativas!: decreto_iniciativas[];
  getDecreto_iniciativas!: Sequelize.HasManyGetAssociationsMixin<decreto_iniciativas>;
  setDecreto_iniciativas!: Sequelize.HasManySetAssociationsMixin<decreto_iniciativas, decreto_iniciativasId>;
  addDecreto_iniciativa!: Sequelize.HasManyAddAssociationMixin<decreto_iniciativas, decreto_iniciativasId>;
  addDecreto_iniciativas!: Sequelize.HasManyAddAssociationsMixin<decreto_iniciativas, decreto_iniciativasId>;
  createDecreto_iniciativa!: Sequelize.HasManyCreateAssociationMixin<decreto_iniciativas>;
  removeDecreto_iniciativa!: Sequelize.HasManyRemoveAssociationMixin<decreto_iniciativas, decreto_iniciativasId>;
  removeDecreto_iniciativas!: Sequelize.HasManyRemoveAssociationsMixin<decreto_iniciativas, decreto_iniciativasId>;
  hasDecreto_iniciativa!: Sequelize.HasManyHasAssociationMixin<decreto_iniciativas, decreto_iniciativasId>;
  hasDecreto_iniciativas!: Sequelize.HasManyHasAssociationsMixin<decreto_iniciativas, decreto_iniciativasId>;
  countDecreto_iniciativas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof iniciativas {
    return iniciativas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    folio: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false
    },
    categoria_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    iniciativa: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_presentacion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_expedicion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'iniciativas',
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
