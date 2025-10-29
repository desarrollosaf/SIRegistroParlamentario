import { Model, DataTypes, CreationOptional, ForeignKey, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, BelongsToCreateAssociationMixin } from 'sequelize';
import sequelize from '../database/pleno';
import Agendas from './agendas';
import Comisions from './comisions';
import PuntosOrdens from './puntos_ordens';

class TurnoComisions extends Model {
  declare id: string;
  declare id_comision?: ForeignKey<string>;
  declare id_punto_orden?: ForeignKey<string>;
  declare id_agenda?: ForeignKey<string>;
  declare status: number;
  declare id_sesion_regreso?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare id_agenda_agenda?: Agendas;
  declare getId_agenda_agenda: BelongsToGetAssociationMixin<Agendas>;
  declare setId_agenda_agenda: BelongsToSetAssociationMixin<Agendas, string>;
  declare createId_agenda_agenda: BelongsToCreateAssociationMixin<Agendas>;

  declare id_comision_comision?: Comisions;
  declare getId_comision_comision: BelongsToGetAssociationMixin<Comisions>;
  declare setId_comision_comision: BelongsToSetAssociationMixin<Comisions, string>;
  declare createId_comision_comision: BelongsToCreateAssociationMixin<Comisions>;

  declare id_punto_orden_puntos_orden?: PuntosOrdens;
  declare getId_punto_orden_puntos_orden: BelongsToGetAssociationMixin<PuntosOrdens>;
  declare setId_punto_orden_puntos_orden: BelongsToSetAssociationMixin<PuntosOrdens, string>;
  declare createId_punto_orden_puntos_orden: BelongsToCreateAssociationMixin<PuntosOrdens>;
}

// Inicialización
TurnoComisions.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_comision: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: { model: 'comisions', key: 'id' },
    },
    id_punto_orden: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: { model: 'puntos_ordens', key: 'id' },
    },
    id_agenda: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: { model: 'agendas', key: 'id' },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    id_sesion_regreso: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'turno_comisions',
    timestamps: true,
    paranoid: true,
  }
);

// Asociaciones
TurnoComisions.belongsTo(Agendas, { foreignKey: 'id_agenda', as: 'id_agenda_agenda' });
TurnoComisions.belongsTo(Comisions, { foreignKey: 'id_comision', as: 'id_comision_comision' });
TurnoComisions.belongsTo(PuntosOrdens, { foreignKey: 'id_punto_orden', as: 'id_punto_orden_puntos_orden' });

export default TurnoComisions;
