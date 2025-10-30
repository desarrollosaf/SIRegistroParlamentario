import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import Comunicados from './comunicados';
import Sesiones from './sesiones';

class ComunicadosSesion extends Model {
  declare id: string;
  declare id_sesion: ForeignKey<string>;
  declare comunicado_id: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Relaciones
  declare comunicado?: NonAttribute<Comunicados>;
  declare sesion?: NonAttribute<Sesiones>;

  declare static associations: {
    comunicado: Association<ComunicadosSesion, Comunicados>;
    sesion: Association<ComunicadosSesion, Sesiones>;
  };
}

ComunicadosSesion.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    id_sesion: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id',
      },
    },
    comunicado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'comunicados',
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
    tableName: 'comunicados_sesions',
    timestamps: true,
    underscored: true, // 👈 nombres tipo snake_case
  }
);

// 🔗 Asociaciones
ComunicadosSesion.belongsTo(Comunicados, {
  foreignKey: 'comunicado_id',
  as: 'comunicado',
});

ComunicadosSesion.belongsTo(Sesiones, {
  foreignKey: 'id_sesion',
  as: 'sesion',
});

export default ComunicadosSesion;
