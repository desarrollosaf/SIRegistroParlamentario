import { Model, DataTypes, CreationOptional, ForeignKey } from "sequelize";
import sequelize from "../database/registrocomisiones";

class VotosPunto extends Model {
  declare id: string;
  declare sentido: number | null;
  declare mensaje: string | null;
  declare id_tema_punto_voto: ForeignKey<string> | null;
  declare id_diputado: ForeignKey<string> | null;
  declare id_partido: ForeignKey<string> | null;
  declare id_comision_dip: ForeignKey<string> | null;
  declare id_cargo_dip: ForeignKey<string> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

VotosPunto.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    sentido: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mensaje: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    id_punto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_tema_punto_voto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_partido: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_comision_dip: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_cargo_dip: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "votos_punto",
    timestamps: true,
    paranoid: true,
  }
);

export default VotosPunto;
