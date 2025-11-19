import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Distritos from './distritos';

class Municipios extends Model {
  declare id: string;
  declare municipio: string;
  declare cabecera: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare distritos?: Distritos[];
}


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
    tableName: 'municipios',
    timestamps: true,
  }
);

// Municipios.hasMany(Distritos, { foreignKey: 'municipio_id', as: 'distritos' });

export default Municipios;
