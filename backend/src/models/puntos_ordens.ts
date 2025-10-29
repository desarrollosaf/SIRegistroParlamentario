import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import type { DatosUsers } from './datos_users';
import type { PresentaPuntos } from './presenta_puntos';
import type { PresentanPuntos } from './presentan_puntos';
import type { TemasVotos } from './temas_votos';
import type { TipoCategoriaIniciativas } from './tipo_categoria_iniciativas';
import type { TurnoComisions } from './turno_comisions';

export class PuntosOrdens extends Model<InferAttributes<PuntosOrdens>, InferCreationAttributes<PuntosOrdens>> {
  declare id: string;
  declare id_evento?: string;
  declare noPunto?: number;
  declare punto: string;
  declare observaciones?: string;
  declare path_doc?: string;
  declare tribuna?: string;
  declare id_tipo?: string;
  declare status: number;
  declare punto_turno_id?: string;
  declare id_proponente?: string;
  declare dispensa?: number;
  declare editado: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare tribuna_datos_user?: DatosUsers;
  declare presenta_puntos?: PresentaPuntos[];
  declare presentan_puntos?: PresentanPuntos[];
  declare temas_votos?: TemasVotos[];
  declare turno_comisions?: TurnoComisions[];
  declare id_tipo_tipo_categoria_iniciativa?: TipoCategoriaIniciativas;
}

PuntosOrdens.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    noPunto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    punto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tribuna: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    id_tipo: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_categoria_iniciativas',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    punto_turno_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_proponente: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    dispensa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    editado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'puntos_ordens',
    timestamps: true,
    paranoid: true,
  }
);

export default PuntosOrdens;
