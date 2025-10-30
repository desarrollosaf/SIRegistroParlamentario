import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import Sesion from './sesiones';

class AsuntoOrdenDia extends Model {
  declare id: string;
  declare path_asuntos: string | null;
  declare id_evento: ForeignKey<string>;
  declare puntos: number | null;
  declare publico: CreationOptional<number>;
  declare status: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociaciones
  declare sesion?: NonAttribute<Sesion>;

  declare static associations: {
    sesion: Association<AsuntoOrdenDia, Sesion>;
  };
}

AsuntoOrdenDia.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    path_asuntos: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    puntos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    publico: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'asuntos_orden_dias',
    timestamps: true,
  }
);

// 👇 Asociaciones
AsuntoOrdenDia.belongsTo(Sesion, { foreignKey: 'id_evento', as: 'sesion' });

export default AsuntoOrdenDia;