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
import TipoIntervencion from "./tipo_intervencions";
import Agenda from "./agendas";


class Intervencion extends Model {
  declare id: string;
  declare id_punto: ForeignKey<string> | null;
  declare id_evento: ForeignKey<string> | null;
  declare id_diputado: ForeignKey<string> | null;
  declare id_tipo_intervencion: ForeignKey<string> | null;
  declare mensaje: string | null;
  declare liga: string | null;
  declare tipo: number | null;
  declare destacado: boolean;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones (opcional)
  declare punto?: NonAttribute<PuntosOrden>;
  declare tipo_intervencion?: NonAttribute<TipoIntervencion>;

  declare static associations: {
    punto: Association<Intervencion, PuntosOrden>;
    tipo_intervencion: Association<Intervencion, TipoIntervencion>;
  };
}

Intervencion.init(
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
      allowNull: true,
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_tipo_intervencion: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    mensaje: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    liga: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    destacado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "intervenciones",
    timestamps: true,
    paranoid: true,
  }
);

Intervencion.belongsTo(TipoIntervencion, { foreignKey: 'id_tipo_intervencion', as: 'tipointerven' });
Intervencion.belongsTo(PuntosOrden, { foreignKey: 'id_punto', as: 'punto' });
Intervencion.belongsTo(Agenda, { foreignKey: 'id_evento', as: 'evento' });
export default Intervencion;
