import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class Gender extends Model {
  declare id: string;
  declare genero: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Gender.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    genero: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'genders',
    timestamps: true,
    paranoid: false,  // la tabla no tiene deleted_at
  }
);

export default Gender;