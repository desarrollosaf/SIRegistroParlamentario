import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface oauth_access_tokensAttributes {
  id: string;
  user_id?: string;
  client_id: string;
  name?: string;
  scopes?: string;
  revoked: number;
  created_at?: Date;
  updated_at?: Date;
  expires_at?: Date;
}

export type oauth_access_tokensPk = "id";
export type oauth_access_tokensId = oauth_access_tokens[oauth_access_tokensPk];
export type oauth_access_tokensOptionalAttributes = "user_id" | "name" | "scopes" | "created_at" | "updated_at" | "expires_at";
export type oauth_access_tokensCreationAttributes = Optional<oauth_access_tokensAttributes, oauth_access_tokensOptionalAttributes>;

export class oauth_access_tokens extends Model<oauth_access_tokensAttributes, oauth_access_tokensCreationAttributes> implements oauth_access_tokensAttributes {
  id!: string;
  user_id?: string;
  client_id!: string;
  name?: string;
  scopes?: string;
  revoked!: number;
  created_at?: Date;
  updated_at?: Date;
  expires_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof oauth_access_tokens {
    return oauth_access_tokens.init({
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    client_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    scopes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'oauth_access_tokens',
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
        name: "oauth_access_tokens_user_id_index",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
