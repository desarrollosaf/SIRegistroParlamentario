import { Model, DataTypes, CreationOptional, ForeignKey, NonAttribute, Association } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import Comunicado from './comunicados';

class DescripcionComunicado extends Model {
  declare id: string;
  declare bullets: string;
  declare comunicado_id: ForeignKey<string>;
  declare orden: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociación
  declare comunicado?: NonAttribute<Comunicado>;

  declare static associations: {
    comunicado: Association<DescripcionComunicado, Comunicado>;
  };
}

DescripcionComunicado.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    bullets: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    comunicado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'comunicados',
        key: 'id',
      },
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'descripcione_comunicados',
    timestamps: true,
    paranoid: true,
    underscored: true, // created_at, updated_at, deleted_at
  }
);

// 👇 Asociación
DescripcionComunicado.belongsTo(Comunicado, {
  foreignKey: 'comunicado_id',
  as: 'comunicado',
});

export default DescripcionComunicado;
