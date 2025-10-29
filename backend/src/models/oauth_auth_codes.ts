import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface oauth_auth_codesAttributes {
  id: string;
  user_id: string;
  client_id: string;
  scopes?: string;
  revoked: number;
  expires_at?: Date;
}

export type oauth_auth_codesPk = "id";
export type oauth_auth_codesId = oauth_auth_codes[oauth_auth_codesPk];
export type oauth_auth_codesOptionalAttributes = "scopes" | "expires_at";
export type oauth_auth_codesCreationAttributes = Optional<oauth_auth_codesAttributes, oauth_auth_codesOptionalAttributes>;

export class oauth_auth_codes extends Model<oauth_auth_codesAttributes, oauth_auth_codesCreationAttributes> implements oauth_auth_codesAttributes {
  id!: string;
  user_id!: string;
  client_id!: string;
  scopes?: string;
  revoked!: number;
  expires_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof oauth_auth_codes {
    return oauth_auth_codes.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    client_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
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
    tableName: 'oauth_auth_codes',
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
        name: "oauth_auth_codes_user_id_index",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
