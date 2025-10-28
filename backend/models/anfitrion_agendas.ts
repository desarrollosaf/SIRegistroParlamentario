import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { agendas, agendasId } from './agendas';

export interface anfitrion_agendasAttributes {
  id: string;
  agenda_id: string;
  tipo_autor_id: string;
  autor_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type anfitrion_agendasPk = "id";
export type anfitrion_agendasId = anfitrion_agendas[anfitrion_agendasPk];
export type anfitrion_agendasOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type anfitrion_agendasCreationAttributes = Optional<anfitrion_agendasAttributes, anfitrion_agendasOptionalAttributes>;

export class anfitrion_agendas extends Model<anfitrion_agendasAttributes, anfitrion_agendasCreationAttributes> implements anfitrion_agendasAttributes {
  id!: string;
  agenda_id!: string;
  tipo_autor_id!: string;
  autor_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // anfitrion_agendas belongsTo agendas via agenda_id
  agenda!: agendas;
  getAgenda!: Sequelize.BelongsToGetAssociationMixin<agendas>;
  setAgenda!: Sequelize.BelongsToSetAssociationMixin<agendas, agendasId>;
  createAgenda!: Sequelize.BelongsToCreateAssociationMixin<agendas>;

  static initModel(sequelize: Sequelize.Sequelize): typeof anfitrion_agendas {
    return anfitrion_agendas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    agenda_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'agendas',
        key: 'id'
      }
    },
    tipo_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'anfitrion_agendas',
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
        name: "anfitrion_agendas_agenda_id_foreign",
        using: "BTREE",
        fields: [
          { name: "agenda_id" },
        ]
      },
    ]
  });
  }
}
