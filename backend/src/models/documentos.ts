import { Model, DataTypes, CreationOptional, NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import DatosUsers from './datos_users';
import DocumentoTurnos from './documento_turnos';
import TipoCategoriaIniciativas from './tipo_categoria_iniciativas';
import Turnos from './turnos';

class Documentos extends Model<InferAttributes<Documentos>, InferCreationAttributes<Documentos>> {
  declare id: string;
  declare nombreDoc: string;
  declare id_tipo_doc: string;
  declare path_file: string;
  declare fojas: number;
  declare id_usuario_registro: string;
  declare tipo_turno: string;
  declare tipo_flujo: string | null;
  declare tipo_orden: string | null;
  declare tipoMesa: string | null;
  declare uuid: string | null;
  declare path_acuse: string | null;
  declare status: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare usuario?: NonAttribute<DatosUsers>;
  declare turnos?: NonAttribute<Turnos[]>;
  declare documento_turnos?: NonAttribute<DocumentoTurnos[]>;
  declare tipo_categoria?: NonAttribute<TipoCategoriaIniciativas>;
}

Documentos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    nombreDoc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_tipo_doc: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: { model: 'tipo_categoria_iniciativas', key: 'id' },
    },
    path_file: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fojas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario_registro: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: { model: 'datos_users', key: 'id' },
    },
    tipo_turno: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_flujo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tipo_orden: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tipoMesa: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    path_acuse: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'documentos',
    timestamps: true,
    underscored: true,
  }
);

// Relaciones
Documentos.belongsTo(DatosUsers, { foreignKey: 'id_usuario_registro', as: 'usuario' });
Documentos.belongsTo(TipoCategoriaIniciativas, { foreignKey: 'id_tipo_doc', as: 'tipo_categoria' });
Documentos.hasMany(DocumentoTurnos, { foreignKey: 'documento_id', as: 'documento_turnos' });
Documentos.hasMany(Turnos, { foreignKey: 'id_documento', as: 'turnos' });

export default Documentos;
