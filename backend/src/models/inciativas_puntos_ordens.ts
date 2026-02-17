import {
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  Association,
} from "sequelize";
import sequelize from "../database/registrocomisiones";
import PuntosOrden from "./puntos_ordens";
import Agenda from "./agendas";

class IniciativaPuntoOrden extends Model {
  declare id: string;
  declare id_punto: ForeignKey<string> | null;
  declare id_evento: ForeignKey<string>;
  declare iniciativa: string | null;
  declare fecha_votacion: Date | null;
  declare status: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones (opcional)
  declare punto?: NonAttribute<PuntosOrden>;
  declare evento?: NonAttribute<Agenda>;

  declare static associations: {
    punto: Association<IniciativaPuntoOrden, PuntosOrden>;
    evento: Association<IniciativaPuntoOrden, Agenda>;
  };
}

IniciativaPuntoOrden.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    id_punto: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    iniciativa: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    fecha_votacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: "inciativas_puntos_ordens",
    timestamps: true,
    paranoid: true,
  }
);

// IniciativaPuntoOrden.belongsTo(PuntosOrden, { foreignKey: 'id_punto', as: 'punto' });
IniciativaPuntoOrden.belongsTo(Agenda, { foreignKey: 'id_evento', as: 'evento' });

export default IniciativaPuntoOrden;