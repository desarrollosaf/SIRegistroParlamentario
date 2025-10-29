import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import AutorIniciativa from './autor_iniciativas';

class NivelAutors extends Model {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociaciones
  declare autor_iniciativas?: AutorIniciativa[];
}

// Inicialización
NivelAutors.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'nivel_autors',
    timestamps: true,
  }
);

// Asociaciones
NivelAutors.hasMany(AutorIniciativa, { foreignKey: 'nivel_autor_id', as: 'autor_iniciativas' });

export default NivelAutors;
