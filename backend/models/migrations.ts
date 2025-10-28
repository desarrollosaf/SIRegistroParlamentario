import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface migrationsAttributes {
  id: number;
  migration: string;
  batch: number;
}

export type migrationsPk = "id";
export type migrationsId = migrations[migrationsPk];
export type migrationsOptionalAttributes = "id";
export type migrationsCreationAttributes = Optional<migrationsAttributes, migrationsOptionalAttributes>;

export class migrations extends Model<migrationsAttributes, migrationsCreationAttributes> implements migrationsAttributes {
  id!: number;
  migration!: string;
  batch!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof migrations {
    return migrations.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    migration: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'migrations',
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
