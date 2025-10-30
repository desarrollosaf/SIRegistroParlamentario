import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class Decision extends Model {
  declare id: CreationOptional<number>;
  declare valor: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Decision.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
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
    tableName: 'decisions',
    timestamps: true,
    underscored: true, // usa created_at / updated_at en lugar de camelCase
  }
);

export default Decision;
