import { Model, DataTypes, CreationOptional, NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import TipoCategoriaIniciativa from './tipo_categoria_iniciativas';
import User from './users';

class DocumentoFirmas extends Model<InferAttributes<DocumentoFirmas>, InferCreationAttributes<DocumentoFirmas>> {
  declare id: string;
  declare nombreDoc: string;
  declare id_tipo_doc: string;
  declare path_doc: string;
  declare id_usuario_registro: string;
  declare tipo_turno: string;
  declare tipo_flujo: string | null;
  declare tipo_orden: string | null;
  declare uuid: string | null;
  declare path_acuse: string | null;
  declare status: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare tipo_categoria_iniciativa?: NonAttribute<TipoCategoriaIniciativa>;
  declare usuario_registro?: NonAttribute<User>;
}

DocumentoFirmas.init(
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
      references: {
        model: 'tipo_categoria_iniciativas',
        key: 'id',
      },
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_usuario_registro: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'documento_firmas',
    timestamps: true,
    underscored: true,
  }
);

// Relaciones
DocumentoFirmas.belongsTo(TipoCategoriaIniciativa, {
  foreignKey: 'id_tipo_doc',
  as: 'tipo_categoria_iniciativa',
});

DocumentoFirmas.belongsTo(User, {
  foreignKey: 'id_usuario_registro',
  as: 'usuario_registro',
});

export default DocumentoFirmas;
