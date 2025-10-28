import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { estatus_diputados, estatus_diputadosId } from './estatus_diputados';

export interface licencias_diputadosAttributes {
  id: number;
  diputado_id: string;
  estatus_diputado: string;
  fecha_inicio: string;
  fecha_termino: string;
  diputado_suplente_id?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type licencias_diputadosPk = "id";
export type licencias_diputadosId = licencias_diputados[licencias_diputadosPk];
export type licencias_diputadosOptionalAttributes = "id" | "diputado_suplente_id" | "status" | "created_at" | "updated_at" | "deleted_at";
export type licencias_diputadosCreationAttributes = Optional<licencias_diputadosAttributes, licencias_diputadosOptionalAttributes>;

export class licencias_diputados extends Model<licencias_diputadosAttributes, licencias_diputadosCreationAttributes> implements licencias_diputadosAttributes {
  id!: number;
  diputado_id!: string;
  estatus_diputado!: string;
  fecha_inicio!: string;
  fecha_termino!: string;
  diputado_suplente_id?: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // licencias_diputados belongsTo datos_users via diputado_id
  diputado!: datos_users;
  getDiputado!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setDiputado!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createDiputado!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // licencias_diputados belongsTo datos_users via diputado_suplente_id
  diputado_suplente!: datos_users;
  getDiputado_suplente!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setDiputado_suplente!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createDiputado_suplente!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // licencias_diputados belongsTo estatus_diputados via estatus_diputado
  estatus_diputado_estatus_diputado!: estatus_diputados;
  getEstatus_diputado_estatus_diputado!: Sequelize.BelongsToGetAssociationMixin<estatus_diputados>;
  setEstatus_diputado_estatus_diputado!: Sequelize.BelongsToSetAssociationMixin<estatus_diputados, estatus_diputadosId>;
  createEstatus_diputado_estatus_diputado!: Sequelize.BelongsToCreateAssociationMixin<estatus_diputados>;

  static initModel(sequelize: Sequelize.Sequelize): typeof licencias_diputados {
    return licencias_diputados.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    diputado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    estatus_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'estatus_diputados',
        key: 'id'
      }
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_termino: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    diputado_suplente_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'licencias_diputados',
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
        name: "licencias_diputados_diputado_id_foreign",
        using: "BTREE",
        fields: [
          { name: "diputado_id" },
        ]
      },
      {
        name: "licencias_diputados_estatus_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "estatus_diputado" },
        ]
      },
      {
        name: "licencias_diputados_diputado_suplente_id_foreign",
        using: "BTREE",
        fields: [
          { name: "diputado_suplente_id" },
        ]
      },
    ]
  });
  }
}
