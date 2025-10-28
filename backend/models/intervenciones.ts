import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface intervencionesAttributes {
  id: string;
  id_punto?: string;
  id_evento?: string;
  id_diputado?: string;
  id_tipo_intervencion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type intervencionesPk = "id";
export type intervencionesId = intervenciones[intervencionesPk];
export type intervencionesOptionalAttributes = "id_punto" | "id_evento" | "id_diputado" | "id_tipo_intervencion" | "created_at" | "updated_at";
export type intervencionesCreationAttributes = Optional<intervencionesAttributes, intervencionesOptionalAttributes>;

export class intervenciones extends Model<intervencionesAttributes, intervencionesCreationAttributes> implements intervencionesAttributes {
  id!: string;
  id_punto?: string;
  id_evento?: string;
  id_diputado?: string;
  id_tipo_intervencion?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof intervenciones {
    return intervenciones.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_tipo_intervencion: {
      type: DataTypes.CHAR(36),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'intervenciones',
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
