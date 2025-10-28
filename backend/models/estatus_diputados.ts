import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { licencias_diputados, licencias_diputadosId } from './licencias_diputados';
import type { movimientos_diputados, movimientos_diputadosId } from './movimientos_diputados';

export interface estatus_diputadosAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type estatus_diputadosPk = "id";
export type estatus_diputadosId = estatus_diputados[estatus_diputadosPk];
export type estatus_diputadosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type estatus_diputadosCreationAttributes = Optional<estatus_diputadosAttributes, estatus_diputadosOptionalAttributes>;

export class estatus_diputados extends Model<estatus_diputadosAttributes, estatus_diputadosCreationAttributes> implements estatus_diputadosAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // estatus_diputados hasMany licencias_diputados via estatus_diputado
  licencias_diputados!: licencias_diputados[];
  getLicencias_diputados!: Sequelize.HasManyGetAssociationsMixin<licencias_diputados>;
  setLicencias_diputados!: Sequelize.HasManySetAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  addLicencias_diputado!: Sequelize.HasManyAddAssociationMixin<licencias_diputados, licencias_diputadosId>;
  addLicencias_diputados!: Sequelize.HasManyAddAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  createLicencias_diputado!: Sequelize.HasManyCreateAssociationMixin<licencias_diputados>;
  removeLicencias_diputado!: Sequelize.HasManyRemoveAssociationMixin<licencias_diputados, licencias_diputadosId>;
  removeLicencias_diputados!: Sequelize.HasManyRemoveAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  hasLicencias_diputado!: Sequelize.HasManyHasAssociationMixin<licencias_diputados, licencias_diputadosId>;
  hasLicencias_diputados!: Sequelize.HasManyHasAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  countLicencias_diputados!: Sequelize.HasManyCountAssociationsMixin;
  // estatus_diputados hasMany movimientos_diputados via estatus_diputado_id
  movimientos_diputados!: movimientos_diputados[];
  getMovimientos_diputados!: Sequelize.HasManyGetAssociationsMixin<movimientos_diputados>;
  setMovimientos_diputados!: Sequelize.HasManySetAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  addMovimientos_diputado!: Sequelize.HasManyAddAssociationMixin<movimientos_diputados, movimientos_diputadosId>;
  addMovimientos_diputados!: Sequelize.HasManyAddAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  createMovimientos_diputado!: Sequelize.HasManyCreateAssociationMixin<movimientos_diputados>;
  removeMovimientos_diputado!: Sequelize.HasManyRemoveAssociationMixin<movimientos_diputados, movimientos_diputadosId>;
  removeMovimientos_diputados!: Sequelize.HasManyRemoveAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  hasMovimientos_diputado!: Sequelize.HasManyHasAssociationMixin<movimientos_diputados, movimientos_diputadosId>;
  hasMovimientos_diputados!: Sequelize.HasManyHasAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  countMovimientos_diputados!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof estatus_diputados {
    return estatus_diputados.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'estatus_diputados',
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
