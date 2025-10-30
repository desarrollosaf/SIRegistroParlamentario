import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { presentan_puntos, presentan_puntosId } from './presentan_puntos';

export interface tipo_presentasAttributes {
  id: string;
  tipo: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type tipo_presentasPk = "id";
export type tipo_presentasId = tipo_presentas[tipo_presentasPk];
export type tipo_presentasOptionalAttributes = "status" | "created_at" | "updated_at" | "deleted_at";
export type tipo_presentasCreationAttributes = Optional<tipo_presentasAttributes, tipo_presentasOptionalAttributes>;

export class tipo_presentas extends Model<tipo_presentasAttributes, tipo_presentasCreationAttributes> implements tipo_presentasAttributes {
  id!: string;
  tipo!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // tipo_presentas hasMany presentan_puntos via id_tipo_presenta
  presentan_puntos!: presentan_puntos[];
  getPresentan_puntos!: Sequelize.HasManyGetAssociationsMixin<presentan_puntos>;
  setPresentan_puntos!: Sequelize.HasManySetAssociationsMixin<presentan_puntos, presentan_puntosId>;
  addPresentan_punto!: Sequelize.HasManyAddAssociationMixin<presentan_puntos, presentan_puntosId>;
  addPresentan_puntos!: Sequelize.HasManyAddAssociationsMixin<presentan_puntos, presentan_puntosId>;
  createPresentan_punto!: Sequelize.HasManyCreateAssociationMixin<presentan_puntos>;
  removePresentan_punto!: Sequelize.HasManyRemoveAssociationMixin<presentan_puntos, presentan_puntosId>;
  removePresentan_puntos!: Sequelize.HasManyRemoveAssociationsMixin<presentan_puntos, presentan_puntosId>;
  hasPresentan_punto!: Sequelize.HasManyHasAssociationMixin<presentan_puntos, presentan_puntosId>;
  hasPresentan_puntos!: Sequelize.HasManyHasAssociationsMixin<presentan_puntos, presentan_puntosId>;
  countPresentan_puntos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_presentas {
    return tipo_presentas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'tipo_presentas',
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
