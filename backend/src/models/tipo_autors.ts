import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

class TipoAutor extends Model {
  declare id: string;
  declare valor: string;
  declare model: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

TipoAutor.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
    },
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'tipo_autors',
    timestamps: true,
    paranoid: true,
  }
);

export default TipoAutor;
