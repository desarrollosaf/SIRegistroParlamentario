import { Model, DataTypes } from "sequelize";
import sequelize from "../database/registrocomisiones";

export class MunicipiosAg extends Model {
  public id!: number;
  public nombre!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MunicipiosAg.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "createdAt",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updatedAt",
    },
  },
  {
    sequelize,
    tableName: "Municipios",
    modelName: "MunicipiosAg",
    timestamps: true,
  }
);

export default MunicipiosAg;
