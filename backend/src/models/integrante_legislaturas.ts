import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/legislativoConnection';
// import DatosUser from './datos_users';
import Distrito from './distritos';
import Informe from './informes';
import IntegranteComision from './integrante_comisions';
import Legislatura from './legislaturas';
import Partido from './partidos';
import Diputado from './diputado';

class IntegranteLegislatura extends Model {
  declare id: string;
  declare legislatura_id: ForeignKey<string>;
  declare diputado_id: ForeignKey<string>;
  declare partido_id: ForeignKey<string>;
  declare distrito_id: ForeignKey<string> | null;
  declare fecha_ingreso: string | null;
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
    diputado_id: {
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
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
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
    tableName: 'integrante_legislaturas',
    timestamps: true,
    paranoid: true, // soft deletes
  }
);

// Asociaciones
IntegranteLegislatura.belongsTo(Diputado, {
  foreignKey: 'diputado_id',
  as: 'diputado',
});

// IntegranteLegislatura.belongsTo(DatosUser, {
//   foreignKey: 'dato_dipoficial_id',
//   as: 'dato_dipoficial',
// });

// IntegranteLegislatura.belongsTo(Distrito, {
//   foreignKey: 'distrito_id',
//   as: 'distrito',
// });

// IntegranteLegislatura.belongsTo(Legislatura, {
//   foreignKey: 'legislatura_id',
//   as: 'legislatura',
// });

// IntegranteLegislatura.belongsTo(Partido, {
//   foreignKey: 'partido_id',
//   as: 'partido',
// });

// IntegranteLegislatura.hasMany(Informe, {
//   foreignKey: 'integrante_legislatura_id',
//   as: 'informes',
// });

// IntegranteLegislatura.hasMany(IntegranteComision, {
//   foreignKey: 'integrante_legislatura_id',
//   as: 'integrante_comisions',
// });

export default IntegranteLegislatura;
