import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { integrante_legislaturas, integrante_legislaturasId } from './integrante_legislaturas';

export interface partidosAttributes {
  id: string;
  siglas: string;
  nombre: string;
  emblema: string;
  rgb: string;
  rgb2: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type partidosPk = "id";
export type partidosId = partidos[partidosPk];
export type partidosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type partidosCreationAttributes = Optional<partidosAttributes, partidosOptionalAttributes>;

export class partidos extends Model<partidosAttributes, partidosCreationAttributes> implements partidosAttributes {
  id!: string;
  siglas!: string;
  nombre!: string;
  emblema!: string;
  rgb!: string;
  rgb2!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // partidos hasMany integrante_legislaturas via partido_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof partidos {
    return partidos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    siglas: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    emblema: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rgb: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rgb2: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'partidos',
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
    ]
  });
  }
}
