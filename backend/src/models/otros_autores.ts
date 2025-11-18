import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

class OtrosAutores extends Model {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización
OtrosAutores.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.TEXT,
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
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'otros_autores',
    timestamps: true,
    paranoid: true,
  }
);

export default OtrosAutores;
