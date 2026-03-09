import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

interface IniciativasPresentaAttributes {
  id: number;
  id_iniciativa: string;
  id_tipo_presenta: number | null;
  id_presenta: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface IniciativasPresentaCreationAttributes
  extends Optional<IniciativasPresentaAttributes, 'id'> {}

class IniciativasPresenta
  extends Model<IniciativasPresentaAttributes, IniciativasPresentaCreationAttributes>
  implements IniciativasPresentaAttributes
{
  declare id: number;
  declare id_iniciativa: string;
  declare id_tipo_presenta: number | null;
  declare id_presenta: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

IniciativasPresenta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_iniciativa:  {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    id_tipo_presenta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_presenta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deletedAt',
    },
  },
  {
    sequelize,
    tableName: 'iniciativas_presenta',
    paranoid: true,   // 👈 para soft delete con deletedAt
    timestamps: true,
  }
);

export default IniciativasPresenta;