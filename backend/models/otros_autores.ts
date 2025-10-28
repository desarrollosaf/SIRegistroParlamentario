import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface otros_autoresAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type otros_autoresPk = "id";
export type otros_autoresId = otros_autores[otros_autoresPk];
export type otros_autoresOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type otros_autoresCreationAttributes = Optional<otros_autoresAttributes, otros_autoresOptionalAttributes>;

export class otros_autores extends Model<otros_autoresAttributes, otros_autoresCreationAttributes> implements otros_autoresAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof otros_autores {
    return otros_autores.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'otros_autores',
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
