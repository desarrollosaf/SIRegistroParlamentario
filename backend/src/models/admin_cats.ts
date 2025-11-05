import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/pleno';

class AdminCat extends Model {
  declare id: CreationOptional<number>;
  declare id_presenta: string;
  declare secretaria: string | null;
  declare titular: string;
  declare periodo_inicio: string | null;
  declare periodo_fin: string | null;
  declare status: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AdminCat.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    id_presenta: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    secretaria: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    titular: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    periodo_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    periodo_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'admin_cats',
    timestamps: true,
  }
);

// 👇 Asociaciones
// AdminCat.belongsTo(OtroModelo, { foreignKey: 'id_presenta', as: 'Presenta' });

export default AdminCat;