import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/registrocomisiones';


class Expediente extends Model {
  declare id: string;
  declare evento_comision_id: string | null;
  declare descripcion: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;


}

Expediente.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    evento_comision_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion: {
     type: DataTypes.STRING(255),
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
    tableName: 'expedientes',
    timestamps: true,
    paranoid: true,
  }
);


export default Expediente;