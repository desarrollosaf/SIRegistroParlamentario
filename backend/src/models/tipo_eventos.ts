import { Model, DataTypes, CreationOptional, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin, ForeignKey } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Agendas from './agendas';

class TipoEventos extends Model {
  declare id: string;
  declare nombre: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;


  // Asociaciones
  declare agendas?: Agendas[];
  declare getAgendas: HasManyGetAssociationsMixin<Agendas>;
  declare setAgendas: HasManySetAssociationsMixin<Agendas, string>;
  declare addAgenda: HasManyAddAssociationMixin<Agendas, string>;
  declare addAgendas: HasManyAddAssociationsMixin<Agendas, string>;
  declare removeAgenda: HasManyRemoveAssociationMixin<Agendas, string>;
  declare removeAgendas: HasManyRemoveAssociationsMixin<Agendas, string>;
  declare hasAgenda: HasManyHasAssociationMixin<Agendas, string>;
  declare hasAgendas: HasManyHasAssociationsMixin<Agendas, string>;
  declare countAgendas: HasManyCountAssociationsMixin;
}

// Inicialización
TipoEventos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'tipo_eventos',
    timestamps: true,
  }
);

// Asociaciones
// TipoEventos.hasMany(Agendas, { foreignKey: 'tipo_evento_id', as: 'agendas' });

export default TipoEventos;
