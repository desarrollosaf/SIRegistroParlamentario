import { Model, DataTypes, CreationOptional, ForeignKey, NonAttribute, Association } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import MarcoJ from './marco_j_s';

class DependenciaDocumento extends Model {
  declare id: number;
  declare id_marcoj: ForeignKey<number> | null;
  declare id_Dependencia: string | null;
  declare status: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociación
  declare marco_j?: NonAttribute<MarcoJ>;

  declare static associations: {
    marco_j: Association<DependenciaDocumento, MarcoJ>;
  };
}

DependenciaDocumento.init(
  {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    id_marcoj: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'marco_j_s',
        key: 'id',
      },
    },
    id_Dependencia: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'dependencia_documentos',
    timestamps: true,
    underscored: true, // para usar created_at y updated_at
  }
);

// 👇 Asociación
DependenciaDocumento.belongsTo(MarcoJ, {
  foreignKey: 'id_marcoj',
  as: 'marco_j',
});

export default DependenciaDocumento;
