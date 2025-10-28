import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comisions, comisionsId } from './comisions';
import type { integrante_legislaturas, integrante_legislaturasId } from './integrante_legislaturas';
import type { tipo_cargo_comisions, tipo_cargo_comisionsId } from './tipo_cargo_comisions';

export interface integrante_comisionsAttributes {
  id: string;
  comision_id: string;
  integrante_legislatura_id: string;
  tipo_cargo_comision_id: string;
  nivel?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type integrante_comisionsPk = "id";
export type integrante_comisionsId = integrante_comisions[integrante_comisionsPk];
export type integrante_comisionsOptionalAttributes = "nivel" | "created_at" | "updated_at" | "deleted_at";
export type integrante_comisionsCreationAttributes = Optional<integrante_comisionsAttributes, integrante_comisionsOptionalAttributes>;

export class integrante_comisions extends Model<integrante_comisionsAttributes, integrante_comisionsCreationAttributes> implements integrante_comisionsAttributes {
  id!: string;
  comision_id!: string;
  integrante_legislatura_id!: string;
  tipo_cargo_comision_id!: string;
  nivel?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // integrante_comisions belongsTo comisions via comision_id
  comision!: comisions;
  getComision!: Sequelize.BelongsToGetAssociationMixin<comisions>;
  setComision!: Sequelize.BelongsToSetAssociationMixin<comisions, comisionsId>;
  createComision!: Sequelize.BelongsToCreateAssociationMixin<comisions>;
  // integrante_comisions belongsTo integrante_legislaturas via integrante_legislatura_id
  integrante_legislatura!: integrante_legislaturas;
  getIntegrante_legislatura!: Sequelize.BelongsToGetAssociationMixin<integrante_legislaturas>;
  setIntegrante_legislatura!: Sequelize.BelongsToSetAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  createIntegrante_legislatura!: Sequelize.BelongsToCreateAssociationMixin<integrante_legislaturas>;
  // integrante_comisions belongsTo tipo_cargo_comisions via tipo_cargo_comision_id
  tipo_cargo_comision!: tipo_cargo_comisions;
  getTipo_cargo_comision!: Sequelize.BelongsToGetAssociationMixin<tipo_cargo_comisions>;
  setTipo_cargo_comision!: Sequelize.BelongsToSetAssociationMixin<tipo_cargo_comisions, tipo_cargo_comisionsId>;
  createTipo_cargo_comision!: Sequelize.BelongsToCreateAssociationMixin<tipo_cargo_comisions>;

  static initModel(sequelize: Sequelize.Sequelize): typeof integrante_comisions {
    return integrante_comisions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'comisions',
        key: 'id'
      }
    },
    integrante_legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'integrante_legislaturas',
        key: 'id'
      }
    },
    tipo_cargo_comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'tipo_cargo_comisions',
        key: 'id'
      }
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'integrante_comisions',
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
        name: "integrante_comisions_comision_id_foreign",
        using: "BTREE",
        fields: [
          { name: "comision_id" },
        ]
      },
      {
        name: "integrante_comisions_integrante_legislatura_id_foreign",
        using: "BTREE",
        fields: [
          { name: "integrante_legislatura_id" },
        ]
      },
      {
        name: "integrante_comisions_tipo_cargo_comision_id_foreign",
        using: "BTREE",
        fields: [
          { name: "tipo_cargo_comision_id" },
        ]
      },
    ]
  });
  }
}
