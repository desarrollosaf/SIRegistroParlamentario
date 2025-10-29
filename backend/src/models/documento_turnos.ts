import { Model, DataTypes, CreationOptional, NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import Documentos from './documentos';

class DocumentoTurnos extends Model<InferAttributes<DocumentoTurnos>, InferCreationAttributes<DocumentoTurnos>> {
  declare id: string;
  declare documento_id: string;
  declare tipo_turno: string | null;
  declare turno_firmante: string | null;
  declare id_comision_partido: string | null;
  declare texto: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relación
  declare documento?: NonAttribute<Documentos>;
}

DocumentoTurnos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    documento_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'documentos',
        key: 'id',
      },
    },
    tipo_turno: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    turno_firmante: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_comision_partido: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'documento_turnos',
    timestamps: true,
    underscored: true,
  }
);

// Relación belongsTo
DocumentoTurnos.belongsTo(Documentos, {
  foreignKey: 'documento_id',
  as: 'documento',
});

export default DocumentoTurnos;
