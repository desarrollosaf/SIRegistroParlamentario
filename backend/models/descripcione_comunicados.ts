import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comunicados, comunicadosId } from './comunicados';

export interface descripcione_comunicadosAttributes {
  id: string;
  bullets: string;
  comunicado_id: string;
  orden: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type descripcione_comunicadosPk = "id";
export type descripcione_comunicadosId = descripcione_comunicados[descripcione_comunicadosPk];
export type descripcione_comunicadosOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type descripcione_comunicadosCreationAttributes = Optional<descripcione_comunicadosAttributes, descripcione_comunicadosOptionalAttributes>;

export class descripcione_comunicados extends Model<descripcione_comunicadosAttributes, descripcione_comunicadosCreationAttributes> implements descripcione_comunicadosAttributes {
  id!: string;
  bullets!: string;
  comunicado_id!: string;
  orden!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // descripcione_comunicados belongsTo comunicados via comunicado_id
  comunicado!: comunicados;
  getComunicado!: Sequelize.BelongsToGetAssociationMixin<comunicados>;
  setComunicado!: Sequelize.BelongsToSetAssociationMixin<comunicados, comunicadosId>;
  createComunicado!: Sequelize.BelongsToCreateAssociationMixin<comunicados>;

  static initModel(sequelize: Sequelize.Sequelize): typeof descripcione_comunicados {
    return descripcione_comunicados.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    bullets: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    comunicado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'comunicados',
        key: 'id'
      }
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'descripcione_comunicados',
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
        name: "descripcione_comunicados_comunicado_id_foreign",
        using: "BTREE",
        fields: [
          { name: "comunicado_id" },
        ]
      },
    ]
  });
  }
}
