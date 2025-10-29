import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import DatosUsers from './datos_users';
import EstatusDiputados from './estatus_diputados';

class MovimientosDiputados extends Model {
  declare id: string;
  declare fecha_movimiento: string;
  declare estatus_diputado_id: ForeignKey<string>;
  declare dato_user_id: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare dato_user?: DatosUsers;
  declare estatus_diputado?: EstatusDiputados;
}

// Inicialización
MovimientosDiputados.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    fecha_movimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estatus_diputado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'estatus_diputados',
        key: 'id',
      },
    },
    dato_user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'movimientos_diputados',
    timestamps: true,
    paranoid: true,
  }
);

// Asociaciones
MovimientosDiputados.belongsTo(DatosUsers, { foreignKey: 'dato_user_id', as: 'dato_user' });
MovimientosDiputados.belongsTo(EstatusDiputados, { foreignKey: 'estatus_diputado_id', as: 'estatus_diputado' });

export default MovimientosDiputados;
