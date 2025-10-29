import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import type { Agendas } from './agendas';
import type { AnioSesions } from './anio_sesions';
import type { AsistenciaVotos } from './asistencia_votos';
import type { AsuntosOrdenDias } from './asuntos_orden_dias';
import type { ComunicadosSesions } from './comunicados_sesions';
import type { DatosUsers } from './datos_users';
import type { MensajesVotos } from './mensajes_votos';
import type { PeriodoSesions } from './periodo_sesions';
import type { RegimenSesions } from './regimen_sesions';
import type { SesionAgendas } from './sesion_agendas';
import type { TemasVotos } from './temas_votos';
import type { TipoAsambleas } from './tipo_asambleas';
import type { TipoSesions } from './tipo_sesions';

export class Sesiones extends Model<InferAttributes<Sesiones>, InferCreationAttributes<Sesiones>> {
  declare id: string;
  declare agendaId?: string;
  declare sesion?: string;
  declare tipoSesionId?: string;
  declare regimenId?: string;
  declare anioId?: string;
  declare periodoId?: string;
  declare tipoAsambleaId?: string;
  declare pathActa?: string;
  declare pathOrden?: string;
  declare pathEstenografia?: string;
  declare estatus: number;
  declare usuarioRegistroId: string;
  declare usuarioCierraId?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare agenda?: Agendas;
  declare anio?: AnioSesions;
  declare usuarioRegistro?: DatosUsers;
  declare usuarioCierra?: DatosUsers;
  declare periodo?: PeriodoSesions;
  declare regimen?: RegimenSesions;
  declare asistenciaVotos?: AsistenciaVotos[];
  declare asuntosOrdenDia?: AsuntosOrdenDias[];
  declare comunicadosSesions?: ComunicadosSesions[];
  declare mensajesVotos?: MensajesVotos[];
  declare sesionAgendas?: SesionAgendas[];
  declare temasVotos?: TemasVotos[];
  declare tipoAsamblea?: TipoAsambleas;
  declare tipoSesion?: TipoSesions;
}

Sesiones.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    agendaId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'agendas',
        key: 'id',
      },
    },
    sesion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tipoSesionId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_sesions',
        key: 'id',
      },
    },
    regimenId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'regimen_sesions',
        key: 'id',
      },
    },
    anioId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'anio_sesions',
        key: 'id',
      },
    },
    periodoId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'periodo_sesions',
        key: 'id',
      },
    },
    tipoAsambleaId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_asambleas',
        key: 'id',
      },
    },
    pathActa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pathOrden: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pathEstenografia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    usuarioRegistroId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    usuarioCierraId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'sesiones',
    timestamps: true,
    paranoid: true,
    indexes: [
      { name: 'PRIMARY', unique: true, using: 'BTREE', fields: ['id'] },
      { name: 'sesiones_agenda_id_foreign', using: 'BTREE', fields: ['agendaId'] },
      { name: 'sesiones_tipo_sesion_id_foreign', using: 'BTREE', fields: ['tipoSesionId'] },
      { name: 'sesiones_regimen_id_foreign', using: 'BTREE', fields: ['regimenId'] },
      { name: 'sesiones_anio_id_foreign', using: 'BTREE', fields: ['anioId'] },
      { name: 'sesiones_periodo_id_foreign', using: 'BTREE', fields: ['periodoId'] },
      { name: 'sesiones_usuario_registro_id_foreign', using: 'BTREE', fields: ['usuarioRegistroId'] },
      { name: 'sesiones_usuario_cierra_id_foreign', using: 'BTREE', fields: ['usuarioCierraId'] },
      { name: 'sesiones_tipo_asamblea_id_foreign', using: 'BTREE', fields: ['tipoAsambleaId'] },
    ],
  }
);

export default Sesiones;
