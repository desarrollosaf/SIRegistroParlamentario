import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface asuntos_orden_diasAttributes {
  id: string;
  path_asuntos?: string;
  id_evento: string;
  puntos?: number;
  publico: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type asuntos_orden_diasPk = "id";
export type asuntos_orden_diasId = asuntos_orden_dias[asuntos_orden_diasPk];
export type asuntos_orden_diasOptionalAttributes = "path_asuntos" | "puntos" | "publico" | "status" | "created_at" | "updated_at";
export type asuntos_orden_diasCreationAttributes = Optional<asuntos_orden_diasAttributes, asuntos_orden_diasOptionalAttributes>;

export class asuntos_orden_dias extends Model<asuntos_orden_diasAttributes, asuntos_orden_diasCreationAttributes> implements asuntos_orden_diasAttributes {
  id!: string;
  path_asuntos?: string;
  id_evento!: string;
  puntos?: number;
  publico!: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // asuntos_orden_dias belongsTo sesiones via id_evento
  id_evento_sesione!: sesiones;
  getId_evento_sesione!: Sequelize.BelongsToGetAssociationMixin<sesiones>;
  setId_evento_sesione!: Sequelize.BelongsToSetAssociationMixin<sesiones, sesionesId>;
  createId_evento_sesione!: Sequelize.BelongsToCreateAssociationMixin<sesiones>;

  static initModel(sequelize: Sequelize.Sequelize): typeof asuntos_orden_dias {
    return asuntos_orden_dias.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    path_asuntos: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id'
      }
    },
    puntos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    publico: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'asuntos_orden_dias',
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
        name: "asuntos_orden_dias_id_evento_foreign",
        using: "BTREE",
        fields: [
          { name: "id_evento" },
        ]
      },
    ]
  });
  }
}
