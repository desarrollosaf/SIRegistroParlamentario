import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/legislativoConnection';

class FailedJobs extends Model<InferAttributes<FailedJobs>, InferCreationAttributes<FailedJobs>> {
  declare id: CreationOptional<number>;
  declare connection: string;
  declare queue: string;
  declare payload: string;
  declare exception: string;
  declare failedAt: CreationOptional<Date>;
}

FailedJobs.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    connection: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    queue: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    exception: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'failed_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'failed_jobs',
    timestamps: false,
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

export default FailedJobs;
