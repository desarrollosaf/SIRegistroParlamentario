import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { anfitrion_agendas, anfitrion_agendasId } from './anfitrion_agendas';
import type { sedes, sedesId } from './sedes';
import type { sesion_agendas, sesion_agendasId } from './sesion_agendas';
import type { sesiones, sesionesId } from './sesiones';
import type { tipo_eventos, tipo_eventosId } from './tipo_eventos';
import type { turno_comisions, turno_comisionsId } from './turno_comisions';

export interface agendasAttributes {
  id: string;
  fecha?: Date;
  hora?: string;
  fecha_hora?: Date;
  fecha_hora_inicio?: Date;
  fecha_hora_fin?: Date;
  descripcion?: string;
  status: number;
  sede_id: string;
  tipo_evento_id?: string;
  transmision: number;
  estatus_transmision: number;
  inicio_programado?: Date;
  fin_programado?: Date;
  liga?: string;
  documentacion_id?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type agendasPk = "id";
export type agendasId = agendas[agendasPk];
export type agendasOptionalAttributes = "fecha" | "hora" | "fecha_hora" | "fecha_hora_inicio" | "fecha_hora_fin" | "descripcion" | "status" | "tipo_evento_id" | "transmision" | "estatus_transmision" | "inicio_programado" | "fin_programado" | "liga" | "documentacion_id" | "created_at" | "updated_at" | "deleted_at";
export type agendasCreationAttributes = Optional<agendasAttributes, agendasOptionalAttributes>;

export class agendas extends Model<agendasAttributes, agendasCreationAttributes> implements agendasAttributes {
  id!: string;
  fecha?: Date;
  hora?: string;
  fecha_hora?: Date;
  fecha_hora_inicio?: Date;
  fecha_hora_fin?: Date;
  descripcion?: string;
  status!: number;
  sede_id!: string;
  tipo_evento_id?: string;
  transmision!: number;
  estatus_transmision!: number;
  inicio_programado?: Date;
  fin_programado?: Date;
  liga?: string;
  documentacion_id?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // agendas hasMany anfitrion_agendas via agenda_id
  anfitrion_agendas!: anfitrion_agendas[];
  getAnfitrion_agendas!: Sequelize.HasManyGetAssociationsMixin<anfitrion_agendas>;
  setAnfitrion_agendas!: Sequelize.HasManySetAssociationsMixin<anfitrion_agendas, anfitrion_agendasId>;
  addAnfitrion_agenda!: Sequelize.HasManyAddAssociationMixin<anfitrion_agendas, anfitrion_agendasId>;
  addAnfitrion_agendas!: Sequelize.HasManyAddAssociationsMixin<anfitrion_agendas, anfitrion_agendasId>;
  createAnfitrion_agenda!: Sequelize.HasManyCreateAssociationMixin<anfitrion_agendas>;
  removeAnfitrion_agenda!: Sequelize.HasManyRemoveAssociationMixin<anfitrion_agendas, anfitrion_agendasId>;
  removeAnfitrion_agendas!: Sequelize.HasManyRemoveAssociationsMixin<anfitrion_agendas, anfitrion_agendasId>;
  hasAnfitrion_agenda!: Sequelize.HasManyHasAssociationMixin<anfitrion_agendas, anfitrion_agendasId>;
  hasAnfitrion_agendas!: Sequelize.HasManyHasAssociationsMixin<anfitrion_agendas, anfitrion_agendasId>;
  countAnfitrion_agendas!: Sequelize.HasManyCountAssociationsMixin;
  // agendas hasMany sesion_agendas via agenda_id
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
  // agendas hasMany sesiones via agenda_id
  sesiones!: sesiones[];
  getSesiones!: Sequelize.HasManyGetAssociationsMixin<sesiones>;
  setSesiones!: Sequelize.HasManySetAssociationsMixin<sesiones, sesionesId>;
  addSesione!: Sequelize.HasManyAddAssociationMixin<sesiones, sesionesId>;
  addSesiones!: Sequelize.HasManyAddAssociationsMixin<sesiones, sesionesId>;
  createSesione!: Sequelize.HasManyCreateAssociationMixin<sesiones>;
  removeSesione!: Sequelize.HasManyRemoveAssociationMixin<sesiones, sesionesId>;
  removeSesiones!: Sequelize.HasManyRemoveAssociationsMixin<sesiones, sesionesId>;
  hasSesione!: Sequelize.HasManyHasAssociationMixin<sesiones, sesionesId>;
  hasSesiones!: Sequelize.HasManyHasAssociationsMixin<sesiones, sesionesId>;
  countSesiones!: Sequelize.HasManyCountAssociationsMixin;
  // agendas hasMany turno_comisions via id_agenda
  turno_comisions!: turno_comisions[];
  getTurno_comisions!: Sequelize.HasManyGetAssociationsMixin<turno_comisions>;
  setTurno_comisions!: Sequelize.HasManySetAssociationsMixin<turno_comisions, turno_comisionsId>;
  addTurno_comision!: Sequelize.HasManyAddAssociationMixin<turno_comisions, turno_comisionsId>;
  addTurno_comisions!: Sequelize.HasManyAddAssociationsMixin<turno_comisions, turno_comisionsId>;
  createTurno_comision!: Sequelize.HasManyCreateAssociationMixin<turno_comisions>;
  removeTurno_comision!: Sequelize.HasManyRemoveAssociationMixin<turno_comisions, turno_comisionsId>;
  removeTurno_comisions!: Sequelize.HasManyRemoveAssociationsMixin<turno_comisions, turno_comisionsId>;
  hasTurno_comision!: Sequelize.HasManyHasAssociationMixin<turno_comisions, turno_comisionsId>;
  hasTurno_comisions!: Sequelize.HasManyHasAssociationsMixin<turno_comisions, turno_comisionsId>;
  countTurno_comisions!: Sequelize.HasManyCountAssociationsMixin;
  // agendas belongsTo sedes via sede_id
  sede!: sedes;
  getSede!: Sequelize.BelongsToGetAssociationMixin<sedes>;
  setSede!: Sequelize.BelongsToSetAssociationMixin<sedes, sedesId>;
  createSede!: Sequelize.BelongsToCreateAssociationMixin<sedes>;
  // agendas belongsTo tipo_eventos via tipo_evento_id
  tipo_evento!: tipo_eventos;
  getTipo_evento!: Sequelize.BelongsToGetAssociationMixin<tipo_eventos>;
  setTipo_evento!: Sequelize.BelongsToSetAssociationMixin<tipo_eventos, tipo_eventosId>;
  createTipo_evento!: Sequelize.BelongsToCreateAssociationMixin<tipo_eventos>;

  static initModel(sequelize: Sequelize.Sequelize): typeof agendas {
    return agendas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: true
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_hora_inicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_hora_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    sede_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sedes',
        key: 'id'
      }
    },
    tipo_evento_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_eventos',
        key: 'id'
      }
    },
    transmision: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    estatus_transmision: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    inicio_programado: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fin_programado: {
      type: DataTypes.DATE,
      allowNull: true
    },
    liga: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    documentacion_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'agendas',
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
        name: "agendas_sede_id_foreign",
        using: "BTREE",
        fields: [
          { name: "sede_id" },
        ]
      },
      {
        name: "agendas_tipo_evento_id_foreign",
        using: "BTREE",
        fields: [
          { name: "tipo_evento_id" },
        ]
      },
    ]
  });
  }
}
