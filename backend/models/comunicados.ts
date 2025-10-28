import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { autores_comunicados, autores_comunicadosId } from './autores_comunicados';
import type { comunicados_sesions, comunicados_sesionsId } from './comunicados_sesions';
import type { descripcione_comunicados, descripcione_comunicadosId } from './descripcione_comunicados';

export interface comunicadosAttributes {
  id: string;
  fecha: string;
  comunicado: string;
  titulo: string;
  texto: string;
  publicado?: number;
  fecha_publicacion?: Date;
  sesion: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type comunicadosPk = "id";
export type comunicadosId = comunicados[comunicadosPk];
export type comunicadosOptionalAttributes = "publicado" | "fecha_publicacion" | "sesion" | "created_at" | "updated_at" | "deleted_at";
export type comunicadosCreationAttributes = Optional<comunicadosAttributes, comunicadosOptionalAttributes>;

export class comunicados extends Model<comunicadosAttributes, comunicadosCreationAttributes> implements comunicadosAttributes {
  id!: string;
  fecha!: string;
  comunicado!: string;
  titulo!: string;
  texto!: string;
  publicado?: number;
  fecha_publicacion?: Date;
  sesion!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // comunicados hasMany autores_comunicados via comunicado_id
  autores_comunicados!: autores_comunicados[];
  getAutores_comunicados!: Sequelize.HasManyGetAssociationsMixin<autores_comunicados>;
  setAutores_comunicados!: Sequelize.HasManySetAssociationsMixin<autores_comunicados, autores_comunicadosId>;
  addAutores_comunicado!: Sequelize.HasManyAddAssociationMixin<autores_comunicados, autores_comunicadosId>;
  addAutores_comunicados!: Sequelize.HasManyAddAssociationsMixin<autores_comunicados, autores_comunicadosId>;
  createAutores_comunicado!: Sequelize.HasManyCreateAssociationMixin<autores_comunicados>;
  removeAutores_comunicado!: Sequelize.HasManyRemoveAssociationMixin<autores_comunicados, autores_comunicadosId>;
  removeAutores_comunicados!: Sequelize.HasManyRemoveAssociationsMixin<autores_comunicados, autores_comunicadosId>;
  hasAutores_comunicado!: Sequelize.HasManyHasAssociationMixin<autores_comunicados, autores_comunicadosId>;
  hasAutores_comunicados!: Sequelize.HasManyHasAssociationsMixin<autores_comunicados, autores_comunicadosId>;
  countAutores_comunicados!: Sequelize.HasManyCountAssociationsMixin;
  // comunicados hasMany comunicados_sesions via comunicado_id
  comunicados_sesions!: comunicados_sesions[];
  getComunicados_sesions!: Sequelize.HasManyGetAssociationsMixin<comunicados_sesions>;
  setComunicados_sesions!: Sequelize.HasManySetAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  addComunicados_sesion!: Sequelize.HasManyAddAssociationMixin<comunicados_sesions, comunicados_sesionsId>;
  addComunicados_sesions!: Sequelize.HasManyAddAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  createComunicados_sesion!: Sequelize.HasManyCreateAssociationMixin<comunicados_sesions>;
  removeComunicados_sesion!: Sequelize.HasManyRemoveAssociationMixin<comunicados_sesions, comunicados_sesionsId>;
  removeComunicados_sesions!: Sequelize.HasManyRemoveAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  hasComunicados_sesion!: Sequelize.HasManyHasAssociationMixin<comunicados_sesions, comunicados_sesionsId>;
  hasComunicados_sesions!: Sequelize.HasManyHasAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  countComunicados_sesions!: Sequelize.HasManyCountAssociationsMixin;
  // comunicados hasMany descripcione_comunicados via comunicado_id
  descripcione_comunicados!: descripcione_comunicados[];
  getDescripcione_comunicados!: Sequelize.HasManyGetAssociationsMixin<descripcione_comunicados>;
  setDescripcione_comunicados!: Sequelize.HasManySetAssociationsMixin<descripcione_comunicados, descripcione_comunicadosId>;
  addDescripcione_comunicado!: Sequelize.HasManyAddAssociationMixin<descripcione_comunicados, descripcione_comunicadosId>;
  addDescripcione_comunicados!: Sequelize.HasManyAddAssociationsMixin<descripcione_comunicados, descripcione_comunicadosId>;
  createDescripcione_comunicado!: Sequelize.HasManyCreateAssociationMixin<descripcione_comunicados>;
  removeDescripcione_comunicado!: Sequelize.HasManyRemoveAssociationMixin<descripcione_comunicados, descripcione_comunicadosId>;
  removeDescripcione_comunicados!: Sequelize.HasManyRemoveAssociationsMixin<descripcione_comunicados, descripcione_comunicadosId>;
  hasDescripcione_comunicado!: Sequelize.HasManyHasAssociationMixin<descripcione_comunicados, descripcione_comunicadosId>;
  hasDescripcione_comunicados!: Sequelize.HasManyHasAssociationsMixin<descripcione_comunicados, descripcione_comunicadosId>;
  countDescripcione_comunicados!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof comunicados {
    return comunicados.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    comunicado: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    titulo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sesion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'comunicados',
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
