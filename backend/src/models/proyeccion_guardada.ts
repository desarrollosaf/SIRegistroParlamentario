import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../database/registrocomisiones';

// Composiciones del "Proyector rápido" guardadas para proyectar después.
class ProyeccionGuardada extends Model<
  InferAttributes<ProyeccionGuardada>,
  InferCreationAttributes<ProyeccionGuardada>
> {
  declare id: CreationOptional<string>;
  declare comision_id: string | null;
  declare titulo: string;
  declare tipo: string;              // 'imagen' | 'video' | 'mesa'
  declare contenido: any;            // objeto completo { tipo, titulo, url|integrantes }
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProyeccionGuardada.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    contenido: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'proyeccion_guardadas',
    timestamps: true,
  }
);

export default ProyeccionGuardada;
