import {
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  Association,
} from "sequelize";
import sequelize from "../database/registrocomisiones";
import IniciativaPuntoOrden from "./inciativas_puntos_ordens";
import PuntosOrden from "./puntos_ordens";

class IniciativaEstudio extends Model {
  declare id: string;
  declare id_iniciativa: ForeignKey<string> | null;
  declare id_punto_evento: ForeignKey<number> | null;
  declare status: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones (opcional)
  declare iniciativa?: NonAttribute<IniciativaPuntoOrden>;
  declare puntoEvento?: NonAttribute<PuntosOrden>;

  declare static associations: {
    iniciativa: Association<IniciativaEstudio, IniciativaPuntoOrden>;
    puntoEvento: Association<IniciativaEstudio, PuntosOrden>;
  };
}

IniciativaEstudio.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_iniciativa: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_punto_evento: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "iniciativas_estudios",
    timestamps: true,
    paranoid: true,
  }
);

IniciativaEstudio.belongsTo(PuntosOrden, { 
  foreignKey: 'id_punto_evento', 
  as: 'puntoEvento' 
});

export default IniciativaEstudio;