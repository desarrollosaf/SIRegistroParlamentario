import {
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey
} from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import LeyesInformes from './leyes_informes';
import IntegranteLegislaturas from './integrante_legislaturas';

class Informes extends Model {
  declare id: string;
  declare integrante_legislatura_id: ForeignKey<string>;
  declare path: string;
  declare foto_principal: string;
  declare foto_ficha: string;
  declare foto_descarga: string;
  declare liga?: string;
  declare fecha_inter?: string;
  declare header_dip: string;
  declare type: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización
Informes.init(
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
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foto_principal: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foto_ficha: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foto_descarga: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    liga: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fecha_inter: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    header_dip: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'informes',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

// Asociaciones
Informes.hasMany(LeyesInformes, { foreignKey: 'informes_id', as: 'leyes_informes' });
Informes.belongsTo(IntegranteLegislaturas, { foreignKey: 'integrante_legislatura_id', as: 'integrante_legislatura' });

export default Informes;
