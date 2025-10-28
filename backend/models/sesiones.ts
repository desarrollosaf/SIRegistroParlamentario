import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { agendas, agendasId } from './agendas';
import type { anio_sesions, anio_sesionsId } from './anio_sesions';
import type { asistencia_votos, asistencia_votosId } from './asistencia_votos';
import type { asuntos_orden_dias, asuntos_orden_diasId } from './asuntos_orden_dias';
import type { comunicados_sesions, comunicados_sesionsId } from './comunicados_sesions';
import type { datos_users, datos_usersId } from './datos_users';
import type { mensajes_votos, mensajes_votosId } from './mensajes_votos';
import type { periodo_sesions, periodo_sesionsId } from './periodo_sesions';
import type { regimen_sesions, regimen_sesionsId } from './regimen_sesions';
import type { sesion_agendas, sesion_agendasId } from './sesion_agendas';
import type { temas_votos, temas_votosId } from './temas_votos';
import type { tipo_asambleas, tipo_asambleasId } from './tipo_asambleas';
import type { tipo_sesions, tipo_sesionsId } from './tipo_sesions';

export interface sesionesAttributes {
  id: string;
  agenda_id?: string;
  sesion?: string;
  tipo_sesion_id?: string;
  regimen_id?: string;
  anio_id?: string;
  periodo_id?: string;
  tipo_asamblea_id?: string;
  path_acta?: string;
  path_orden?: string;
  path_estenografia?: string;
  estatus: number;
  usuario_registro_id: string;
  usuario_cierra_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type sesionesPk = "id";
export type sesionesId = sesiones[sesionesPk];
export type sesionesOptionalAttributes = "agenda_id" | "sesion" | "tipo_sesion_id" | "regimen_id" | "anio_id" | "periodo_id" | "tipo_asamblea_id" | "path_acta" | "path_orden" | "path_estenografia" | "estatus" | "usuario_cierra_id" | "created_at" | "updated_at" | "deleted_at";
export type sesionesCreationAttributes = Optional<sesionesAttributes, sesionesOptionalAttributes>;

export class sesiones extends Model<sesionesAttributes, sesionesCreationAttributes> implements sesionesAttributes {
  id!: string;
  agenda_id?: string;
  sesion?: string;
  tipo_sesion_id?: string;
  regimen_id?: string;
  anio_id?: string;
  periodo_id?: string;
  tipo_asamblea_id?: string;
  path_acta?: string;
  path_orden?: string;
  path_estenografia?: string;
  estatus!: number;
  usuario_registro_id!: string;
  usuario_cierra_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // sesiones belongsTo agendas via agenda_id
  agenda!: agendas;
  getAgenda!: Sequelize.BelongsToGetAssociationMixin<agendas>;
  setAgenda!: Sequelize.BelongsToSetAssociationMixin<agendas, agendasId>;
  createAgenda!: Sequelize.BelongsToCreateAssociationMixin<agendas>;
  // sesiones belongsTo anio_sesions via anio_id
  anio!: anio_sesions;
  getAnio!: Sequelize.BelongsToGetAssociationMixin<anio_sesions>;
  setAnio!: Sequelize.BelongsToSetAssociationMixin<anio_sesions, anio_sesionsId>;
  createAnio!: Sequelize.BelongsToCreateAssociationMixin<anio_sesions>;
  // sesiones belongsTo datos_users via usuario_cierra_id
  usuario_cierra!: datos_users;
  getUsuario_cierra!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setUsuario_cierra!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createUsuario_cierra!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // sesiones belongsTo datos_users via usuario_registro_id
  usuario_registro!: datos_users;
  getUsuario_registro!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setUsuario_registro!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createUsuario_registro!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // sesiones belongsTo periodo_sesions via periodo_id
  periodo!: periodo_sesions;
  getPeriodo!: Sequelize.BelongsToGetAssociationMixin<periodo_sesions>;
  setPeriodo!: Sequelize.BelongsToSetAssociationMixin<periodo_sesions, periodo_sesionsId>;
  createPeriodo!: Sequelize.BelongsToCreateAssociationMixin<periodo_sesions>;
  // sesiones belongsTo regimen_sesions via regimen_id
  regimen!: regimen_sesions;
  getRegimen!: Sequelize.BelongsToGetAssociationMixin<regimen_sesions>;
  setRegimen!: Sequelize.BelongsToSetAssociationMixin<regimen_sesions, regimen_sesionsId>;
  createRegimen!: Sequelize.BelongsToCreateAssociationMixin<regimen_sesions>;
  // sesiones hasMany asistencia_votos via id_sesion
  asistencia_votos!: asistencia_votos[];
  getAsistencia_votos!: Sequelize.HasManyGetAssociationsMixin<asistencia_votos>;
  setAsistencia_votos!: Sequelize.HasManySetAssociationsMixin<asistencia_votos, asistencia_votosId>;
  addAsistencia_voto!: Sequelize.HasManyAddAssociationMixin<asistencia_votos, asistencia_votosId>;
  addAsistencia_votos!: Sequelize.HasManyAddAssociationsMixin<asistencia_votos, asistencia_votosId>;
  createAsistencia_voto!: Sequelize.HasManyCreateAssociationMixin<asistencia_votos>;
  removeAsistencia_voto!: Sequelize.HasManyRemoveAssociationMixin<asistencia_votos, asistencia_votosId>;
  removeAsistencia_votos!: Sequelize.HasManyRemoveAssociationsMixin<asistencia_votos, asistencia_votosId>;
  hasAsistencia_voto!: Sequelize.HasManyHasAssociationMixin<asistencia_votos, asistencia_votosId>;
  hasAsistencia_votos!: Sequelize.HasManyHasAssociationsMixin<asistencia_votos, asistencia_votosId>;
  countAsistencia_votos!: Sequelize.HasManyCountAssociationsMixin;
  // sesiones hasMany asuntos_orden_dias via id_evento
  asuntos_orden_dia!: asuntos_orden_dias[];
  getAsuntos_orden_dia!: Sequelize.HasManyGetAssociationsMixin<asuntos_orden_dias>;
  setAsuntos_orden_dia!: Sequelize.HasManySetAssociationsMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  addAsuntos_orden_dium!: Sequelize.HasManyAddAssociationMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  addAsuntos_orden_dia!: Sequelize.HasManyAddAssociationsMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  createAsuntos_orden_dium!: Sequelize.HasManyCreateAssociationMixin<asuntos_orden_dias>;
  removeAsuntos_orden_dium!: Sequelize.HasManyRemoveAssociationMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  removeAsuntos_orden_dia!: Sequelize.HasManyRemoveAssociationsMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  hasAsuntos_orden_dium!: Sequelize.HasManyHasAssociationMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  hasAsuntos_orden_dia!: Sequelize.HasManyHasAssociationsMixin<asuntos_orden_dias, asuntos_orden_diasId>;
  countAsuntos_orden_dia!: Sequelize.HasManyCountAssociationsMixin;
  // sesiones hasMany comunicados_sesions via id_sesion
  comunicados_sesions!: comunicados_sesions[];
  getComunicados_sesions!: Sequelize.HasManyGetAssociationsMixin<comunicados_sesions>;
  setComunicados_sesions!: Sequelize.HasManySetAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  addComunicados_sesion!: Sequelize.HasManyAddAssociationMixin<comunicados_sesions, comunicados_sesionsId>;
  addComunicados_sesions!: Sequelize.HasManyAddAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  createComunicados_sesion!: Sequelize.HasManyCreateAssociationMixin<comunicados_sesions>;
  removeComunicados_sesion!: Sequelize.HasManyRemoveAssociationMixin<comunicados_sesions, comunicados_sesionsId>;
  removeComunicados_sesions!: Sequelize.HasManyRemoveAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  hasComunicados_sesion!: Sequelize.HasManyHasAssociationMixin<comunicados_sesions, comunicados_sesionsId>;
  hasComunicados_sesions!: Sequelize.HasManyHasAssociationsMixin<comunicados_sesions, comunicados_sesionsId>;
  countComunicados_sesions!: Sequelize.HasManyCountAssociationsMixin;
  // sesiones hasMany mensajes_votos via id_evento
  mensajes_votos!: mensajes_votos[];
  getMensajes_votos!: Sequelize.HasManyGetAssociationsMixin<mensajes_votos>;
  setMensajes_votos!: Sequelize.HasManySetAssociationsMixin<mensajes_votos, mensajes_votosId>;
  addMensajes_voto!: Sequelize.HasManyAddAssociationMixin<mensajes_votos, mensajes_votosId>;
  addMensajes_votos!: Sequelize.HasManyAddAssociationsMixin<mensajes_votos, mensajes_votosId>;
  createMensajes_voto!: Sequelize.HasManyCreateAssociationMixin<mensajes_votos>;
  removeMensajes_voto!: Sequelize.HasManyRemoveAssociationMixin<mensajes_votos, mensajes_votosId>;
  removeMensajes_votos!: Sequelize.HasManyRemoveAssociationsMixin<mensajes_votos, mensajes_votosId>;
  hasMensajes_voto!: Sequelize.HasManyHasAssociationMixin<mensajes_votos, mensajes_votosId>;
  hasMensajes_votos!: Sequelize.HasManyHasAssociationsMixin<mensajes_votos, mensajes_votosId>;
  countMensajes_votos!: Sequelize.HasManyCountAssociationsMixin;
  // sesiones hasMany sesion_agendas via sesiones_id
  sesion_agendas!: sesion_agendas[];
  getSesion_agendas!: Sequelize.HasManyGetAssociationsMixin<sesion_agendas>;
  setSesion_agendas!: Sequelize.HasManySetAssociationsMixin<sesion_agendas, sesion_agendasId>;
  addSesion_agenda!: Sequelize.HasManyAddAssociationMixin<sesion_agendas, sesion_agendasId>;
  addSesion_agendas!: Sequelize.HasManyAddAssociationsMixin<sesion_agendas, sesion_agendasId>;
  createSesion_agenda!: Sequelize.HasManyCreateAssociationMixin<sesion_agendas>;
  removeSesion_agenda!: Sequelize.HasManyRemoveAssociationMixin<sesion_agendas, sesion_agendasId>;
  removeSesion_agendas!: Sequelize.HasManyRemoveAssociationsMixin<sesion_agendas, sesion_agendasId>;
  hasSesion_agenda!: Sequelize.HasManyHasAssociationMixin<sesion_agendas, sesion_agendasId>;
  hasSesion_agendas!: Sequelize.HasManyHasAssociationsMixin<sesion_agendas, sesion_agendasId>;
  countSesion_agendas!: Sequelize.HasManyCountAssociationsMixin;
  // sesiones hasMany temas_votos via id_evento
  temas_votos!: temas_votos[];
  getTemas_votos!: Sequelize.HasManyGetAssociationsMixin<temas_votos>;
  setTemas_votos!: Sequelize.HasManySetAssociationsMixin<temas_votos, temas_votosId>;
  addTemas_voto!: Sequelize.HasManyAddAssociationMixin<temas_votos, temas_votosId>;
  addTemas_votos!: Sequelize.HasManyAddAssociationsMixin<temas_votos, temas_votosId>;
  createTemas_voto!: Sequelize.HasManyCreateAssociationMixin<temas_votos>;
  removeTemas_voto!: Sequelize.HasManyRemoveAssociationMixin<temas_votos, temas_votosId>;
  removeTemas_votos!: Sequelize.HasManyRemoveAssociationsMixin<temas_votos, temas_votosId>;
  hasTemas_voto!: Sequelize.HasManyHasAssociationMixin<temas_votos, temas_votosId>;
  hasTemas_votos!: Sequelize.HasManyHasAssociationsMixin<temas_votos, temas_votosId>;
  countTemas_votos!: Sequelize.HasManyCountAssociationsMixin;
  // sesiones belongsTo tipo_asambleas via tipo_asamblea_id
  tipo_asamblea!: tipo_asambleas;
  getTipo_asamblea!: Sequelize.BelongsToGetAssociationMixin<tipo_asambleas>;
  setTipo_asamblea!: Sequelize.BelongsToSetAssociationMixin<tipo_asambleas, tipo_asambleasId>;
  createTipo_asamblea!: Sequelize.BelongsToCreateAssociationMixin<tipo_asambleas>;
  // sesiones belongsTo tipo_sesions via tipo_sesion_id
  tipo_sesion!: tipo_sesions;
  getTipo_sesion!: Sequelize.BelongsToGetAssociationMixin<tipo_sesions>;
  setTipo_sesion!: Sequelize.BelongsToSetAssociationMixin<tipo_sesions, tipo_sesionsId>;
  createTipo_sesion!: Sequelize.BelongsToCreateAssociationMixin<tipo_sesions>;

