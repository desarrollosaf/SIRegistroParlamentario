import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import AnfitrionAgenda from './anfitrion_agendas';
import Sede from './sedes';
import SesionAgenda from './sesion_agendas';
import Sesion from './sesiones';
import TipoEvento from './tipo_eventos';
import TurnoComision from './turno_comisions';

class Agenda extends Model {
  declare id: string;
  declare fecha: Date | null;
  declare hora: string | null;
  declare fecha_hora: Date | null;
  declare fecha_hora_inicio: Date | null;
  declare fecha_hora_fin: Date | null;
  declare descripcion: string | null;
  declare status: CreationOptional<number>;
  declare sede_id: ForeignKey<string>;
  declare tipo_evento_id: ForeignKey<string> | null;
  declare transmision: CreationOptional<number>;
  declare estatus_transmision: CreationOptional<number>;
  declare inicio_programado: Date | null;
  declare fin_programado: Date | null;
  declare liga: string | null;
  declare documentacion_id: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare anfitrion_agendas?: NonAttribute<AnfitrionAgenda[]>;
  declare sesion_agendas?: NonAttribute<SesionAgenda[]>;
  declare sesiones?: NonAttribute<Sesion[]>;
  declare turno_comisions?: NonAttribute<TurnoComision[]>;
  declare sede?: NonAttribute<Sede>;
  declare tipo_evento?: NonAttribute<TipoEvento>;

  declare static associations: {
    anfitrion_agendas: Association<Agenda, AnfitrionAgenda>;
    sesion_agendas: Association<Agenda, SesionAgenda>;
    sesiones: Association<Agenda, Sesion>;
    turno_comisions: Association<Agenda, TurnoComision>;
    sede: Association<Agenda, Sede>;
    tipo_evento: Association<Agenda, TipoEvento>;
  };
}

Agenda.init(
  {
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
      allowNull: false
    },
    tipo_evento_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
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
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'agendas',
    timestamps: true,
    paranoid: true, // Para soft deletes (deletedAt)
  }
);

// 👇 Asociaciones
Agenda.hasMany(AnfitrionAgenda, { foreignKey: 'agenda_id', as: 'anfitrion_agendas' });
Agenda.hasMany(SesionAgenda, { foreignKey: 'agenda_id', as: 'sesion_agendas' });
Agenda.hasMany(Sesion, { foreignKey: 'agenda_id', as: 'sesiones' });
Agenda.hasMany(TurnoComision, { foreignKey: 'id_agenda', as: 'turno_comisions' });
Agenda.belongsTo(Sede, { foreignKey: 'sede_id', as: 'sede' });
Agenda.belongsTo(TipoEvento, { foreignKey: 'tipo_evento_id', as: 'tipo_evento' });

export default Agenda;