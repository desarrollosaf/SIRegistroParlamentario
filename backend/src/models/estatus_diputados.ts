import { Model, DataTypes, CreationOptional, NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import LicenciasDiputados from './licencias_diputados';
import MovimientosDiputados from './movimientos_diputados';

class EstatusDiputados extends Model<InferAttributes<EstatusDiputados>, InferCreationAttributes<EstatusDiputados>> {
  declare id: string;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Relaciones
  declare licencias?: NonAttribute<LicenciasDiputados[]>;
  declare movimientos?: NonAttribute<MovimientosDiputados[]>;
}

EstatusDiputados.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: 'estatus_diputados',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

// Relaciones
EstatusDiputados.hasMany(LicenciasDiputados, { foreignKey: 'estatus_diputado', as: 'licencias' });
EstatusDiputados.hasMany(MovimientosDiputados, { foreignKey: 'estatus_diputado_id', as: 'movimientos' });

export default EstatusDiputados;
