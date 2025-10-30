import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/legislativoConnection';


class ActaSesion extends Model {
  declare id: CreationOptional<number>;
  declare path_acta: string;
  declare id_evento: ForeignKey<number>;
  declare status: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ActaSesion.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    path_acta: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'acta_sesions',
    timestamps: true,
  }
);



export default ActaSesion;