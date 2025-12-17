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

class PuntosComisiones extends Model {
  declare id: CreationOptional<number>;
  declare id_punto: ForeignKey<PuntosOrden["id"]>;
  declare id_comision: string | null;
  declare id_punto_turno: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare punto?: NonAttribute<PuntosOrden>;

  declare static associations: {
    punto: Association<PuntosComisiones, PuntosOrden>;
  };
}

PuntosComisiones.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_punto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "puntos_ordens",
        key: "id",
      },
    },

    id_comision: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    id_punto_turno: {
      type: DataTypes.INTEGER,
      allowNull: true 
    } 
  },
  {
    sequelize,
    tableName: "puntos_comisiones",
    timestamps: true,
    paranoid: false,
    underscored: false,
  }
);

// RELACIONES
// PuntosComisiones.belongsTo(PuntosOrden, {
//   foreignKey: "id_punto",
//   as: "punto",
// });


// PuntosOrden.hasMany(PuntosComisiones, {
//   foreignKey: "id_punto",
//   as: "comisiones",
// });

export default PuntosComisiones;
