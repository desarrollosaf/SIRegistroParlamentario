import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import AnfitrionAgenda from '../models/anfitrion_agendas';
import Sede from '../models/sedes';
import SesionAgenda from '../models/sesion_agendas';
import Sesion from '../models/sesiones';
import TipoEvento from '../models/tipo_eventos';
import TurnoComision from '../models/turno_comisions';

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
  declare tipo_sesion: number | null;
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
    tipoevento: Association<Agenda, TipoEvento>;

  };
}

Agenda.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
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
    tipo_sesion: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    tableName: 'agendas',
    timestamps: true,
    paranoid: true, // usa deletedAt en lugar de borrado físico
  }
);

// 👇 Asociaciones
Agenda.hasMany(AnfitrionAgenda, { foreignKey: 'agenda_id', as: 'anfitrion_agendas' });
Agenda.belongsTo(Sede, { foreignKey: 'sede_id', as: 'sede' });
Agenda.belongsTo(TipoEvento, { foreignKey: 'tipo_evento_id', as: 'tipoevento' });

export default Agenda;