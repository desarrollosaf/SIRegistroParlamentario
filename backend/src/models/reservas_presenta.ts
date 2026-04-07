import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Proponentes from './proponentes';

class ReservasPresenta extends Model {
  declare id: CreationOptional<number>;
  declare id_reserva: string | null;
  declare id_tipo_presenta: number | null;
  declare id_presenta: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

ReservasPresenta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    id_reserva: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_tipo_presenta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_presenta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deletedAt',
    },
  },
  {
    sequelize,
    tableName: 'reservas_presenta',
    timestamps: true,
    paranoid: true,
  }
);

ReservasPresenta.belongsTo(Proponentes, { foreignKey: 'id_tipo_presenta', as: 'tipo_presenta' });
export default ReservasPresenta;