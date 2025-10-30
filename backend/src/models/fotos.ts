import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class Fotos extends Model<InferAttributes<Fotos>, InferCreationAttributes<Fotos>> {
  declare id: string;
  declare path: string;
  declare fotoableId: string;
  declare fotoableType: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Fotos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fotoableId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'fotoable_id',
    },
    fotoableType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'fotoable_type',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'fotos',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
    ],
  }
);

export default Fotos;
