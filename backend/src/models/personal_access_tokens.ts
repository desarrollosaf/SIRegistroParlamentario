import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface personal_access_tokensAttributes {
  id: number;
  tokenable_type: string;
  tokenable_id: number;
  name: string;
  token: string;
  abilities?: string;
  last_used_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type personal_access_tokensPk = "id";
export type personal_access_tokensId = personal_access_tokens[personal_access_tokensPk];
export type personal_access_tokensOptionalAttributes = "id" | "abilities" | "last_used_at" | "created_at" | "updated_at";
export type personal_access_tokensCreationAttributes = Optional<personal_access_tokensAttributes, personal_access_tokensOptionalAttributes>;

export class personal_access_tokens extends Model<personal_access_tokensAttributes, personal_access_tokensCreationAttributes> implements personal_access_tokensAttributes {
  id!: number;
  tokenable_type!: string;
  tokenable_id!: number;
  name!: string;
  token!: string;
  abilities?: string;
  last_used_at?: Date;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof personal_access_tokens {
    return personal_access_tokens.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tokenable_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tokenable_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "personal_access_tokens_token_unique"
    },
    abilities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'personal_access_tokens',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "personal_access_tokens_token_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
      {
        name: "personal_access_tokens_tokenable_type_tokenable_id_index",
        using: "BTREE",
        fields: [
          { name: "tokenable_type" },
          { name: "tokenable_id" },
        ]
      },
    ]
  });
  }
}
