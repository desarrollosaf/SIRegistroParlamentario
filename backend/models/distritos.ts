import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { integrante_legislaturas, integrante_legislaturasId } from './integrante_legislaturas';
import type { municipios, municipiosId } from './municipios';

export interface distritosAttributes {
  id: string;
  distrito: string;
  municipio_id?: string;
  orden: number;
  created_at?: Date;
  updated_at?: Date;
}

export type distritosPk = "id";
export type distritosId = distritos[distritosPk];
export type distritosOptionalAttributes = "municipio_id" | "created_at" | "updated_at";
export type distritosCreationAttributes = Optional<distritosAttributes, distritosOptionalAttributes>;

export class distritos extends Model<distritosAttributes, distritosCreationAttributes> implements distritosAttributes {
  id!: string;
  distrito!: string;
  municipio_id?: string;
  orden!: number;
  created_at?: Date;
  updated_at?: Date;

  // distritos hasMany integrante_legislaturas via distrito_id
  integrante_legislaturas!: integrante_legislaturas[];
  getIntegrante_legislaturas!: Sequelize.HasManyGetAssociationsMixin<integrante_legislaturas>;
  setIntegrante_legislaturas!: Sequelize.HasManySetAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  addIntegrante_legislatura!: Sequelize.HasManyAddAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  addIntegrante_legislaturas!: Sequelize.HasManyAddAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  createIntegrante_legislatura!: Sequelize.HasManyCreateAssociationMixin<integrante_legislaturas>;
  removeIntegrante_legislatura!: Sequelize.HasManyRemoveAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  removeIntegrante_legislaturas!: Sequelize.HasManyRemoveAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  hasIntegrante_legislatura!: Sequelize.HasManyHasAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  hasIntegrante_legislaturas!: Sequelize.HasManyHasAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  countIntegrante_legislaturas!: Sequelize.HasManyCountAssociationsMixin;
  // distritos belongsTo municipios via municipio_id
  municipio!: municipios;
  getMunicipio!: Sequelize.BelongsToGetAssociationMixin<municipios>;
  setMunicipio!: Sequelize.BelongsToSetAssociationMixin<municipios, municipiosId>;
  createMunicipio!: Sequelize.BelongsToCreateAssociationMixin<municipios>;

  static initModel(sequelize: Sequelize.Sequelize): typeof distritos {
    return distritos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    distrito: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    municipio_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id'
      }
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'distritos',
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
        name: "distritos_municipio_id_foreign",
        using: "BTREE",
        fields: [
          { name: "municipio_id" },
        ]
      },
    ]
  });
  }
}
