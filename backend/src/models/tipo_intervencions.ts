import { Model, DataTypes, CreationOptional } from "sequelize";
import sequelize from "../database/registrocomisiones"; 

class TipoIntervencion extends Model {
  declare id: string;
  declare valor: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

TipoIntervencion.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: "deleted_at",
    },
  },
  {
    sequelize,
    tableName: "tipo_intervencions",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default TipoIntervencion;
