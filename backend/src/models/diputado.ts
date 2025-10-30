import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/legislativoConnection';
// import Gender from './gender';

class Diputado extends Model {
  declare id: string;
  declare apaterno: string;
  declare amaterno: string;
  declare nombres: string;
  declare descripcion?: string | null;
  declare shortname: string;
  declare fancyurl: string;
  declare gender_id: string;
  declare email: string;
  declare ext: string;
  declare facebook: string;
  declare twitter: string;
  declare instagram: string;
  declare ubicacion: string;
  declare link_web: string;
  declare telefono: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Diputado.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    apaterno: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amaterno: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    shortname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fancyurl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    gender_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ext: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    instagram: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    link_web: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'diputados',
    timestamps: true,
    paranoid: true,
  }
);

// 🔗 Asociación (si existe modelo Gender)
// Diputado.belongsTo(Gender, {
//   foreignKey: 'gender_id',
//   as: 'gender',
// });

export default Diputado;
