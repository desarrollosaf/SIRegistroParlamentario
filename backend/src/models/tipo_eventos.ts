import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { agendas, agendasId } from './agendas';

export interface tipo_eventosAttributes {
  id: string;
  nombre: string;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_eventosPk = "id";
export type tipo_eventosId = tipo_eventos[tipo_eventosPk];
export type tipo_eventosOptionalAttributes = "created_at" | "updated_at";
export type tipo_eventosCreationAttributes = Optional<tipo_eventosAttributes, tipo_eventosOptionalAttributes>;

export class tipo_eventos extends Model<tipo_eventosAttributes, tipo_eventosCreationAttributes> implements tipo_eventosAttributes {
  id!: string;
  nombre!: string;
  created_at?: Date;
  updated_at?: Date;

  // tipo_eventos hasMany agendas via tipo_evento_id
  agendas!: agendas[];
  getAgendas!: Sequelize.HasManyGetAssociationsMixin<agendas>;
  setAgendas!: Sequelize.HasManySetAssociationsMixin<agendas, agendasId>;
  addAgenda!: Sequelize.HasManyAddAssociationMixin<agendas, agendasId>;
  addAgendas!: Sequelize.HasManyAddAssociationsMixin<agendas, agendasId>;
  createAgenda!: Sequelize.HasManyCreateAssociationMixin<agendas>;
  removeAgenda!: Sequelize.HasManyRemoveAssociationMixin<agendas, agendasId>;
  removeAgendas!: Sequelize.HasManyRemoveAssociationsMixin<agendas, agendasId>;
  hasAgenda!: Sequelize.HasManyHasAssociationMixin<agendas, agendasId>;
  hasAgendas!: Sequelize.HasManyHasAssociationsMixin<agendas, agendasId>;
  countAgendas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_eventos {
    return tipo_eventos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_eventos',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
