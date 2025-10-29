import {
  Model,
  DataTypes,
  CreationOptional,
  NonAttribute,
  Association,
  HasManyGetAssociationsMixin,
  ForeignKey,
} from 'sequelize';
import sequelize from '../database/parlamentariosConnection';

import Genero from './generos';
import User from './users';
import AsistenciaVoto from './asistencia_votos';
import Certificado from './certificados';
import Documento from './documentos';
import IntegranteLegislatura from './integrante_legislaturas';
import LicenciaDiputado from './licencias_diputados';
import MensajeVoto from './mensajes_votos';
import MovimientoDiputado from './movimientos_diputados';
import PresentaPunto from './presenta_puntos';
import PresentanPunto from './presentan_puntos';
import PuntoOrden from './puntos_ordens';
import Sesion from './sesiones';
import SolicitudFirma from './solicitud_firmas';
import Turno from './turnos';

class DatosUser extends Model {
  declare id: string;
  declare apaterno: string;
  declare amaterno: string;
  declare nombres: string;
  declare intentos: boolean;
  declare bloqueo: boolean;
  declare tipo_diputado: boolean;
  declare rfc: string | null;
  declare descripcion: string | null;
  declare shortname: string | null;
  declare ext: string | null;
  declare facebook: string | null;
  declare twitter: string | null;
  declare instagram: string | null;
  declare link_web: string | null;
  declare ubicacion: string | null;
  declare generoId: ForeignKey<Genero['id']> | null;
  declare status: boolean;
  declare userId: ForeignKey<User['id']>;
  declare cel: string | null;
  declare path_foto: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones (simplificadas con NonAttribute)
  declare genero?: NonAttribute<Genero>;
  declare user?: NonAttribute<User>;
  declare asistencias?: NonAttribute<AsistenciaVoto[]>;
  declare certificados?: NonAttribute<Certificado[]>;
  declare documentos?: NonAttribute<Documento[]>;
  declare legislaturas?: NonAttribute<IntegranteLegislatura[]>;
  declare licencias?: NonAttribute<LicenciaDiputado[]>;
  declare mensajes?: NonAttribute<MensajeVoto[]>;
  declare movimientos?: NonAttribute<MovimientoDiputado[]>;
  declare presenta?: NonAttribute<PresentaPunto[]>;
  declare presentan?: NonAttribute<PresentanPunto[]>;
  declare puntos?: NonAttribute<PuntoOrden[]>;
  declare sesiones?: NonAttribute<Sesion[]>;
  declare solicitudes?: NonAttribute<SolicitudFirma[]>;
  declare turnos?: NonAttribute<Turno[]>;

  declare static associations: {
    genero: Association<DatosUser, Genero>;
    user: Association<DatosUser, User>;
    asistencias: Association<DatosUser, AsistenciaVoto>;
  };
}

DatosUser.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    apaterno: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amaterno: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    intentos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    bloqueo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tipo_diputado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rfc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortname: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ext: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    link_web: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ubicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    generoId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'genero_id',
      references: {
        model: Genero,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    cel: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    path_foto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'datos_users',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

// 🔗 Relacion
