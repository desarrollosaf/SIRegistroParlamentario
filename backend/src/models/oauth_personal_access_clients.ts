import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface oauth_personal_access_clientsAttributes {
  id: string;
  client_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export type oauth_personal_access_clientsPk = "id";
export type oauth_personal_access_clientsId = oauth_personal_access_clients[oauth_personal_access_clientsPk];
export type oauth_personal_access_clientsOptionalAttributes = "created_at" | "updated_at";
export type oauth_personal_access_clientsCreationAttributes = Optional<oauth_personal_access_clientsAttributes, oauth_personal_access_clientsOptionalAttributes>;

export class oauth_personal_access_clients extends Model<oauth_personal_access_clientsAttributes, oauth_personal_access_clientsCreationAttributes> implements oauth_personal_access_clientsAttributes {
  id!: string;
  client_id!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof oauth_personal_access_clients {
    return oauth_personal_access_clients.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    client_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'oauth_personal_access_clients',
    timestamps: true
  });
  }
}
