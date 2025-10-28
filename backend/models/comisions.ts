import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { integrante_comisions, integrante_comisionsId } from './integrante_comisions';
import type { tipo_comisions, tipo_comisionsId } from './tipo_comisions';
import type { turno_comisions, turno_comisionsId } from './turno_comisions';

export interface comisionsAttributes {
  id: string;
  nombre: string;
  importancia?: string;
  tipo_comision_id: string;
  alias?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type comisionsPk = "id";
export type comisionsId = comisions[comisionsPk];
export type comisionsOptionalAttributes = "importancia" | "alias" | "created_at" | "updated_at" | "deleted_at";
export type comisionsCreationAttributes = Optional<comisionsAttributes, comisionsOptionalAttributes>;

export class comisions extends Model<comisionsAttributes, comisionsCreationAttributes> implements comisionsAttributes {
  id!: string;
  nombre!: string;
  importancia?: string;
  tipo_comision_id!: string;
  alias?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // comisions hasMany integrante_comisions via comision_id
  integrante_comisions!: integrante_comisions[];
  getIntegrante_comisions!: Sequelize.HasManyGetAssociationsMixin<integrante_comisions>;
  setIntegrante_comisions!: Sequelize.HasManySetAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  addIntegrante_comision!: Sequelize.HasManyAddAssociationMixin<integrante_comisions, integrante_comisionsId>;
  addIntegrante_comisions!: Sequelize.HasManyAddAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  createIntegrante_comision!: Sequelize.HasManyCreateAssociationMixin<integrante_comisions>;
  removeIntegrante_comision!: Sequelize.HasManyRemoveAssociationMixin<integrante_comisions, integrante_comisionsId>;
  removeIntegrante_comisions!: Sequelize.HasManyRemoveAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  hasIntegrante_comision!: Sequelize.HasManyHasAssociationMixin<integrante_comisions, integrante_comisionsId>;
  hasIntegrante_comisions!: Sequelize.HasManyHasAssociationsMixin<integrante_comisions, integrante_comisionsId>;
  countIntegrante_comisions!: Sequelize.HasManyCountAssociationsMixin;
  // comisions hasMany turno_comisions via id_comision
  turno_comisions!: turno_comisions[];
  getTurno_comisions!: Sequelize.HasManyGetAssociationsMixin<turno_comisions>;
  setTurno_comisions!: Sequelize.HasManySetAssociationsMixin<turno_comisions, turno_comisionsId>;
  addTurno_comision!: Sequelize.HasManyAddAssociationMixin<turno_comisions, turno_comisionsId>;
  addTurno_comisions!: Sequelize.HasManyAddAssociationsMixin<turno_comisions, turno_comisionsId>;
  createTurno_comision!: Sequelize.HasManyCreateAssociationMixin<turno_comisions>;
  removeTurno_comision!: Sequelize.HasManyRemoveAssociationMixin<turno_comisions, turno_comisionsId>;
  removeTurno_comisions!: Sequelize.HasManyRemoveAssociationsMixin<turno_comisions, turno_comisionsId>;
  hasTurno_comision!: Sequelize.HasManyHasAssociationMixin<turno_comisions, turno_comisionsId>;
  hasTurno_comisions!: Sequelize.HasManyHasAssociationsMixin<turno_comisions, turno_comisionsId>;
  countTurno_comisions!: Sequelize.HasManyCountAssociationsMixin;
  // comisions belongsTo tipo_comisions via tipo_comision_id
  tipo_comision!: tipo_comisions;
  getTipo_comision!: Sequelize.BelongsToGetAssociationMixin<tipo_comisions>;
  setTipo_comision!: Sequelize.BelongsToSetAssociationMixin<tipo_comisions, tipo_comisionsId>;
  createTipo_comision!: Sequelize.BelongsToCreateAssociationMixin<tipo_comisions>;

  static initModel(sequelize: Sequelize.Sequelize): typeof comisions {
    return comisions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    importancia: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipo_comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'tipo_comisions',
        key: 'id'
      }
    },
    alias: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'comisions',
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
        name: "comisions_tipo_comision_id_foreign",
        using: "BTREE",
        fields: [
          { name: "tipo_comision_id" },
        ]
      },
    ]
  });
  }
}
