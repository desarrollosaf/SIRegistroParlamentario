import { Model, DataTypes, CreationOptional, NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import IntegranteLegislatura from './integrante_legislaturas';
import Municipio from './municipios';

class Distrito extends Model<InferAttributes<Distrito>, InferCreationAttributes<Distrito>> {
  declare id: string;
  declare distrito: string;
  declare municipio_id: string | null;
  declare orden: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare integrante_legislaturas?: NonAttribute<IntegranteLegislatura[]>;
  declare municipio?: NonAttribute<Municipio>;
}

Distrito.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    distrito: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    municipio_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id',
      },
    },
    orden: {
      type: DataTypes.INTEGER,
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
  },
  {
    sequelize,
    tableName: 'distritos',
    timestamps: true,
    underscored: true,
  }
);

// Asociación
Distrito.hasMany(IntegranteLegislatura, {
  sourceKey: 'id',
  foreignKey: 'distrito_id',
  as: 'integrante_legislaturas',
});

Distrito.belongsTo(Municipio, {
  foreignKey: 'municipio_id',
  as: 'municipio',
});

export default Distrito;
