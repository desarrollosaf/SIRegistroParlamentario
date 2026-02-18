import {
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  Association,
} from "sequelize";
import sequelize from "../database/registrocomisiones";

import TipoCategoriaIniciativas from "./tipo_categoria_iniciativas";
import Proponentes from "./proponentes";
import PuntosPresenta from "./puntos_presenta";
import Agenda from "./agendas";
import TemasPuntosVotos from "./temas_puntos_votos";
import PuntosComisiones from "./puntos_comisiones";
import IniciativaPuntoOrden from "./inciativas_puntos_ordens";



class PuntosOrden extends Model {
  declare id: CreationOptional<number>;
  declare id_evento: null;
  declare nopunto: number | null;
  declare punto: string;
  declare observaciones: string | null;
  declare path_doc: string | null;
  declare tribuna:  null;
  declare id_tipo:  null;
  declare status: boolean;
  declare punto_turno_id:  null;
  declare id_proponente:  null;
  declare id_dictamen: number | null;
  declare dispensa: number | null;
  declare editado: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;


  declare tipo?: NonAttribute<TipoCategoriaIniciativas>;
  declare proponente?: NonAttribute<Proponentes>;


  declare static associations: {
    tipo: Association<PuntosOrden, TipoCategoriaIniciativas>;
    proponente: Association<PuntosOrden, Proponentes>;
  };
}

PuntosOrden.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_evento: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    nopunto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    punto: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tribuna: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_tipo: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    punto_turno_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_proponente: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    dispensa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    editado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    se_turna_comision: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    id_dictamen: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "puntos_ordens",
    timestamps: true,
    paranoid: true,
    underscored: false,
  }
);
PuntosOrden.hasMany(PuntosPresenta, {
  foreignKey: 'id_punto', as: 'presentan'
});
PuntosOrden.belongsTo(Agenda, { foreignKey: 'id_evento', as: 'evento' });

PuntosOrden.hasMany(PuntosComisiones, {
  foreignKey: 'id_punto_turno', as: 'puntoTurnoComision'
});

PuntosOrden.hasMany(PuntosComisiones, {
  foreignKey: 'id_punto', as: 'turnocomision'
});

PuntosOrden.hasMany(TemasPuntosVotos, {
  foreignKey: 'id_punto',  
  as: 'temasVotos',        
});

PuntosOrden.hasMany(TemasPuntosVotos, {
  foreignKey: "id_punto",
  as: "reservas",
});

// PuntosOrden.hasMany(IniciativaPuntoOrden, {
//   foreignKey: "id_punto",
//   as: "iniciativas",
// });



export default PuntosOrden;
