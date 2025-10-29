import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import IntegranteLegislaturas from './integrante_legislaturas';

class Partidos extends Model {
  declare id: string;
  declare siglas: string;
  declare nombre: string;
  declare emblema: string;
  declare rgb: string;
  declare rgb2: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociación hasMany
  declare integrante_legislaturas?: IntegranteLegislaturas[];
}

// Inicialización
Partidos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    siglas: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emblema: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rgb: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rgb2: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'partidos',
    timestamps: true,
    paranoid: true,
  }
);

// Asociación
Partidos.hasMany(IntegranteLegislaturas, { foreignKey: 'partido_id', as: 'integrante_legislaturas' });

export default Partidos;
