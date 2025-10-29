import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import type { DatosUsers } from './datos_users';

export class SolicitudFirmas extends Model<InferAttributes<SolicitudFirmas>, InferCreationAttributes<SolicitudFirmas>> {
  declare id: string;
  declare idDiputado: string;
  declare password: string;
  declare fechaSolicitud: string;
  declare fechaAtencion?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociación con datos_users
  declare diputado?: DatosUsers;

  declare getDiputado: Sequelize.BelongsToGetAssociationMixin<DatosUsers>;
  declare setDiputado: Sequelize.BelongsToSetAssociationMixin<DatosUsers, string>;
  declare createDiputado: Sequelize.BelongsToCreateAssociationMixin<DatosUsers>;
}

SolicitudFirmas.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    idDiputado: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'datos_users',
        key: 'id',
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fechaSolicitud: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaAtencion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'solicitud_firmas',
    timestamps: true,
    paranoid: false,
    indexes: [
      { name: 'PRIMARY', unique: true, using: 'BTREE', fields: ['id'] },
      { name: 'solicitud_firmas_id_diputado_foreign', using: 'BTREE', fields: ['idDiputado'] },
    ],
  }
);

export default SolicitudFirmas;
