import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class Intervencion extends Model {
  declare id: string;
  declare id_punto: ForeignKey<string> | null;
  declare id_evento: ForeignKey<string> | null;
  declare id_diputado: ForeignKey<string> | null;
  declare id_tipo_intervencion: ForeignKey<string> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// Inicialización
Intervencion.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_tipo_intervencion: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'intervenciones',
    timestamps: true,
  }
);

export default Intervencion;
