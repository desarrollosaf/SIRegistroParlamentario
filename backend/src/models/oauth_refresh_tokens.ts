import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface oauth_refresh_tokensAttributes {
  id: string;
  access_token_id: string;
  revoked: number;
  expires_at?: Date;
}

export type oauth_refresh_tokensPk = "id";
export type oauth_refresh_tokensId = oauth_refresh_tokens[oauth_refresh_tokensPk];
export type oauth_refresh_tokensOptionalAttributes = "expires_at";
export type oauth_refresh_tokensCreationAttributes = Optional<oauth_refresh_tokensAttributes, oauth_refresh_tokensOptionalAttributes>;

export class oauth_refresh_tokens extends Model<oauth_refresh_tokensAttributes, oauth_refresh_tokensCreationAttributes> implements oauth_refresh_tokensAttributes {
  id!: string;
  access_token_id!: string;
  revoked!: number;
  expires_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof oauth_refresh_tokens {
    return oauth_refresh_tokens.init({
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    access_token_id: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    tableName: 'oauth_refresh_tokens',
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
      {
        name: "oauth_refresh_tokens_access_token_id_index",
        using: "BTREE",
        fields: [
          { name: "access_token_id" },
        ]
      },
    ]
  });
  }
}
