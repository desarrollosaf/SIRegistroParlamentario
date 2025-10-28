import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comunicados, comunicadosId } from './comunicados';

export interface autores_comunicadosAttributes {
  id: string;
  comunicado_id: string;
  tipo_autor_id: string;
  autor_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type autores_comunicadosPk = "id";
export type autores_comunicadosId = autores_comunicados[autores_comunicadosPk];
export type autores_comunicadosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type autores_comunicadosCreationAttributes = Optional<autores_comunicadosAttributes, autores_comunicadosOptionalAttributes>;

export class autores_comunicados extends Model<autores_comunicadosAttributes, autores_comunicadosCreationAttributes> implements autores_comunicadosAttributes {
  id!: string;
  comunicado_id!: string;
  tipo_autor_id!: string;
  autor_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // autores_comunicados belongsTo comunicados via comunicado_id
  comunicado!: comunicados;
  getComunicado!: Sequelize.BelongsToGetAssociationMixin<comunicados>;
  setComunicado!: Sequelize.BelongsToSetAssociationMixin<comunicados, comunicadosId>;
  createComunicado!: Sequelize.BelongsToCreateAssociationMixin<comunicados>;

  static initModel(sequelize: Sequelize.Sequelize): typeof autores_comunicados {
    return autores_comunicados.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    comunicado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'comunicados',
        key: 'id'
      }
    },
    tipo_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'autores_comunicados',
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
      {
        name: "autores_comunicados_comunicado_id_foreign",
        using: "BTREE",
        fields: [
          { name: "comunicado_id" },
        ]
      },
    ]
  });
  }
}
