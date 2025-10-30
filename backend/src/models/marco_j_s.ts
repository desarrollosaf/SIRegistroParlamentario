import { Model, DataTypes, CreationOptional, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import DependenciaDocumento from './dependencia_documentos';

class MarcoJ extends Model {
  declare id: CreationOptional<number>;
  declare nombre_doc: string | null;
  declare liga: string | null;
  declare tipoDoc: string | null;
  declare file_doc: string | null;
  declare status: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare getDependencia_documentos: HasManyGetAssociationsMixin<DependenciaDocumento>;
  declare addDependencia_documento: HasManyAddAssociationMixin<DependenciaDocumento, number>;
  declare createDependencia_documento: HasManyCreateAssociationMixin<DependenciaDocumento>;
  declare countDependencia_documentos: HasManyCountAssociationsMixin;
}

MarcoJ.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_doc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    liga: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tipoDoc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file_doc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'marco_j_s',
    timestamps: true,
  }
);

// Asociaciones
MarcoJ.hasMany(DependenciaDocumento, {
  foreignKey: 'id_marcoj',
  as: 'dependencia_documentos',
});

export default MarcoJ;
