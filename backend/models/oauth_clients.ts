import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface oauth_clientsAttributes {
  id: string;
  user_id?: string;
  name: string;
  secret?: string;
  provider?: string;
  redirect: string;
  personal_access_client: number;
  password_client: number;
  revoked: number;
  created_at?: Date;
  updated_at?: Date;
}

export type oauth_clientsPk = "id";
export type oauth_clientsId = oauth_clients[oauth_clientsPk];
export type oauth_clientsOptionalAttributes = "user_id" | "secret" | "provider" | "created_at" | "updated_at";
export type oauth_clientsCreationAttributes = Optional<oauth_clientsAttributes, oauth_clientsOptionalAttributes>;

export class oauth_clients extends Model<oauth_clientsAttributes, oauth_clientsCreationAttributes> implements oauth_clientsAttributes {
  id!: string;
  user_id?: string;
  name!: string;
  secret?: string;
  provider?: string;
  redirect!: string;
  personal_access_client!: number;
  password_client!: number;
  revoked!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof oauth_clients {
    return oauth_clients.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    secret: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    provider: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    redirect: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    personal_access_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    password_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'oauth_clients',
    timestamps: true,
    indexes: [
      {
        name: "oauth_clients_user_id_index",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
