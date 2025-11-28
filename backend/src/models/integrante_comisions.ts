import { Model, DataTypes, CreationOptional, ForeignKey, NonAttribute, Association } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import Comision from './comisions';
import IntegranteLegislatura from './integrante_legislaturas';
import TipoCargoComision from './tipo_cargo_comisions';

class IntegranteComision extends Model {
  declare id: string;
  declare comision_id: ForeignKey<string>;
  declare integrante_legislatura_id: ForeignKey<string>;
  declare tipo_cargo_comision_id: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare comision?: NonAttribute<Comision>;
  declare integranteLegislatura?: NonAttribute<IntegranteLegislatura>;
  declare tipo_cargo?: NonAttribute<TipoCargoComision>;

  declare static associations: {
    comision: Association<IntegranteComision, Comision>;
    integranteLegislatura: Association<IntegranteComision, IntegranteLegislatura>;
    tipo_cargo: Association<IntegranteComision, TipoCargoComision>;
  };
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
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
    },
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'integrante_comisions',
    timestamps: true,
    paranoid: true,
    underscored: true, // ⭐ Importante agregarlo
  }
);

// 🔗 Asociaciones
IntegranteComision.belongsTo(Comision, {
  foreignKey: 'comision_id',
  as: 'comision',
});

IntegranteComision.belongsTo(IntegranteLegislatura, {
  foreignKey: 'integrante_legislatura_id',
  as: 'integranteLegislatura',
});

IntegranteComision.belongsTo(TipoCargoComision, {
  foreignKey: 'tipo_cargo_comision_id',
  as: 'tipo_cargo',
});

export default IntegranteComision;