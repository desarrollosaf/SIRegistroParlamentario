import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import DatosUser from './datos_users';
import Distrito from './distritos';
import Informe from './informes';
import IntegranteComision from './integrante_comisions';
import Legislatura from './legislaturas';
import Partido from './partidos';

class IntegranteLegislatura extends Model {
  declare id: string;
  declare legislatura_id: ForeignKey<string>;
  declare dato_user_id: ForeignKey<string>;
  declare partido_id: ForeignKey<string>;
  declare distrito_id: ForeignKey<string> | null;
  declare cargo: string | null;
  declare nivel: number | null;
  declare fecha_ingreso: string | null;
  declare dato_dipoficial_id: ForeignKey<string> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización
IntegranteLegislatura.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    legislatura_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    dato_user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    partido_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    distrito_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    cargo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dato_dipoficial_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'integrante_legislaturas',
    timestamps: true,
    paranoid: true, // soft deletes
  }
);

// Asociaciones
IntegranteLegislatura.belongsTo(DatosUser, {
  foreignKey: 'dato_user_id',
  as: 'dato_user',
});

IntegranteLegislatura.belongsTo(DatosUser, {
  foreignKey: 'dato_dipoficial_id',
  as: 'dato_dipoficial',
});

IntegranteLegislatura.belongsTo(Distrito, {
  foreignKey: 'distrito_id',
  as: 'distrito',
});

IntegranteLegislatura.belongsTo(Legislatura, {
  foreignKey: 'legislatura_id',
  as: 'legislatura',
});

IntegranteLegislatura.belongsTo(Partido, {
  foreignKey: 'partido_id',
  as: 'partido',
});

IntegranteLegislatura.hasMany(Informe, {
  foreignKey: 'integrante_legislatura_id',
  as: 'informes',
});

IntegranteLegislatura.hasMany(IntegranteComision, {
  foreignKey: 'integrante_legislatura_id',
  as: 'integrante_comisions',
});

export default IntegranteLegislatura;
