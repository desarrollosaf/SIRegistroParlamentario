import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/pleno'; // ajusta la ruta si tu conexión está en otro archivo

class TipoComisions extends Model<
  InferAttributes<TipoComisions>,
  InferCreationAttributes<TipoComisions>
> {
  declare id: string;
  declare valor: string;
  declare alias: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TipoComisions.init(
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
    alias: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tipo_comisions',
    timestamps: true,
  }
);

export default TipoComisions;
