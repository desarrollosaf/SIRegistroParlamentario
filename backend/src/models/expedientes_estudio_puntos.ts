import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/registrocomisiones';


class ExpedienteEstudiosPuntos extends Model {
  declare id: string;
  declare expediente_id: number | null;
  declare punto_origen_sesion_id: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;


}

ExpedienteEstudiosPuntos.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    expediente_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    punto_origen_sesion_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    }
  },
  {
    sequelize,
    tableName: 'expedientes_estudio_puntos',
    timestamps: true,
    paranoid: true,
  }
);


export default ExpedienteEstudiosPuntos;