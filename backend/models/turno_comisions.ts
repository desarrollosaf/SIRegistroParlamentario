import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { agendas, agendasId } from './agendas';
import type { comisions, comisionsId } from './comisions';
import type { puntos_ordens, puntos_ordensId } from './puntos_ordens';

export interface turno_comisionsAttributes {
  id: string;
  id_comision?: string;
  id_punto_orden?: string;
  id_agenda?: string;
  status: number;
  id_sesion_regreso?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type turno_comisionsPk = "id";
export type turno_comisionsId = turno_comisions[turno_comisionsPk];
export type turno_comisionsOptionalAttributes = "id_comision" | "id_punto_orden" | "id_agenda" | "status" | "id_sesion_regreso" | "created_at" | "updated_at";
export type turno_comisionsCreationAttributes = Optional<turno_comisionsAttributes, turno_comisionsOptionalAttributes>;

export class turno_comisions extends Model<turno_comisionsAttributes, turno_comisionsCreationAttributes> implements turno_comisionsAttributes {
  id!: string;
  id_comision?: string;
  id_punto_orden?: string;
  id_agenda?: string;
  status!: number;
  id_sesion_regreso?: string;
  created_at?: Date;
  updated_at?: Date;

  // turno_comisions belongsTo agendas via id_agenda
  id_agenda_agenda!: agendas;
  getId_agenda_agenda!: Sequelize.BelongsToGetAssociationMixin<agendas>;
  setId_agenda_agenda!: Sequelize.BelongsToSetAssociationMixin<agendas, agendasId>;
  createId_agenda_agenda!: Sequelize.BelongsToCreateAssociationMixin<agendas>;
  // turno_comisions belongsTo comisions via id_comision
  id_comision_comision!: comisions;
  getId_comision_comision!: Sequelize.BelongsToGetAssociationMixin<comisions>;
  setId_comision_comision!: Sequelize.BelongsToSetAssociationMixin<comisions, comisionsId>;
  createId_comision_comision!: Sequelize.BelongsToCreateAssociationMixin<comisions>;
  // turno_comisions belongsTo puntos_ordens via id_punto_orden
  id_punto_orden_puntos_orden!: puntos_ordens;
  getId_punto_orden_puntos_orden!: Sequelize.BelongsToGetAssociationMixin<puntos_ordens>;
  setId_punto_orden_puntos_orden!: Sequelize.BelongsToSetAssociationMixin<puntos_ordens, puntos_ordensId>;
  createId_punto_orden_puntos_orden!: Sequelize.BelongsToCreateAssociationMixin<puntos_ordens>;

  static initModel(sequelize: Sequelize.Sequelize): typeof turno_comisions {
    return turno_comisions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_comision: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'comisions',
        key: 'id'
      }
    },
    id_punto_orden: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'puntos_ordens',
        key: 'id'
      }
    },
    id_agenda: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'agendas',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    id_sesion_regreso: {
      type: DataTypes.CHAR(36),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'turno_comisions',
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
      {
        name: "turno_comisions_id_comision_foreign",
        using: "BTREE",
        fields: [
          { name: "id_comision" },
        ]
      },
      {
        name: "turno_comisions_id_punto_orden_foreign",
        using: "BTREE",
        fields: [
          { name: "id_punto_orden" },
        ]
      },
      {
        name: "turno_comisions_id_agenda_foreign",
        using: "BTREE",
        fields: [
          { name: "id_agenda" },
        ]
      },
    ]
  });
  }
}
