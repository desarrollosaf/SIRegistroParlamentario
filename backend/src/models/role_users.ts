import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Roles from './role';

class RolUsers extends Model<
  InferAttributes<RolUsers>,
  InferCreationAttributes<RolUsers>
> {
  declare id: CreationOptional<number>;
  declare role_id: number | null;
  declare user_id: ForeignKey<string>;  // UUID es string
}

RolUsers.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'rol_users',
    timestamps: true,
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

export default RolUsers;

RolUsers.belongsTo(Roles, { foreignKey: 'role_id', as: 'role' });
Roles.hasMany(RolUsers, { foreignKey: 'role_id', as: 'rol_users' });
