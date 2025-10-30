import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import IntegranteComision from './integrante_comisions';
import TipoComision from './tipo_comisions';
import TurnoComision from './turno_comisions';

class Comision extends Model {
  declare id: string;
  declare nombre: string;
  declare importancia: string | null;
  declare tipo_comision_id: ForeignKey<string>;
  declare alias: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones
  declare integrantes?: NonAttribute<IntegranteComision[]>;
  declare turnos?: NonAttribute<TurnoComision[]>;
  declare tipo_comision?: NonAttribute<TipoComision>;

  declare static associations: {
    integrantes: Association<Comision, IntegranteComision>;
    turnos: Association<Comision, TurnoComision>;
    tipo_comision: Association<Comision, TipoComision>;
  };
}

Comision.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    importancia: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tipo_comision_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    alias: {
      type: DataTypes.STRING(255),
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
    tableName: 'comisions',
    timestamps: true,
    paranoid: true,
    underscored: true, // 👈 Hace que use snake_case en BD (opcional pero recomendado)
  }
);

// 🔗 Asociaciones
Comision.hasMany(IntegranteComision, {
  foreignKey: 'comision_id',
  as: 'integrantes',
});

Comision.hasMany(TurnoComision, {
  foreignKey: 'comision_id', // 👈 cambiado de id_comision → comision_id para consistencia
  as: 'turnos',
});

Comision.belongsTo(TipoComision, {
  foreignKey: 'tipo_comision_id',
  as: 'tipo_comision',
});

export default Comision;
