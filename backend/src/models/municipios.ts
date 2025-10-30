import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import Distritos from './distritos';

class Municipios extends Model {
  declare id: string;
  declare municipio: string;
  declare cabecera: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociaciones
  declare distritos?: Distritos[];
}

// Inicialización
Municipios.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    municipio: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cabecera: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'municipios',
    timestamps: true,
  }
);

// Asociaciones
Municipios.hasMany(Distritos, { foreignKey: 'municipio_id', as: 'distritos' });

export default Municipios;
