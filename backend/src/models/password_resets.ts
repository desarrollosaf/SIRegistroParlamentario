import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface password_resetsAttributes {
  email: string;
  token: string;
  created_at?: Date;
}

export type password_resetsOptionalAttributes = "created_at";
export type password_resetsCreationAttributes = Optional<password_resetsAttributes, password_resetsOptionalAttributes>;

export class password_resets extends Model<password_resetsAttributes, password_resetsCreationAttributes> implements password_resetsAttributes {
  email!: string;
  token!: string;
  created_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof password_resets {
    return password_resets.init({
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
      {
        name: "password_resets_email_index",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
