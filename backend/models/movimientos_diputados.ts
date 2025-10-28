import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { estatus_diputados, estatus_diputadosId } from './estatus_diputados';

export interface movimientos_diputadosAttributes {
  id: string;
  fecha_movimiento: string;
  estatus_diputado_id: string;
  dato_user_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type movimientos_diputadosPk = "id";
export type movimientos_diputadosId = movimientos_diputados[movimientos_diputadosPk];
export type movimientos_diputadosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type movimientos_diputadosCreationAttributes = Optional<movimientos_diputadosAttributes, movimientos_diputadosOptionalAttributes>;

export class movimientos_diputados extends Model<movimientos_diputadosAttributes, movimientos_diputadosCreationAttributes> implements movimientos_diputadosAttributes {
  id!: string;
  fecha_movimiento!: string;
  estatus_diputado_id!: string;
  dato_user_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // movimientos_diputados belongsTo datos_users via dato_user_id
  dato_user!: datos_users;
  getDato_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setDato_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createDato_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // movimientos_diputados belongsTo estatus_diputados via estatus_diputado_id
  estatus_diputado!: estatus_diputados;
  getEstatus_diputado!: Sequelize.BelongsToGetAssociationMixin<estatus_diputados>;
  setEstatus_diputado!: Sequelize.BelongsToSetAssociationMixin<estatus_diputados, estatus_diputadosId>;
  createEstatus_diputado!: Sequelize.BelongsToCreateAssociationMixin<estatus_diputados>;

  static initModel(sequelize: Sequelize.Sequelize): typeof movimientos_diputados {
    return movimientos_diputados.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    fecha_movimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    estatus_diputado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'estatus_diputados',
        key: 'id'
      }
    },
    dato_user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'movimientos_diputados',
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
        name: "movimientos_diputados_dato_user_id_foreign",
        using: "BTREE",
        fields: [
          { name: "dato_user_id" },
        ]
      },
      {
        name: "movimientos_diputados_estatus_diputado_id_foreign",
        using: "BTREE",
        fields: [
          { name: "estatus_diputado_id" },
        ]
      },
    ]
  });
  }
}
