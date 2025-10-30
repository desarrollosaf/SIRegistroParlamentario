import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import DatosUser from './datos_users';
import EstatusDiputado from './estatus_diputados';

class LicenciaDiputado extends Model {
  declare id: CreationOptional<number>;
  declare diputado_id: ForeignKey<string>;
  declare estatus_diputado: ForeignKey<string>;
  declare fecha_inicio: string;
  declare fecha_termino: string;
  declare diputado_suplente_id: ForeignKey<string> | null;
  declare status: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización del modelo
LicenciaDiputado.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    diputado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    estatus_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_termino: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    diputado_suplente_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'licencias_diputados',
    timestamps: true,
    paranoid: true,
  }
);

// Asociaciones
LicenciaDiputado.belongsTo(DatosUser, {
  foreignKey: 'diputado_id',
  as: 'diputado',
});

LicenciaDiputado.belongsTo(DatosUser, {
  foreignKey: 'diputado_suplente_id',
  as: 'diputado_suplente',
});

LicenciaDiputado.belongsTo(EstatusDiputado, {
  foreignKey: 'estatus_diputado',
  as: 'estatus',
});

export default LicenciaDiputado;
