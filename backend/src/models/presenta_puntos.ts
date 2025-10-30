import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/pleno';
import DatosUsers from './datos_users';
import PuntosOrdens from './puntos_ordens';

class PresentaPuntos extends Model<InferAttributes<PresentaPuntos>, InferCreationAttributes<PresentaPuntos>> {
  declare id: string;
  declare id_presenta?: string;
  declare id_punto?: string;
  declare tipo_presenta?: number;
  declare status: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare id_presenta_datos_user?: DatosUsers;
  declare id_punto_puntos_orden?: PuntosOrdens;
}

// Inicialización
PresentaPuntos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_presenta: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'puntos_ordens',
        key: 'id',
      },
    },
    tipo_presenta: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: '0 diputados, 1 grupo parlamentario',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'presenta_puntos',
    timestamps: true,
  }
);

// Asociaciones
PresentaPuntos.belongsTo(DatosUsers, { foreignKey: 'id_presenta', as: 'id_presenta_datos_user' });
PresentaPuntos.belongsTo(PuntosOrdens, { foreignKey: 'id_punto', as: 'id_punto_puntos_orden' });

export default PresentaPuntos;
