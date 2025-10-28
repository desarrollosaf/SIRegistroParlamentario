import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { tomo_debates, tomo_debatesId } from './tomo_debates';

export interface debatesAttributes {
  id: string;
  descripcion: string;
  path: string;
  fecha_debate: string;
  id_tomo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type debatesPk = "id";
export type debatesId = debates[debatesPk];
export type debatesOptionalAttributes = "created_at" | "updated_at";
export type debatesCreationAttributes = Optional<debatesAttributes, debatesOptionalAttributes>;

export class debates extends Model<debatesAttributes, debatesCreationAttributes> implements debatesAttributes {
  id!: string;
  descripcion!: string;
  path!: string;
  fecha_debate!: string;
  id_tomo!: string;
  created_at?: Date;
  updated_at?: Date;

  // debates belongsTo tomo_debates via id_tomo
  id_tomo_tomo_debate!: tomo_debates;
  getId_tomo_tomo_debate!: Sequelize.BelongsToGetAssociationMixin<tomo_debates>;
  setId_tomo_tomo_debate!: Sequelize.BelongsToSetAssociationMixin<tomo_debates, tomo_debatesId>;
  createId_tomo_tomo_debate!: Sequelize.BelongsToCreateAssociationMixin<tomo_debates>;

  static initModel(sequelize: Sequelize.Sequelize): typeof debates {
    return debates.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha_debate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    id_tomo: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'tomo_debates',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'debates',
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
        name: "debates_id_tomo_foreign",
        using: "BTREE",
        fields: [
          { name: "id_tomo" },
        ]
      },
    ]
  });
  }
}
