import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

/** Una corrida de transcripción de una sesión (agenda). */
class TranscripcionSesion extends Model {
  declare id: string;
  declare id_agenda: string;
  declare titulo: string | null;
  declare url: string | null;
  declare inicio: Date | null;
  declare fin: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TranscripcionSesion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    id_agenda: { type: DataTypes.CHAR(36), allowNull: false },
    titulo: { type: DataTypes.TEXT, allowNull: true },
    url: { type: DataTypes.TEXT, allowNull: true },
    inicio: { type: DataTypes.DATE, allowNull: true },
    fin: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'transcripcion_sesiones', timestamps: true },
);

export default TranscripcionSesion;
