import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { debates, debatesId } from './debates';

export interface tomo_debatesAttributes {
  id: string;
  tomo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type tomo_debatesPk = "id";
export type tomo_debatesId = tomo_debates[tomo_debatesPk];
export type tomo_debatesOptionalAttributes = "created_at" | "updated_at";
export type tomo_debatesCreationAttributes = Optional<tomo_debatesAttributes, tomo_debatesOptionalAttributes>;

export class tomo_debates extends Model<tomo_debatesAttributes, tomo_debatesCreationAttributes> implements tomo_debatesAttributes {
  id!: string;
  tomo!: string;
  created_at?: Date;
  updated_at?: Date;

  // tomo_debates hasMany debates via id_tomo
  debates!: debates[];
  getDebates!: Sequelize.HasManyGetAssociationsMixin<debates>;
  setDebates!: Sequelize.HasManySetAssociationsMixin<debates, debatesId>;
  addDebate!: Sequelize.HasManyAddAssociationMixin<debates, debatesId>;
  addDebates!: Sequelize.HasManyAddAssociationsMixin<debates, debatesId>;
  createDebate!: Sequelize.HasManyCreateAssociationMixin<debates>;
  removeDebate!: Sequelize.HasManyRemoveAssociationMixin<debates, debatesId>;
  removeDebates!: Sequelize.HasManyRemoveAssociationsMixin<debates, debatesId>;
  hasDebate!: Sequelize.HasManyHasAssociationMixin<debates, debatesId>;
  hasDebates!: Sequelize.HasManyHasAssociationsMixin<debates, debatesId>;
  countDebates!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tomo_debates {
    return tomo_debates.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    tomo: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tomo_debates',
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
