import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { integrante_legislaturas, integrante_legislaturasId } from './integrante_legislaturas';

export interface legislaturasAttributes {
  id: string;
  numero: string;
  fecha_inicio: string;
  fecha_fin: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type legislaturasPk = "id";
export type legislaturasId = legislaturas[legislaturasPk];
export type legislaturasOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type legislaturasCreationAttributes = Optional<legislaturasAttributes, legislaturasOptionalAttributes>;

export class legislaturas extends Model<legislaturasAttributes, legislaturasCreationAttributes> implements legislaturasAttributes {
  id!: string;
  numero!: string;
  fecha_inicio!: string;
  fecha_fin!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // legislaturas hasMany integrante_legislaturas via legislatura_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof legislaturas {
    return legislaturas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    numero: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'legislaturas',
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
