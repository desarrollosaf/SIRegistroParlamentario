import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
  } from 'sequelize';
  import sequelize from '../database/registrocomisiones';
  
  class Roles extends Model<
    InferAttributes<Roles>,
    InferCreationAttributes<Roles>
  > {
    declare id: CreationOptional<number>;
    declare name: string | null;
    declare desc: string | null;
  }
  
  // Inicializamos el modelo
  Roles.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      desc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
    },
    {
      sequelize,
      tableName: 'roles',
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
  
  export default Roles;