import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface failed_jobsAttributes {
  id: number;
  connection: string;
  queue: string;
  payload: string;
  exception: string;
  failed_at: Date;
}

export type failed_jobsPk = "id";
export type failed_jobsId = failed_jobs[failed_jobsPk];
export type failed_jobsOptionalAttributes = "id" | "failed_at";
export type failed_jobsCreationAttributes = Optional<failed_jobsAttributes, failed_jobsOptionalAttributes>;

export class failed_jobs extends Model<failed_jobsAttributes, failed_jobsCreationAttributes> implements failed_jobsAttributes {
  id!: number;
  connection!: string;
  queue!: string;
  payload!: string;
  exception!: string;
  failed_at!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof failed_jobs {
    return failed_jobs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    connection: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    queue: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    exception: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    failed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'failed_jobs',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
