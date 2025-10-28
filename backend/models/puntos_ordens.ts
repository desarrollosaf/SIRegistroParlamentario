import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { datos_users, datos_usersId } from './datos_users';
import type { presenta_puntos, presenta_puntosId } from './presenta_puntos';
import type { presentan_puntos, presentan_puntosId } from './presentan_puntos';
import type { temas_votos, temas_votosId } from './temas_votos';
import type { tipo_categoria_iniciativas, tipo_categoria_iniciativasId } from './tipo_categoria_iniciativas';
import type { turno_comisions, turno_comisionsId } from './turno_comisions';

export interface puntos_ordensAttributes {
  id: string;
  id_evento?: string;
  noPunto?: number;
  punto: string;
  observaciones?: string;
  path_doc?: string;
  tribuna?: string;
  id_tipo?: string;
  status: number;
  punto_turno_id?: string;
  id_proponente?: string;
  dispensa?: number;
  editado: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type puntos_ordensPk = "id";
export type puntos_ordensId = puntos_ordens[puntos_ordensPk];
export type puntos_ordensOptionalAttributes = "id_evento" | "noPunto" | "observaciones" | "path_doc" | "tribuna" | "id_tipo" | "status" | "punto_turno_id" | "id_proponente" | "dispensa" | "editado" | "created_at" | "updated_at" | "deleted_at";
export type puntos_ordensCreationAttributes = Optional<puntos_ordensAttributes, puntos_ordensOptionalAttributes>;

export class puntos_ordens extends Model<puntos_ordensAttributes, puntos_ordensCreationAttributes> implements puntos_ordensAttributes {
  id!: string;
  id_evento?: string;
  noPunto?: number;
  punto!: string;
  observaciones?: string;
  path_doc?: string;
  tribuna?: string;
  id_tipo?: string;
  status!: number;
  punto_turno_id?: string;
  id_proponente?: string;
  dispensa?: number;
  editado!: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // puntos_ordens belongsTo datos_users via tribuna
  tribuna_datos_user!: datos_users;
  getTribuna_datos_user!: Sequelize.BelongsToGetAssociationMixin<datos_users>;
  setTribuna_datos_user!: Sequelize.BelongsToSetAssociationMixin<datos_users, datos_usersId>;
  createTribuna_datos_user!: Sequelize.BelongsToCreateAssociationMixin<datos_users>;
  // puntos_ordens hasMany presenta_puntos via id_punto
  presenta_puntos!: presenta_puntos[];
  getPresenta_puntos!: Sequelize.HasManyGetAssociationsMixin<presenta_puntos>;
  setPresenta_puntos!: Sequelize.HasManySetAssociationsMixin<presenta_puntos, presenta_puntosId>;
  addPresenta_punto!: Sequelize.HasManyAddAssociationMixin<presenta_puntos, presenta_puntosId>;
  addPresenta_puntos!: Sequelize.HasManyAddAssociationsMixin<presenta_puntos, presenta_puntosId>;
  createPresenta_punto!: Sequelize.HasManyCreateAssociationMixin<presenta_puntos>;
  removePresenta_punto!: Sequelize.HasManyRemoveAssociationMixin<presenta_puntos, presenta_puntosId>;
  removePresenta_puntos!: Sequelize.HasManyRemoveAssociationsMixin<presenta_puntos, presenta_puntosId>;
  hasPresenta_punto!: Sequelize.HasManyHasAssociationMixin<presenta_puntos, presenta_puntosId>;
  hasPresenta_puntos!: Sequelize.HasManyHasAssociationsMixin<presenta_puntos, presenta_puntosId>;
  countPresenta_puntos!: Sequelize.HasManyCountAssociationsMixin;
  // puntos_ordens hasMany presentan_puntos via id_punto
  presentan_puntos!: presentan_puntos[];
  getPresentan_puntos!: Sequelize.HasManyGetAssociationsMixin<presentan_puntos>;
  setPresentan_puntos!: Sequelize.HasManySetAssociationsMixin<presentan_puntos, presentan_puntosId>;
  addPresentan_punto!: Sequelize.HasManyAddAssociationMixin<presentan_puntos, presentan_puntosId>;
  addPresentan_puntos!: Sequelize.HasManyAddAssociationsMixin<presentan_puntos, presentan_puntosId>;
  createPresentan_punto!: Sequelize.HasManyCreateAssociationMixin<presentan_puntos>;
  removePresentan_punto!: Sequelize.HasManyRemoveAssociationMixin<presentan_puntos, presentan_puntosId>;
  removePresentan_puntos!: Sequelize.HasManyRemoveAssociationsMixin<presentan_puntos, presentan_puntosId>;
  hasPresentan_punto!: Sequelize.HasManyHasAssociationMixin<presentan_puntos, presentan_puntosId>;
  hasPresentan_puntos!: Sequelize.HasManyHasAssociationsMixin<presentan_puntos, presentan_puntosId>;
  countPresentan_puntos!: Sequelize.HasManyCountAssociationsMixin;
  // puntos_ordens hasMany temas_votos via id_punto
  temas_votos!: temas_votos[];
  getTemas_votos!: Sequelize.HasManyGetAssociationsMixin<temas_votos>;
  setTemas_votos!: Sequelize.HasManySetAssociationsMixin<temas_votos, temas_votosId>;
  addTemas_voto!: Sequelize.HasManyAddAssociationMixin<temas_votos, temas_votosId>;
  addTemas_votos!: Sequelize.HasManyAddAssociationsMixin<temas_votos, temas_votosId>;
  createTemas_voto!: Sequelize.HasManyCreateAssociationMixin<temas_votos>;
  removeTemas_voto!: Sequelize.HasManyRemoveAssociationMixin<temas_votos, temas_votosId>;
  removeTemas_votos!: Sequelize.HasManyRemoveAssociationsMixin<temas_votos, temas_votosId>;
  hasTemas_voto!: Sequelize.HasManyHasAssociationMixin<temas_votos, temas_votosId>;
  hasTemas_votos!: Sequelize.HasManyHasAssociationsMixin<temas_votos, temas_votosId>;
  countTemas_votos!: Sequelize.HasManyCountAssociationsMixin;
  // puntos_ordens hasMany turno_comisions via id_punto_orden
  turno_comisions!: turno_comisions[];
  getTurno_comisions!: Sequelize.HasManyGetAssociationsMixin<turno_comisions>;
  setTurno_comisions!: Sequelize.HasManySetAssociationsMixin<turno_comisions, turno_comisionsId>;
  addTurno_comision!: Sequelize.HasManyAddAssociationMixin<turno_comisions, turno_comisionsId>;
  addTurno_comisions!: Sequelize.HasManyAddAssociationsMixin<turno_comisions, turno_comisionsId>;
  createTurno_comision!: Sequelize.HasManyCreateAssociationMixin<turno_comisions>;
  removeTurno_comision!: Sequelize.HasManyRemoveAssociationMixin<turno_comisions, turno_comisionsId>;
  removeTurno_comisions!: Sequelize.HasManyRemoveAssociationsMixin<turno_comisions, turno_comisionsId>;
  hasTurno_comision!: Sequelize.HasManyHasAssociationMixin<turno_comisions, turno_comisionsId>;
  hasTurno_comisions!: Sequelize.HasManyHasAssociationsMixin<turno_comisions, turno_comisionsId>;
  countTurno_comisions!: Sequelize.HasManyCountAssociationsMixin;
  // puntos_ordens belongsTo tipo_categoria_iniciativas via id_tipo
  id_tipo_tipo_categoria_iniciativa!: tipo_categoria_iniciativas;
  getId_tipo_tipo_categoria_iniciativa!: Sequelize.BelongsToGetAssociationMixin<tipo_categoria_iniciativas>;
  setId_tipo_tipo_categoria_iniciativa!: Sequelize.BelongsToSetAssociationMixin<tipo_categoria_iniciativas, tipo_categoria_iniciativasId>;
  createId_tipo_tipo_categoria_iniciativa!: Sequelize.BelongsToCreateAssociationMixin<tipo_categoria_iniciativas>;

  static initModel(sequelize: Sequelize.Sequelize): typeof puntos_ordens {
    return puntos_ordens.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    noPunto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    punto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tribuna: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id'
      }
    },
    id_tipo: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_categoria_iniciativas',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    punto_turno_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    id_proponente: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    dispensa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    editado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'puntos_ordens',
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
        name: "puntos_ordens_tribuna_foreign",
        using: "BTREE",
        fields: [
          { name: "tribuna" },
        ]
      },
      {
        name: "puntos_ordens_id_tipo_foreign",
        using: "BTREE",
        fields: [
          { name: "id_tipo" },
        ]
      },
    ]
  });
  }
}
