import { Model, DataTypes, CreationOptional, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import Sesion from './sesiones';

class AnioSesion extends Model {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare sesiones?: NonAttribute<Sesion[]>;

  declare static associations: {
    sesiones: Association<AnioSesion, Sesion>;
  };
}

AnioSesion.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'anio_sesions',
    timestamps: true,
    paranoid: true,
  }
);

// 👇 Asociaciones
AnioSesion.hasMany(Sesion, { foreignKey: 'anio_id', as: 'sesiones' });

export default AnioSesion;