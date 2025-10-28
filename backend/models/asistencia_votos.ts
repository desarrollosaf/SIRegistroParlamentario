import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { sesiones, sesionesId } from './sesiones';

export interface asistencia_votosAttributes {
  id: string;
  mensaje: string;
  timestamp: Date;
  status: number;
  id_diputado: string;
  id_sesion: string;
  votacionActiva: string;
  banderaC?: number;
  randomCU?: string;
  tiempoVotacion?: Date;
  tiempoVotacionInicio?: Date;
  usuario_registra?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type asistencia_votosPk = "id";
export type asistencia_votosId = asistencia_votos[asistencia_votosPk];
export type asistencia_votosOptionalAttributes = "timestamp" | "banderaC" | "randomCU" | "tiempoVotacion" | "tiempoVotacionInicio" | "usuario_registra" | "created_at" | "updated_at" | "deleted_at";
export type asistencia_votosCreationAttributes = Optional<asistencia_votosAttributes, asistencia_votosOptionalAttributes>;

export class asistencia_votos extends Model<asistencia_votosAttributes, asistencia_votosCreationAttributes> implements asistencia_votosAttributes {
  id!: string;
  mensaje!: string;
  timestamp!: Date;
  status!: number;
  id_diputado!: string;
  id_sesion!: string;
  votacionActiva!: string;
  banderaC?: number;
  randomCU?: string;
  tiempoVotacion?: Date;
  tiempoVotacionInicio?: Date;
  usuario_registra?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // asistencia_votos belongsTo datos_users via id_diputado
  id_diputado_datos_user!: datos_users;
  getId_diputado_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_diputado_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_diputado_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // asistencia_votos belongsTo sesiones via id_sesion
  id_sesion_sesione!: sesiones;
  getId_sesion_sesione!: Sequelize.BelongsToGetAssociationMixin<sesiones>;
  setId_sesion_sesione!: Sequelize.BelongsToSetAssociationMixin<sesiones, sesionesId>;
  createId_sesion_sesione!: Sequelize.BelongsToCreateAssociationMixin<sesiones>;

  static initModel(sequelize: Sequelize.Sequelize): typeof asistencia_votos {
    return asistencia_votos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    mensaje: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    id_sesion: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id'
      }
    },
    votacionActiva: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    banderaC: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    randomCU: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tiempoVotacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tiempoVotacionInicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usuario_registra: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'asistencia_votos',
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
        name: "asistencia_votos_id_sesion_foreign",
        using: "BTREE",
        fields: [
          { name: "id_sesion" },
        ]
      },
      {
        name: "asistencia_votos_id_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "id_diputado" },
        ]
      },
    ]
  });
  }
}
