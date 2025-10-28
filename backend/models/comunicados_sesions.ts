import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comunicados, comunicadosId } from './comunicados';
import type { sesiones, sesionesId } from './sesiones';

export interface comunicados_sesionsAttributes {
  id: string;
  id_sesion: string;
  comunicado_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export type comunicados_sesionsPk = "id";
export type comunicados_sesionsId = comunicados_sesions[comunicados_sesionsPk];
export type comunicados_sesionsOptionalAttributes = "created_at" | "updated_at";
export type comunicados_sesionsCreationAttributes = Optional<comunicados_sesionsAttributes, comunicados_sesionsOptionalAttributes>;

export class comunicados_sesions extends Model<comunicados_sesionsAttributes, comunicados_sesionsCreationAttributes> implements comunicados_sesionsAttributes {
  id!: string;
  id_sesion!: string;
  comunicado_id!: string;
  created_at?: Date;
  updated_at?: Date;

  // comunicados_sesions belongsTo comunicados via comunicado_id
  comunicado!: comunicados;
  getComunicado!: Sequelize.BelongsToGetAssociationMixin<comunicados>;
  setComunicado!: Sequelize.BelongsToSetAssociationMixin<comunicados, comunicadosId>;
  createComunicado!: Sequelize.BelongsToCreateAssociationMixin<comunicados>;
  // comunicados_sesions belongsTo sesiones via id_sesion
  id_sesion_sesione!: sesiones;
  getId_sesion_sesione!: Sequelize.BelongsToGetAssociationMixin<sesiones>;
  setId_sesion_sesione!: Sequelize.BelongsToSetAssociationMixin<sesiones, sesionesId>;
  createId_sesion_sesione!: Sequelize.BelongsToCreateAssociationMixin<sesiones>;

  static initModel(sequelize: Sequelize.Sequelize): typeof comunicados_sesions {
    return comunicados_sesions.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_sesion: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id'
      }
    },
    comunicado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'comunicados',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'comunicados_sesions',
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
        name: "comunicados_sesions_id_sesion_foreign",
        using: "BTREE",
        fields: [
          { name: "id_sesion" },
        ]
      },
      {
        name: "comunicados_sesions_comunicado_id_foreign",
        using: "BTREE",
        fields: [
          { name: "comunicado_id" },
        ]
      },
    ]
  });
  }
}
