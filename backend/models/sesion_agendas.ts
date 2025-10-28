import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { agendas, agendasId } from './agendas';
import type { sesiones, sesionesId } from './sesiones';

export interface sesion_agendasAttributes {
  id: string;
  sesiones_id: string;
  agenda_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type sesion_agendasPk = "id";
export type sesion_agendasId = sesion_agendas[sesion_agendasPk];
export type sesion_agendasOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type sesion_agendasCreationAttributes = Optional<sesion_agendasAttributes, sesion_agendasOptionalAttributes>;

export class sesion_agendas extends Model<sesion_agendasAttributes, sesion_agendasCreationAttributes> implements sesion_agendasAttributes {
  id!: string;
  sesiones_id!: string;
  agenda_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // sesion_agendas belongsTo agendas via agenda_id
  agenda!: agendas;
  getAgenda!: Sequelize.BelongsToGetAssociationMixin<agendas>;
  setAgenda!: Sequelize.BelongsToSetAssociationMixin<agendas, agendasId>;
  createAgenda!: Sequelize.BelongsToCreateAssociationMixin<agendas>;
  // sesion_agendas belongsTo sesiones via sesiones_id
  sesione!: sesiones;
  getSesione!: Sequelize.BelongsToGetAssociationMixin<sesiones>;
  setSesione!: Sequelize.BelongsToSetAssociationMixin<sesiones, sesionesId>;
  createSesione!: Sequelize.BelongsToCreateAssociationMixin<sesiones>;

  static initModel(sequelize: Sequelize.Sequelize): typeof sesion_agendas {
    return sesion_agendas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    sesiones_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id'
      }
    },
    agenda_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'agendas',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'sesion_agendas',
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
        name: "sesion_agendas_sesiones_id_foreign",
        using: "BTREE",
        fields: [
          { name: "sesiones_id" },
        ]
      },
      {
        name: "sesion_agendas_agenda_id_foreign",
        using: "BTREE",
        fields: [
          { name: "agenda_id" },
        ]
      },
    ]
  });
  }
}
