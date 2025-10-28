import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { distritos, distritosId } from './distritos';
import type { informes, informesId } from './informes';
import type { integrante_comisions, integrante_comisionsId } from './integrante_comisions';
import type { legislaturas, legislaturasId } from './legislaturas';
import type { partidos, partidosId } from './partidos';

export interface integrante_legislaturasAttributes {
  id: string;
  legislatura_id: string;
  dato_user_id: string;
  partido_id: string;
  distrito_id?: string;
  cargo?: string;
  nivel?: number;
  fecha_ingreso?: string;
  dato_dipoficial_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type integrante_legislaturasPk = "id";
export type integrante_legislaturasId = integrante_legislaturas[integrante_legislaturasPk];
export type integrante_legislaturasOptionalAttributes = "distrito_id" | "cargo" | "nivel" | "fecha_ingreso" | "dato_dipoficial_id" | "created_at" | "updated_at" | "deleted_at";
export type integrante_legislaturasCreationAttributes = Optional<integrante_legislaturasAttributes, integrante_legislaturasOptionalAttributes>;

export class integrante_legislaturas extends Model<integrante_legislaturasAttributes, integrante_legislaturasCreationAttributes> implements integrante_legislaturasAttributes {
  id!: string;
  legislatura_id!: string;
  dato_user_id!: string;
  partido_id!: string;
  distrito_id?: string;
  cargo?: string;
  nivel?: number;
  fecha_ingreso?: string;
  dato_dipoficial_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // integrante_legislaturas belongsTo datos_users via dato_dipoficial_id
  dato_dipoficial!: datos_users;
  getDato_dipoficial!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setDato_dipoficial!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createDato_dipoficial!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // integrante_legislaturas belongsTo datos_users via dato_user_id
  dato_user!: datos_users;
  getDato_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setDato_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createDato_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // integrante_legislaturas belongsTo distritos via distrito_id
  distrito!: distritos;
  getDistrito!: Sequelize.BelongsToGetAssociationMixin<distritos>;
  setDistrito!: Sequelize.BelongsToSetAssociationMixin<distritos, distritosId>;
  createDistrito!: Sequelize.BelongsToCreateAssociationMixin<distritos>;
  // integrante_legislaturas hasMany informes via integrante_legislatura_id
  informes!: informes[];
  getInformes!: Sequelize.HasManyGetAssociationsMixin<informes>;
  setInformes!: Sequelize.HasManySetAssociationsMixin<informes, informesId>;
  addInforme!: Sequelize.HasManyAddAssociationMixin<informes, informesId>;
  addInformes!: Sequelize.HasManyAddAssociationsMixin<informes, informesId>;
  createInforme!: Sequelize.HasManyCreateAssociationMixin<informes>;
  removeInforme!: Sequelize.HasManyRemoveAssociationMixin<informes, informesId>;
  removeInformes!: Sequelize.HasManyRemoveAssociationsMixin<informes, informesId>;
  hasInforme!: Sequelize.HasManyHasAssociationMixin<informes, informesId>;
  hasInformes!: Sequelize.HasManyHasAssociationsMixin<informes, informesId>;
  countInformes!: Sequelize.HasManyCountAssociationsMixin;
  // integrante_legislaturas hasMany integrante_comisions via integrante_legislatura_id
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
  // integrante_legislaturas belongsTo legislaturas via legislatura_id
  legislatura!: legislaturas;
  getLegislatura!: Sequelize.BelongsToGetAssociationMixin<legislaturas>;
  setLegislatura!: Sequelize.BelongsToSetAssociationMixin<legislaturas, legislaturasId>;
  createLegislatura!: Sequelize.BelongsToCreateAssociationMixin<legislaturas>;
  // integrante_legislaturas belongsTo partidos via partido_id
  partido!: partidos;
  getPartido!: Sequelize.BelongsToGetAssociationMixin<partidos>;
  setPartido!: Sequelize.BelongsToSetAssociationMixin<partidos, partidosId>;
  createPartido!: Sequelize.BelongsToCreateAssociationMixin<partidos>;

  static initModel(sequelize: Sequelize.Sequelize): typeof integrante_legislaturas {
    return integrante_legislaturas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'legislaturas',
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
    },
    partido_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'partidos',
        key: 'id'
      }
    },
    distrito_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'distritos',
        key: 'id'
      }
    },
    cargo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dato_dipoficial_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'integrante_legislaturas',
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
        name: "integrante_legislaturas_legislatura_id_foreign",
        using: "BTREE",
        fields: [
          { name: "legislatura_id" },
        ]
      },
      {
        name: "integrante_legislaturas_dato_user_id_foreign",
        using: "BTREE",
        fields: [
          { name: "dato_user_id" },
        ]
      },
      {
        name: "integrante_legislaturas_partido_id_foreign",
        using: "BTREE",
        fields: [
          { name: "partido_id" },
        ]
      },
      {
        name: "integrante_legislaturas_distrito_id_foreign",
        using: "BTREE",
        fields: [
          { name: "distrito_id" },
        ]
      },
      {
        name: "integrante_legislaturas_dato_dipoficial_id_foreign",
        using: "BTREE",
        fields: [
          { name: "dato_dipoficial_id" },
        ]
      },
    ]
  });
  }
}
