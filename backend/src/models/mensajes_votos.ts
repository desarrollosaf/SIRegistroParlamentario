import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import DatosUser from './datos_users';
import Sesion from './sesiones';
import TemaVoto from './temas_votos';

class MensajesVotos extends Model {
  declare id: string;
  declare sentido: string;
  declare timestamp: CreationOptional<Date>;
  declare status: boolean;
  declare id_tema_voto: ForeignKey<TemaVoto['id']>;
  declare id_diputado: ForeignKey<DatosUser['id']>;
  declare id_evento: ForeignKey<Sesion['id']>;
  declare id_usuario_registra?: ForeignKey<DatosUser['id']>;
  declare grupo?: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// Inicialización
MensajesVotos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    sentido: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    id_tema_voto: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    id_usuario_registra: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    grupo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'mensajes_votos',
    timestamps: true,
  }
);

// Asociaciones
MensajesVotos.belongsTo(DatosUser, { foreignKey: 'id_diputado', as: 'diputado' });
MensajesVotos.belongsTo(DatosUser, { foreignKey: 'id_usuario_registra', as: 'usuario_registra' });
MensajesVotos.belongsTo(Sesion, { foreignKey: 'id_evento', as: 'evento' });
MensajesVotos.belongsTo(TemaVoto, { foreignKey: 'id_tema_voto', as: 'tema_voto' });

export default MensajesVotos;
