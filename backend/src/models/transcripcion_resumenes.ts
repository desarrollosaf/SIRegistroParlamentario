import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

/** Resumen ejecutivo (generado con Claude) de un turno de intervención.
 *  Se ancla al id de la primera participación del turno (ancla_id). */
class TranscripcionResumen extends Model {
  declare id: string;
  declare id_sesion: string;
  declare ancla_id: string;
  declare orador: string | null;
  declare resumen: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TranscripcionResumen.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    id_sesion: { type: DataTypes.CHAR(36), allowNull: false },
    ancla_id: { type: DataTypes.CHAR(36), allowNull: false, unique: true },
    orador: { type: DataTypes.TEXT, allowNull: true },
    resumen: { type: DataTypes.TEXT('long'), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'transcripcion_resumenes', timestamps: true },
);

export default TranscripcionResumen;
