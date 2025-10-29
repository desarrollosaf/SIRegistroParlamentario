import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import Comision from './comisions';
import IntegranteLegislatura from './integrante_legislaturas';
import TipoCargoComision from './tipo_cargo_comisions';

class IntegranteComision extends Model {
  declare id: string;
  declare comision_id: ForeignKey<string>;
  declare integrante_legislatura_id: ForeignKey<string>;
  declare tipo_cargo_comision_id: ForeignKey<string>;
  declare nivel: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización
IntegranteComision.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    integrante_legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    tipo_cargo_comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'integrante_comisions',
    timestamps: true,
    paranoid: true, // activa soft delete
  }
);

// Asociaciones
IntegranteComision.belongsTo(Comision, {
  foreignKey: 'comision_id',
  as: 'comision',
});

IntegranteComision.belongsTo(IntegranteLegislatura, {
  foreignKey: 'integrante_legislatura_id',
  as: 'integrante_legislatura',
});

IntegranteComision.belongsTo(TipoCargoComision, {
  foreignKey: 'tipo_cargo_comision_id',
  as: 'tipo_cargo_comision',
});

export default IntegranteComision;
