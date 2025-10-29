import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import DatosUsers from './datos_users';
import PuntosOrdens from './puntos_ordens';
import TipoPresentas from './tipo_presentas';

class PresentanPuntos extends Model<InferAttributes<PresentanPuntos>, InferCreationAttributes<PresentanPuntos>> {
  declare id: string;
  declare id_punto: string;
  declare id_tipo_presenta?: string;
  declare id_diputado?: string;
  declare otro?: string;
  declare id_comision?: string;
  declare id_grupo?: string;
  declare id_presenta_titular?: string;
  declare id_proponente?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones
  declare id_diputado_datos_user?: DatosUsers;
  declare id_punto_puntos_orden?: PuntosOrdens;
  declare id_tipo_presenta_tipo_presenta?: TipoPresentas;
}

// Inicialización
PresentanPuntos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'puntos_ordens',
        key: 'id',
      },
    },
    id_tipo_presenta: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'tipo_presentas',
        key: 'id',
      },
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    otro: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_comision: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_grupo: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_presenta_titular: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_proponente: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'presentan_puntos',
    timestamps: true,
    paranoid: true,
  }
);

// Asociaciones
PresentanPuntos.belongsTo(DatosUsers, { foreignKey: 'id_diputado', as: 'id_diputado_datos_user' });
PresentanPuntos.belongsTo(PuntosOrdens, { foreignKey: 'id_punto', as: 'id_punto_puntos_orden' });
PresentanPuntos.belongsTo(TipoPresentas, { foreignKey: 'id_tipo_presenta', as: 'id_tipo_presenta_tipo_presenta' });

export default PresentanPuntos;
