import {
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../database/registrocomisiones";
import VotosPunto from "./votos_punto";

class TemasPuntosVotos extends Model {
  declare id: string;
  declare id_punto: ForeignKey<string> | null;
  declare id_evento: ForeignKey<string>;
  declare tema_votacion: string | null;
  declare fecha_votacion: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
  public votospuntos?: VotosPunto[];
}

TemasPuntosVotos.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, 
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    tema_votacion: {
      type: DataTypes.STRING(255),
      allowNull: true, 
    },
    fecha_votacion: {
      type: DataTypes.DATE, 
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
    tableName: "temas_puntos_votos",
    timestamps: true,
    paranoid: true,
  }
);

TemasPuntosVotos.hasMany(VotosPunto, {
  foreignKey: "id_tema_punto_voto",
  as: "votospuntos",
});

export default TemasPuntosVotos;
