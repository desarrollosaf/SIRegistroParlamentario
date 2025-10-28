import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { documento_firmas, documento_firmasId } from './documento_firmas';
import type { documentos, documentosId } from './documentos';
import type { puntos_ordens, puntos_ordensId } from './puntos_ordens';

export interface tipo_categoria_iniciativasAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type tipo_categoria_iniciativasPk = "id";
export type tipo_categoria_iniciativasId = tipo_categoria_iniciativas[tipo_categoria_iniciativasPk];
export type tipo_categoria_iniciativasOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type tipo_categoria_iniciativasCreationAttributes = Optional<tipo_categoria_iniciativasAttributes, tipo_categoria_iniciativasOptionalAttributes>;

export class tipo_categoria_iniciativas extends Model<tipo_categoria_iniciativasAttributes, tipo_categoria_iniciativasCreationAttributes> implements tipo_categoria_iniciativasAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // tipo_categoria_iniciativas hasMany documento_firmas via id_tipo_doc
  documento_firmas!: documento_firmas[];
  getDocumento_firmas!: Sequelize.HasManyGetAssociationsMixin<documento_firmas>;
  setDocumento_firmas!: Sequelize.HasManySetAssociationsMixin<documento_firmas, documento_firmasId>;
  addDocumento_firma!: Sequelize.HasManyAddAssociationMixin<documento_firmas, documento_firmasId>;
  addDocumento_firmas!: Sequelize.HasManyAddAssociationsMixin<documento_firmas, documento_firmasId>;
  createDocumento_firma!: Sequelize.HasManyCreateAssociationMixin<documento_firmas>;
  removeDocumento_firma!: Sequelize.HasManyRemoveAssociationMixin<documento_firmas, documento_firmasId>;
  removeDocumento_firmas!: Sequelize.HasManyRemoveAssociationsMixin<documento_firmas, documento_firmasId>;
  hasDocumento_firma!: Sequelize.HasManyHasAssociationMixin<documento_firmas, documento_firmasId>;
  hasDocumento_firmas!: Sequelize.HasManyHasAssociationsMixin<documento_firmas, documento_firmasId>;
  countDocumento_firmas!: Sequelize.HasManyCountAssociationsMixin;
  // tipo_categoria_iniciativas hasMany documentos via id_tipo_doc
  documentos!: documentos[];
  getDocumentos!: Sequelize.HasManyGetAssociationsMixin<documentos>;
  setDocumentos!: Sequelize.HasManySetAssociationsMixin<documentos, documentosId>;
  addDocumento!: Sequelize.HasManyAddAssociationMixin<documentos, documentosId>;
  addDocumentos!: Sequelize.HasManyAddAssociationsMixin<documentos, documentosId>;
  createDocumento!: Sequelize.HasManyCreateAssociationMixin<documentos>;
  removeDocumento!: Sequelize.HasManyRemoveAssociationMixin<documentos, documentosId>;
  removeDocumentos!: Sequelize.HasManyRemoveAssociationsMixin<documentos, documentosId>;
  hasDocumento!: Sequelize.HasManyHasAssociationMixin<documentos, documentosId>;
  hasDocumentos!: Sequelize.HasManyHasAssociationsMixin<documentos, documentosId>;
  countDocumentos!: Sequelize.HasManyCountAssociationsMixin;
  // tipo_categoria_iniciativas hasMany puntos_ordens via id_tipo
  puntos_ordens!: puntos_ordens[];
  getPuntos_ordens!: Sequelize.HasManyGetAssociationsMixin<puntos_ordens>;
  setPuntos_ordens!: Sequelize.HasManySetAssociationsMixin<puntos_ordens, puntos_ordensId>;
  addPuntos_orden!: Sequelize.HasManyAddAssociationMixin<puntos_ordens, puntos_ordensId>;
  addPuntos_ordens!: Sequelize.HasManyAddAssociationsMixin<puntos_ordens, puntos_ordensId>;
  createPuntos_orden!: Sequelize.HasManyCreateAssociationMixin<puntos_ordens>;
  removePuntos_orden!: Sequelize.HasManyRemoveAssociationMixin<puntos_ordens, puntos_ordensId>;
  removePuntos_ordens!: Sequelize.HasManyRemoveAssociationsMixin<puntos_ordens, puntos_ordensId>;
  hasPuntos_orden!: Sequelize.HasManyHasAssociationMixin<puntos_ordens, puntos_ordensId>;
  hasPuntos_ordens!: Sequelize.HasManyHasAssociationsMixin<puntos_ordens, puntos_ordensId>;
  countPuntos_ordens!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_categoria_iniciativas {
    return tipo_categoria_iniciativas.init({
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
    tableName: 'tipo_categoria_iniciativas',
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
