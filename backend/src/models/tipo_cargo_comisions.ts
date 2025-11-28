import {
  Model,
  DataTypes,
  CreationOptional,
  Association,
  NonAttribute,
  ForeignKey
} from "sequelize";

import sequelize from "../database/registrocomisiones";
import IntegranteComision from "./integrante_comisions";

class TipoCargoComision extends Model {
  declare id: string;
  declare valor: string;
  declare nivel: number;

  // timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociaciones
  declare integrante_comisions?: NonAttribute<IntegranteComision[]>;

  declare static associations: {
    integrante_comisions: Association<TipoCargoComision, IntegranteComision>;
  };
}

TipoCargoComision.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at"
    }
  },
  {
    sequelize,
    tableName: "tipo_cargo_comisions",
    timestamps: true,
    paranoid: false,
    underscored: true // usa snake_case
  }
);

// 🔗 Asociación
// TipoCargoComision.hasMany(IntegranteComision, {
//   foreignKey: "id_tipo_cargo",
//   as: "integrante_comisions"
// });

export default TipoCargoComision;
