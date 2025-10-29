import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import Informes from './informes';

class LeyesInforme extends Model {
  declare id: string;
  declare bullets: string;
  declare informes_id: ForeignKey<string>;
  declare orden: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

// Inicialización del modelo
LeyesInforme.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    bullets: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    informes_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'leyes_informes',
    timestamps: true,
    paranoid: true,
  }
);

// Asociación
LeyesInforme.belongsTo(Informes, {
  foreignKey: 'informes_id',
  as: 'informe',
});

export default LeyesInforme;
