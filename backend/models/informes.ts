import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { integrante_legislaturas, integrante_legislaturasId } from './integrante_legislaturas';
import type { leyes_informes, leyes_informesId } from './leyes_informes';

export interface informesAttributes {
  id: string;
  integrante_legislatura_id: string;
  path: string;
  foto_principal: string;
  foto_ficha: string;
  foto_descarga: string;
  liga?: string;
  fecha_inter?: string;
  header_dip: string;
  type: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type informesPk = "id";
export type informesId = informes[informesPk];
export type informesOptionalAttributes = "liga" | "fecha_inter" | "type" | "created_at" | "updated_at" | "deleted_at";
export type informesCreationAttributes = Optional<informesAttributes, informesOptionalAttributes>;

export class informes extends Model<informesAttributes, informesCreationAttributes> implements informesAttributes {
  id!: string;
  integrante_legislatura_id!: string;
  path!: string;
  foto_principal!: string;
  foto_ficha!: string;
  foto_descarga!: string;
  liga?: string;
  fecha_inter?: string;
  header_dip!: string;
  type!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // informes hasMany leyes_informes via informes_id
  leyes_informes!: leyes_informes[];
  getLeyes_informes!: Sequelize.HasManyGetAssociationsMixin<leyes_informes>;
  setLeyes_informes!: Sequelize.HasManySetAssociationsMixin<leyes_informes, leyes_informesId>;
  addLeyes_informe!: Sequelize.HasManyAddAssociationMixin<leyes_informes, leyes_informesId>;
  addLeyes_informes!: Sequelize.HasManyAddAssociationsMixin<leyes_informes, leyes_informesId>;
  createLeyes_informe!: Sequelize.HasManyCreateAssociationMixin<leyes_informes>;
  removeLeyes_informe!: Sequelize.HasManyRemoveAssociationMixin<leyes_informes, leyes_informesId>;
  removeLeyes_informes!: Sequelize.HasManyRemoveAssociationsMixin<leyes_informes, leyes_informesId>;
  hasLeyes_informe!: Sequelize.HasManyHasAssociationMixin<leyes_informes, leyes_informesId>;
  hasLeyes_informes!: Sequelize.HasManyHasAssociationsMixin<leyes_informes, leyes_informesId>;
  countLeyes_informes!: Sequelize.HasManyCountAssociationsMixin;
  // informes belongsTo integrante_legislaturas via integrante_legislatura_id
  integrante_legislatura!: integrante_legislaturas;
  getIntegrante_legislatura!: Sequelize.BelongsToGetAssociationMixin<integrante_legislaturas>;
  setIntegrante_legislatura!: Sequelize.BelongsToSetAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  createIntegrante_legislatura!: Sequelize.BelongsToCreateAssociationMixin<integrante_legislaturas>;

  static initModel(sequelize: Sequelize.Sequelize): typeof informes {
    return informes.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    integrante_legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'integrante_legislaturas',
        key: 'id'
      }
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    foto_principal: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    foto_ficha: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    foto_descarga: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    liga: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_inter: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    header_dip: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'informes',
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
        name: "informes_integrante_legislatura_id_foreign",
        using: "BTREE",
        fields: [
          { name: "integrante_legislatura_id" },
        ]
      },
    ]
  });
  }
}
