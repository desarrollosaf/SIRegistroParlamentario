import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import Agenda from './agendas';

class AnfitrionAgenda extends Model {
  declare id: string;
  declare agenda_id: ForeignKey<string>;
  declare tipo_autor_id: string;
  declare autor_id: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare agenda?: NonAttribute<Agenda>;

  declare static associations: {
    agenda: Association<AnfitrionAgenda, Agenda>;
  };
}

AnfitrionAgenda.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    agenda_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    tipo_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'anfitrion_agendas',
    timestamps: true,
    paranoid: true,
  }
);

// 👇 Asociaciones
AnfitrionAgenda.belongsTo(Agenda, { foreignKey: 'agenda_id', as: 'agenda' });

export default AnfitrionAgenda;