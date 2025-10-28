import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { distritos, distritosId } from './distritos';

export interface municipiosAttributes {
  id: string;
  municipio: string;
  cabecera: string;
  created_at?: Date;
  updated_at?: Date;
}

export type municipiosPk = "id";
export type municipiosId = municipios[municipiosPk];
export type municipiosOptionalAttributes = "created_at" | "updated_at";
export type municipiosCreationAttributes = Optional<municipiosAttributes, municipiosOptionalAttributes>;

export class municipios extends Model<municipiosAttributes, municipiosCreationAttributes> implements municipiosAttributes {
  id!: string;
  municipio!: string;
  cabecera!: string;
  created_at?: Date;
  updated_at?: Date;

  // municipios hasMany distritos via municipio_id
  distritos!: distritos[];
  getDistritos!: Sequelize.HasManyGetAssociationsMixin<distritos>;
  setDistritos!: Sequelize.HasManySetAssociationsMixin<distritos, distritosId>;
  addDistrito!: Sequelize.HasManyAddAssociationMixin<distritos, distritosId>;
  addDistritos!: Sequelize.HasManyAddAssociationsMixin<distritos, distritosId>;
  createDistrito!: Sequelize.HasManyCreateAssociationMixin<distritos>;
  removeDistrito!: Sequelize.HasManyRemoveAssociationMixin<distritos, distritosId>;
  removeDistritos!: Sequelize.HasManyRemoveAssociationsMixin<distritos, distritosId>;
  hasDistrito!: Sequelize.HasManyHasAssociationMixin<distritos, distritosId>;
  hasDistritos!: Sequelize.HasManyHasAssociationsMixin<distritos, distritosId>;
  countDistritos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof municipios {
    return municipios.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    municipio: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cabecera: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'municipios',
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
    ]
  });
  }
}
