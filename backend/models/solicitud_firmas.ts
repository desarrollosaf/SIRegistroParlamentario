import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';

export interface solicitud_firmasAttributes {
  id: string;
  id_diputado: string;
  password: string;
  fecha_solicitud: string;
  fecha_atencion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type solicitud_firmasPk = "id";
export type solicitud_firmasId = solicitud_firmas[solicitud_firmasPk];
export type solicitud_firmasOptionalAttributes = "fecha_atencion" | "created_at" | "updated_at";
export type solicitud_firmasCreationAttributes = Optional<solicitud_firmasAttributes, solicitud_firmasOptionalAttributes>;

export class solicitud_firmas extends Model<solicitud_firmasAttributes, solicitud_firmasCreationAttributes> implements solicitud_firmasAttributes {
  id!: string;
  id_diputado!: string;
  password!: string;
  fecha_solicitud!: string;
  fecha_atencion?: string;
  created_at?: Date;
  updated_at?: Date;

  // solicitud_firmas belongsTo datos_users via id_diputado
  id_diputado_datos_user!: datos_users;
  getId_diputado_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_diputado_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_diputado_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof solicitud_firmas {
    return solicitud_firmas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha_solicitud: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_atencion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'solicitud_firmas',
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
        name: "solicitud_firmas_id_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "id_diputado" },
        ]
      },
    ]
  });
  }
}
