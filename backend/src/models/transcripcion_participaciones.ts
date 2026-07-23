import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

/** Cada intervención transcrita (una línea del audio). */
class TranscripcionParticipacion extends Model {
  declare id: string;
  declare id_sesion: string;
  declare orden: number;
  declare orador: string | null;
  declare inicio_seg: number | null;
  declare fin_seg: number | null;
  declare inicio_hms: string | null;
  declare fin_hms: string | null;
  declare texto: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TranscripcionParticipacion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    id_sesion: { type: DataTypes.CHAR(36), allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    orador: { type: DataTypes.TEXT, allowNull: true },
    inicio_seg: { type: DataTypes.FLOAT, allowNull: true },
    fin_seg: { type: DataTypes.FLOAT, allowNull: true },
    inicio_hms: { type: DataTypes.STRING, allowNull: true },
    fin_hms: { type: DataTypes.STRING, allowNull: true },
    texto: { type: DataTypes.TEXT('long'), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'transcripcion_participaciones',
    timestamps: true,
    indexes: [{ fields: ['id_sesion'] }],
  },
);

export default TranscripcionParticipacion;
