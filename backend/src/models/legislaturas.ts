import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import IntegranteLegislatura from './integrante_legislaturas';

class Legislatura extends Model {
  declare id: string;
  declare numero: string;
  declare fecha_inicio: string;
  declare fecha_fin: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización
Legislatura.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    numero: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
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
    tableName: 'legislaturas',
    timestamps: true,
    paranoid: true,
  }
);

// Asociaciones
Legislatura.hasMany(IntegranteLegislatura, {
  foreignKey: 'legislatura_id',
  as: 'integrante_legislaturas',
});

export default Legislatura;
