import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { iniciativas, iniciativasId } from './iniciativas';

export interface decreto_iniciativasAttributes {
  id: string;
  fecha_decreto: string;
  numero_decreto: number;
  nombre_decreto: string;
  iniciativa_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export type decreto_iniciativasPk = "id";
export type decreto_iniciativasId = decreto_iniciativas[decreto_iniciativasPk];
export type decreto_iniciativasOptionalAttributes = "created_at" | "updated_at";
export type decreto_iniciativasCreationAttributes = Optional<decreto_iniciativasAttributes, decreto_iniciativasOptionalAttributes>;

export class decreto_iniciativas extends Model<decreto_iniciativasAttributes, decreto_iniciativasCreationAttributes> implements decreto_iniciativasAttributes {
  id!: string;
  fecha_decreto!: string;
  numero_decreto!: number;
  nombre_decreto!: string;
  iniciativa_id!: string;
  created_at?: Date;
  updated_at?: Date;

  // decreto_iniciativas belongsTo iniciativas via iniciativa_id
  iniciativa!: iniciativas;
  getIniciativa!: Sequelize.BelongsToGetAssociationMixin<iniciativas>;
  setIniciativa!: Sequelize.BelongsToSetAssociationMixin<iniciativas, iniciativasId>;
  createIniciativa!: Sequelize.BelongsToCreateAssociationMixin<iniciativas>;

  static initModel(sequelize: Sequelize.Sequelize): typeof decreto_iniciativas {
    return decreto_iniciativas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    fecha_decreto: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    numero_decreto: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    nombre_decreto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    iniciativa_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'iniciativas',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'decreto_iniciativas',
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
        name: "decreto_iniciativas_iniciativa_id_foreign",
        using: "BTREE",
        fields: [
          { name: "iniciativa_id" },
        ]
      },
    ]
  });
  }
}
