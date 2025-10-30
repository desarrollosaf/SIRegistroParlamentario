import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/pleno';
import Sesiones from './sesiones';

class PeriodoSesions extends Model {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociación hasMany
  declare sesiones?: Sesiones[];
}

// Inicialización
PeriodoSesions.init(
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
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'periodo_sesions',
    timestamps: true,
    paranoid: true,
  }
);

// Asociación
PeriodoSesions.hasMany(Sesiones, { foreignKey: 'periodo_id', as: 'sesiones' });

export default PeriodoSesions;
