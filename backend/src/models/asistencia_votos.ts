import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Sesion from './sesiones'; 

class AsistenciaVoto extends Model {
  declare id: string;
  declare sentido_voto: number;
  declare mensaje: string;
  declare timestamp: CreationOptional<Date>;
  declare id_diputado: ForeignKey<string>;
  declare partido_dip: string;
  declare comision_dip_id: string | null;
  declare id_agenda: ForeignKey<string>;
  declare usuario_registra: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones
  declare sesion?: NonAttribute<Sesion>; 
  declare static associations: {
    sesion: Association<AsistenciaVoto, Sesion>;
  };
}

AsistenciaVoto.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    sentido_voto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    partido_dip: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    comision_dip_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_agenda: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    usuario_registra: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'asistencia_votos',
    timestamps: true,
    paranoid: true,
  }
);


// AsistenciaVoto.belongsTo(Sesion, { foreignKey: 'id_agenda', as: 'sesion' });

export default AsistenciaVoto;
