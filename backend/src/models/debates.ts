import {
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  Association,
} from 'sequelize';
import sequelize from '../database/legislativoConnection';
import TomoDebate from './tomo_debates';

class Debate extends Model {
  declare id: string;
  declare descripcion: string;
  declare path: string;
  declare fecha_debate: string;
  declare id_tomo: ForeignKey<TomoDebate['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociación
  declare tomo?: NonAttribute<TomoDebate>;

  declare static associations: {
    tomo: Association<Debate, TomoDebate>;
  };
}

Debate.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha_debate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_tomo: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: TomoDebate,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'debates',
    timestamps: true,
    underscored: true,
  }
);

// 🔗 Asociación
Debate.belongsTo(TomoDebate, {
  foreignKey: 'id_tomo',
  as: 'tomo',
});

export default Debate;
