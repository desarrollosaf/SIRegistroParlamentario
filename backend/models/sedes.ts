import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { agendas, agendasId } from './agendas';

export interface sedesAttributes {
  id: string;
  sede: string;
  created_at?: Date;
  updated_at?: Date;
}

export type sedesPk = "id";
export type sedesId = sedes[sedesPk];
export type sedesOptionalAttributes = "created_at" | "updated_at";
export type sedesCreationAttributes = Optional<sedesAttributes, sedesOptionalAttributes>;

export class sedes extends Model<sedesAttributes, sedesCreationAttributes> implements sedesAttributes {
  id!: string;
  sede!: string;
  created_at?: Date;
  updated_at?: Date;

  // sedes hasMany agendas via sede_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof sedes {
    return sedes.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    sede: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'sedes',
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
