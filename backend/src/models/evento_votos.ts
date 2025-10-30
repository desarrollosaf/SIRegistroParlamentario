import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class EventoVotos extends Model<InferAttributes<EventoVotos>, InferCreationAttributes<EventoVotos>> {
  declare id: CreationOptional<number>;
  declare fechaEvento: string;
  declare horaEvento: string;
  declare nombreEvento: string;
  declare tipoEvento: string;
  declare idUsuario?: string;
  declare random: string;
  declare tipoEventoIntegrantes: string;
  declare estatus: string;
  declare noSesion: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EventoVotos.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    fechaEvento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'fechaEvento',
    },
    horaEvento: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'horaEvento',
    },
    nombreEvento: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'nombreEvento',
    },
    tipoEvento: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'tipoEvento',
    },
    idUsuario: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'idUsuario',
    },
    random: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipoEventoIntegrantes: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'tipoEventoIntegrantes',
    },
    estatus: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noSesion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'noSesion',
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
    tableName: 'evento_votos',
    timestamps: true,
    underscored: true,
  }
);

export default EventoVotos;
