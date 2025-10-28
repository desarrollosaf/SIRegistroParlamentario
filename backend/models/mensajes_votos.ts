import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { sesiones, sesionesId } from './sesiones';
import type { temas_votos, temas_votosId } from './temas_votos';

export interface mensajes_votosAttributes {
  id: string;
  sentido: string;
  timestamp: Date;
  status: number;
  id_tema_voto: string;
  id_diputado: string;
  id_evento: string;
  id_usuario_registra?: string;
  grupo?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type mensajes_votosPk = "id";
export type mensajes_votosId = mensajes_votos[mensajes_votosPk];
export type mensajes_votosOptionalAttributes = "timestamp" | "status" | "id_usuario_registra" | "grupo" | "created_at" | "updated_at";
export type mensajes_votosCreationAttributes = Optional<mensajes_votosAttributes, mensajes_votosOptionalAttributes>;

export class mensajes_votos extends Model<mensajes_votosAttributes, mensajes_votosCreationAttributes> implements mensajes_votosAttributes {
  id!: string;
  sentido!: string;
  timestamp!: Date;
  status!: number;
  id_tema_voto!: string;
  id_diputado!: string;
  id_evento!: string;
  id_usuario_registra?: string;
  grupo?: number;
  created_at?: Date;
  updated_at?: Date;

  // mensajes_votos belongsTo datos_users via id_diputado
  id_diputado_datos_user!: datos_users;
  getId_diputado_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_diputado_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_diputado_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // mensajes_votos belongsTo datos_users via id_usuario_registra
  id_usuario_registra_datos_user!: datos_users;
  getId_usuario_registra_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setId_usuario_registra_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createId_usuario_registra_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // mensajes_votos belongsTo sesiones via id_evento
  id_evento_sesione!: sesiones;
  getId_evento_sesione!: Sequelize.BelongsToGetAssociationMixin<sesiones>;
  setId_evento_sesione!: Sequelize.BelongsToSetAssociationMixin<sesiones, sesionesId>;
  createId_evento_sesione!: Sequelize.BelongsToCreateAssociationMixin<sesiones>;
  // mensajes_votos belongsTo temas_votos via id_tema_voto
  id_tema_voto_temas_voto!: temas_votos;
  getId_tema_voto_temas_voto!: Sequelize.BelongsToGetAssociationMixin<temas_votos>;
  setId_tema_voto_temas_voto!: Sequelize.BelongsToSetAssociationMixin<temas_votos, temas_votosId>;
  createId_tema_voto_temas_voto!: Sequelize.BelongsToCreateAssociationMixin<temas_votos>;

  static initModel(sequelize: Sequelize.Sequelize): typeof mensajes_votos {
    return mensajes_votos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    sentido: {
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
      allowNull: false,
      defaultValue: 1
    },
    id_tema_voto: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'temas_votos',
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
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id'
      }
    },
    id_usuario_registra: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    grupo: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mensajes_votos',
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
        name: "mensajes_votos_id_tema_voto_foreign",
        using: "BTREE",
        fields: [
          { name: "id_tema_voto" },
        ]
      },
      {
        name: "mensajes_votos_id_diputado_foreign",
        using: "BTREE",
        fields: [
          { name: "id_diputado" },
        ]
      },
      {
        name: "mensajes_votos_id_evento_foreign",
        using: "BTREE",
        fields: [
          { name: "id_evento" },
        ]
      },
      {
        name: "mensajes_votos_id_usuario_registra_foreign",
        using: "BTREE",
        fields: [
          { name: "id_usuario_registra" },
        ]
      },
    ]
  });
  }
}
