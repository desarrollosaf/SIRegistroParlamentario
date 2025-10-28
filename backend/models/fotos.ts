import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface fotosAttributes {
  id: string;
  path: string;
  fotoable_id: string;
  fotoable_type: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type fotosPk = "id";
export type fotosId = fotos[fotosPk];
export type fotosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type fotosCreationAttributes = Optional<fotosAttributes, fotosOptionalAttributes>;

export class fotos extends Model<fotosAttributes, fotosCreationAttributes> implements fotosAttributes {
  id!: string;
  path!: string;
  fotoable_id!: string;
  fotoable_type!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof fotos {
    return fotos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fotoable_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    fotoable_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'fotos',
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
