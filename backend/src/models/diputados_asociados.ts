import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/registrocomisiones';

class DiputadosAsociados extends Model {
  declare id: string;
  declare id_diputado: string;
  declare partido_dip: string | null;
  declare comision_dip_id: ForeignKey<string> | null;
  declare id_cargo_dip: ForeignKey<string> | null;
  declare id_agenda: ForeignKey<string> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

DiputadosAsociados.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    partido_dip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comision_dip_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_cargo_dip: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_agenda: {
      type: DataTypes.CHAR(36),
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
    tableName: 'diputados_asociados',
    timestamps: true,
    paranoid: true,
  }
);

export default DiputadosAsociados;