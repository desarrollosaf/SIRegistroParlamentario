import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dependencia_documentos, dependencia_documentosId } from './dependencia_documentos';

export interface marco_j_sAttributes {
  id: number;
  nombre_doc?: string;
  liga?: string;
  tipoDoc?: string;
  file_doc?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type marco_j_sPk = "id";
export type marco_j_sId = marco_j_s[marco_j_sPk];
export type marco_j_sOptionalAttributes = "id" | "nombre_doc" | "liga" | "tipoDoc" | "file_doc" | "status" | "created_at" | "updated_at";
export type marco_j_sCreationAttributes = Optional<marco_j_sAttributes, marco_j_sOptionalAttributes>;

export class marco_j_s extends Model<marco_j_sAttributes, marco_j_sCreationAttributes> implements marco_j_sAttributes {
  id!: number;
  nombre_doc?: string;
  liga?: string;
  tipoDoc?: string;
  file_doc?: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // marco_j_s hasMany dependencia_documentos via id_marcoj
  dependencia_documentos!: dependencia_documentos[];
  getDependencia_documentos!: Sequelize.HasManyGetAssociationsMixin<dependencia_documentos>;
  setDependencia_documentos!: Sequelize.HasManySetAssociationsMixin<dependencia_documentos, dependencia_documentosId>;
  addDependencia_documento!: Sequelize.HasManyAddAssociationMixin<dependencia_documentos, dependencia_documentosId>;
  addDependencia_documentos!: Sequelize.HasManyAddAssociationsMixin<dependencia_documentos, dependencia_documentosId>;
  createDependencia_documento!: Sequelize.HasManyCreateAssociationMixin<dependencia_documentos>;
  removeDependencia_documento!: Sequelize.HasManyRemoveAssociationMixin<dependencia_documentos, dependencia_documentosId>;
  removeDependencia_documentos!: Sequelize.HasManyRemoveAssociationsMixin<dependencia_documentos, dependencia_documentosId>;
  hasDependencia_documento!: Sequelize.HasManyHasAssociationMixin<dependencia_documentos, dependencia_documentosId>;
  hasDependencia_documentos!: Sequelize.HasManyHasAssociationsMixin<dependencia_documentos, dependencia_documentosId>;
  countDependencia_documentos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof marco_j_s {
    return marco_j_s.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    nombre_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    liga: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipoDoc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    file_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'marco_j_s',
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
