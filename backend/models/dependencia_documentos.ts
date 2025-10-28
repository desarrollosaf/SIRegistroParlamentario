import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { marco_j_s, marco_j_sId } from './marco_j_s';

export interface dependencia_documentosAttributes {
  id: number;
  id_marcoj?: number;
  id_Dependencia?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type dependencia_documentosPk = "id";
export type dependencia_documentosId = dependencia_documentos[dependencia_documentosPk];
export type dependencia_documentosOptionalAttributes = "id" | "id_marcoj" | "id_Dependencia" | "status" | "created_at" | "updated_at";
export type dependencia_documentosCreationAttributes = Optional<dependencia_documentosAttributes, dependencia_documentosOptionalAttributes>;

export class dependencia_documentos extends Model<dependencia_documentosAttributes, dependencia_documentosCreationAttributes> implements dependencia_documentosAttributes {
  id!: number;
  id_marcoj?: number;
  id_Dependencia?: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // dependencia_documentos belongsTo marco_j_s via id_marcoj
  id_marcoj_marco_j_!: marco_j_s;
  getId_marcoj_marco_j_!: Sequelize.BelongsToGetAssociationMixin<marco_j_s>;
  setId_marcoj_marco_j_!: Sequelize.BelongsToSetAssociationMixin<marco_j_s, marco_j_sId>;
  createId_marcoj_marco_j_!: Sequelize.BelongsToCreateAssociationMixin<marco_j_s>;

  static initModel(sequelize: Sequelize.Sequelize): typeof dependencia_documentos {
    return dependencia_documentos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_marcoj: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'marco_j_s',
        key: 'id'
      }
    },
    id_Dependencia: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'dependencia_documentos',
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
        name: "dependencia_documentos_id_marcoj_foreign",
        using: "BTREE",
        fields: [
          { name: "id_marcoj" },
        ]
      },
    ]
  });
  }
}
