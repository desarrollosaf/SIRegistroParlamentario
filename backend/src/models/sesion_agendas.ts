import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import type { Agendas } from './agendas';
import type { Sesiones } from './sesiones';

export class SesionAgendas extends Model<InferAttributes<SesionAgendas>, InferCreationAttributes<SesionAgendas>> {
  declare id: string;
  declare sesionesId: string;
  declare agendaId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare agenda?: Agendas;
  declare sesione?: Sesiones;
}

SesionAgendas.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    sesionesId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id',
      },
    },
    agendaId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'agendas',
        key: 'id',
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'sesion_agendas',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: ['id'],
      },
      {
        name: 'sesion_agendas_sesiones_id_foreign',
        using: 'BTREE',
        fields: ['sesionesId'],
      },
      {
        name: 'sesion_agendas_agenda_id_foreign',
        using: 'BTREE',
        fields: ['agendaId'],
      },
    ],
  }
);

export default SesionAgendas;
