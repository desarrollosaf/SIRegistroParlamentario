import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { mensajes_votos, mensajes_votosId } from './mensajes_votos';
import type { puntos_ordens, puntos_ordensId } from './puntos_ordens';
import type { sesiones, sesionesId } from './sesiones';

export interface temas_votosAttributes {
  id: string;
  id_punto?: string;
  id_evento: string;
  votacion?: string;
  status: string;
  fechaVotacion: string;
  totalVotos?: number;
  id_decision?: number;
  tiempoVotacion?: Date;
  tiempoVotacionInicio?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type temas_votosPk = "id";
export type temas_votosId = temas_votos[temas_votosPk];
export type temas_votosOptionalAttributes = "id_punto" | "votacion" | "totalVotos" | "id_decision" | "tiempoVotacion" | "tiempoVotacionInicio" | "created_at" | "updated_at";
export type temas_votosCreationAttributes = Optional<temas_votosAttributes, temas_votosOptionalAttributes>;

export class temas_votos extends Model<temas_votosAttributes, temas_votosCreationAttributes> implements temas_votosAttributes {
  id!: string;
  id_punto?: string;
  id_evento!: string;
  votacion?: string;
  status!: string;
  fechaVotacion!: string;
  totalVotos?: number;
  id_decision?: number;
  tiempoVotacion?: Date;
  tiempoVotacionInicio?: Date;
  created_at?: Date;
  updated_at?: Date;

  // temas_votos belongsTo puntos_ordens via id_punto
  id_punto_puntos_orden!: puntos_ordens;
  getId_punto_puntos_orden!: Sequelize.BelongsToGetAssociationMixin<puntos_ordens>;
  setId_punto_puntos_orden!: Sequelize.BelongsToSetAssociationMixin<puntos_ordens, puntos_ordensId>;
  createId_punto_puntos_orden!: Sequelize.BelongsToCreateAssociationMixin<puntos_ordens>;
  // temas_votos belongsTo sesiones via id_evento
  id_evento_sesione!: sesiones;
  getId_evento_sesione!: Sequelize.BelongsToGetAssociationMixin<sesiones>;
  setId_evento_sesione!: Sequelize.BelongsToSetAssociationMixin<sesiones, sesionesId>;
  createId_evento_sesione!: Sequelize.BelongsToCreateAssociationMixin<sesiones>;
  // temas_votos hasMany mensajes_votos via id_tema_voto
  mensajes_votos!: mensajes_votos[];
  getMensajes_votos!: Sequelize.HasManyGetAssociationsMixin<mensajes_votos>;
  setMensajes_votos!: Sequelize.HasManySetAssociationsMixin<mensajes_votos, mensajes_votosId>;
  addMensajes_voto!: Sequelize.HasManyAddAssociationMixin<mensajes_votos, mensajes_votosId>;
  addMensajes_votos!: Sequelize.HasManyAddAssociationsMixin<mensajes_votos, mensajes_votosId>;
  createMensajes_voto!: Sequelize.HasManyCreateAssociationMixin<mensajes_votos>;
  removeMensajes_voto!: Sequelize.HasManyRemoveAssociationMixin<mensajes_votos, mensajes_votosId>;
  removeMensajes_votos!: Sequelize.HasManyRemoveAssociationsMixin<mensajes_votos, mensajes_votosId>;
  hasMensajes_voto!: Sequelize.HasManyHasAssociationMixin<mensajes_votos, mensajes_votosId>;
  hasMensajes_votos!: Sequelize.HasManyHasAssociationsMixin<mensajes_votos, mensajes_votosId>;
  countMensajes_votos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof temas_votos {
    return temas_votos.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'puntos_ordens',
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
    votacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fechaVotacion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalVotos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_decision: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tiempoVotacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tiempoVotacionInicio: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'temas_votos',
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
        name: "temas_votos_id_punto_foreign",
        using: "BTREE",
        fields: [
          { name: "id_punto" },
        ]
      },
      {
        name: "temas_votos_id_evento_foreign",
        using: "BTREE",
        fields: [
          { name: "id_evento" },
        ]
      },
    ]
  });
  }
}
