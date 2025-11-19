import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Agenda from './agendas';
import TipoAutor from './tipo_autors';

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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
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
    tableName: 'anfitrion_agendas',
    timestamps: true,
    paranoid: true,
  }
);

// 👇 Asociaciones
// AnfitrionAgenda.belongsTo(Agenda, { foreignKey: 'agenda_id', as: 'agenda' });
AnfitrionAgenda.belongsTo(TipoAutor, { foreignKey: "tipo_autor_id", as: "tipo_autor" });


export default AnfitrionAgenda;