  static initModel(sequelize: Sequelize.Sequelize): typeof sesiones {
    return sesiones.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    agenda_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'agendas',
        key: 'id'
      }
    },
    sesion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipo_sesion_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_sesions',
        key: 'id'
      }
    },
    regimen_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'regimen_sesions',
        key: 'id'
      }
    },
    anio_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'anio_sesions',
        key: 'id'
      }
    },
    periodo_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'periodo_sesions',
        key: 'id'
      }
    },
    tipo_asamblea_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_asambleas',
        key: 'id'
      }
    },
    path_acta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    path_orden: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    path_estenografia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    usuario_registro_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    usuario_cierra_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'sesiones',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sesiones_agenda_id_foreign",
        using: "BTREE",
        fields: [
          { name: "agenda_id" },
        ]
      },
      {
        name: "sesiones_tipo_sesion_id_foreign",
        using: "BTREE",
        fields: [
          { name: "tipo_sesion_id" },
        ]
      },
      {
        name: "sesiones_regimen_id_foreign",
        using: "BTREE",
        fields: [
          { name: "regimen_id" },
        ]
      },
      {
        name: "sesiones_anio_id_foreign",
        using: "BTREE",
        fields: [
          { name: "anio_id" },
        ]
      },
      {
        name: "sesiones_periodo_id_foreign",
        using: "BTREE",
        fields: [
          { name: "periodo_id" },
        ]
      },
      {
        name: "sesiones_usuario_registro_id_foreign",
        using: "BTREE",
        fields: [
          { name: "usuario_registro_id" },
        ]
      },
      {
        name: "sesiones_usuario_cierra_id_foreign",
        using: "BTREE",
        fields: [
          { name: "usuario_cierra_id" },
        ]
      },
      {
        name: "sesiones_tipo_asamblea_id_foreign",
        using: "BTREE",
        fields: [
          { name: "tipo_asamblea_id" },
        ]
      },
    ]
  });
  }
}
