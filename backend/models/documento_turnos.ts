import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { documentos, documentosId } from './documentos';

export interface documento_turnosAttributes {
  id: string;
  documento_id: string;
  tipo_turno?: string;
  turno_firmante?: string;
  id_comision_partido?: string;
  texto?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type documento_turnosPk = "id";
export type documento_turnosId = documento_turnos[documento_turnosPk];
export type documento_turnosOptionalAttributes = "tipo_turno" | "turno_firmante" | "id_comision_partido" | "texto" | "created_at" | "updated_at";
export type documento_turnosCreationAttributes = Optional<documento_turnosAttributes, documento_turnosOptionalAttributes>;

export class documento_turnos extends Model<documento_turnosAttributes, documento_turnosCreationAttributes> implements documento_turnosAttributes {
  id!: string;
  documento_id!: string;
  tipo_turno?: string;
  turno_firmante?: string;
  id_comision_partido?: string;
  texto?: string;
  created_at?: Date;
  updated_at?: Date;

  // documento_turnos belongsTo documentos via documento_id
  documento!: documentos;
  getDocumento!: Sequelize.BelongsToGetAssociationMixin<documentos>;
  setDocumento!: Sequelize.BelongsToSetAssociationMixin<documentos, documentosId>;
  createDocumento!: Sequelize.BelongsToCreateAssociationMixin<documentos>;

  static initModel(sequelize: Sequelize.Sequelize): typeof documento_turnos {
    return documento_turnos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    documento_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'documentos',
        key: 'id'
      }
    },
    tipo_turno: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    turno_firmante: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_comision_partido: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'documento_turnos',
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
        name: "documento_turnos_documento_id_foreign",
        using: "BTREE",
        fields: [
          { name: "documento_id" },
        ]
      },
    ]
  });
  }
}
