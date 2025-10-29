import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import DatosUser from './datos_users';
import Sesion from './sesiones';

class AsistenciaVoto extends Model {
  declare id: string;
  declare mensaje: string;
  declare timestamp: CreationOptional<Date>;
  declare status: number;
  declare id_diputado: ForeignKey<string>;
  declare id_sesion: ForeignKey<string>;
  declare votacionActiva: string;
  declare banderaC: number | null;
  declare randomCU: string | null;
  declare tiempoVotacion: Date | null;
  declare tiempoVotacionInicio: Date | null;
  declare usuario_registra: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare diputado?: NonAttribute<DatosUser>;
  declare sesion?: NonAttribute<Sesion>;

  declare static associations: {
    diputado: Association<AsistenciaVoto, DatosUser>;
    sesion: Association<AsistenciaVoto, Sesion>;
  };
}

AsistenciaVoto.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    mensaje: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    id_sesion: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    votacionActiva: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    banderaC: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    randomCU: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tiempoVotacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tiempoVotacionInicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usuario_registra: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'asistencia_votos',
    timestamps: true,
    paranoid: true,
  }
);

// 👇 Asociaciones
AsistenciaVoto.belongsTo(DatosUser, { foreignKey: 'id_diputado', as: 'diputado' });
AsistenciaVoto.belongsTo(Sesion, { foreignKey: 'id_sesion', as: 'sesion' });

export default AsistenciaVoto;