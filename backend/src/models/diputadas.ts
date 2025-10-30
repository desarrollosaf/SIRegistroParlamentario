import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class Diputada extends Model {
  declare id: string;
  declare integrante_legislatura_id: string;
  declare descripcion: string | null;
  declare short_images: string | null;
  declare images: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

Diputada.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    integrante_legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    short_images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'diputadas',
    timestamps: true,
    paranoid: true, // habilita deletedAt
    underscored: true,
  }
);

export default Diputada;
