import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface diputadasAttributes {
  id: string;
  integrante_legislatura_id: string;
  descripcion?: string;
  short_images?: string;
  images?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type diputadasPk = "id";
export type diputadasId = diputadas[diputadasPk];
export type diputadasOptionalAttributes = "descripcion" | "short_images" | "images" | "created_at" | "updated_at" | "deleted_at";
export type diputadasCreationAttributes = Optional<diputadasAttributes, diputadasOptionalAttributes>;

export class diputadas extends Model<diputadasAttributes, diputadasCreationAttributes> implements diputadasAttributes {
  id!: string;
  integrante_legislatura_id!: string;
  descripcion?: string;
  short_images?: string;
  images?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof diputadas {
    return diputadas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    integrante_legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    short_images: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'diputadas',
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
