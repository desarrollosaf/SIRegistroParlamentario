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

class Decreto extends Model {
  declare id: number;
  declare num_decreto: CreationOptional<string>;
  declare fecha_decreto: CreationOptional<Date>;
  declare nombre_decreto: CreationOptional<string>;
  declare decreto: CreationOptional<string>;
  declare id_iniciativa: ForeignKey<number> | null;
  declare congreso: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones
  declare iniciativa?: NonAttribute<IniciativaPuntoOrden>;

  declare static associations: {
    iniciativa: Association<Decreto, IniciativaPuntoOrden>;
  };
}

Decreto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    num_decreto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fecha_decreto: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nombre_decreto: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    decreto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_iniciativa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    congreso: {
      type: DataTypes.INTEGER,
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
    tableName: "decretos",
    timestamps: true,
    paranoid: true,
  }
);

Decreto.belongsTo(IniciativaPuntoOrden, {
  foreignKey: "id_iniciativa",
  as: "iniciativa",
});

IniciativaPuntoOrden.hasMany(Decreto, {
  foreignKey: "id_iniciativa",
  as: "decretos",
});

export default Decreto;