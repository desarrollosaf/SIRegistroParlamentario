import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { documentos, documentosId } from './documentos';

export interface turnosAttributes {
  id: string;
  id_documento: string;
  id_diputado: string;
  firmado: number;
  nivel?: number;
  fecha_firma?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type turnosPk = "id";
export type turnosId = turnos[turnosPk];
export type turnosOptionalAttributes = "firmado" | "nivel" | "fecha_firma" | "created_at" | "updated_at";
export type turnosCreationAttributes = Optional<turnosAttributes, turnosOptionalAttributes>;

export class turnos extends Model<turnosAttributes, turnosCreationAttributes> implements turnosAttributes {
  id!: string;
  id_documento!: string;
  id_diputado!: string;
  firmado!: number;
  nivel?: number;
  fecha_firma?: Date;
  created_at?: Date;
  updated_at?: Date;

  // turnos belongsTo datos_users via id_diputado
  id_diputado_datos_user!: datos_users;
  getId_diputado_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_diputado_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_diputado_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // turnos belongsTo documentos via id_documento
  id_documento_documento!: documentos;
  getId_documento_documento!: Sequelize.BelongsToGetAssociationMixin<documentos>;
  setId_documento_documento!: Sequelize.BelongsToSetAssociationMixin<documentos, documentosId>;
  createId_documento_documento!: Sequelize.BelongsToCreateAssociationMixin<documentos>;

  static initModel(sequelize: Sequelize.Sequelize): typeof turnos {
    return turnos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_documento: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'documentos',
        key: 'id'
      }
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    firmado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_firma: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'turnos',
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
        name: "turnos_id_documento_foreign",
        using: "BTREE",
        fields: [
          { name: "id_documento" },
        ]
      },
      {
        name: "turnos_id_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "id_diputado" },
        ]
      },
    ]
  });
  }
}
