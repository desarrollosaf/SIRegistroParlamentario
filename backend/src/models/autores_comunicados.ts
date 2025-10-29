import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import Comunicado from './comunicados';

class AutorComunicado extends Model {
  declare id: string;
  declare comunicado_id: ForeignKey<string>;
  declare tipo_autor_id: string;
  declare autor_id: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare comunicado?: NonAttribute<Comunicado>;

  declare static associations: {
    comunicado: Association<AutorComunicado, Comunicado>;
  };
}

AutorComunicado.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    comunicado_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    tipo_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'autores_comunicados',
    timestamps: true,
    paranoid: true,
  }
);

// 👇 Asociaciones
AutorComunicado.belongsTo(Comunicado, { foreignKey: 'comunicado_id', as: 'comunicado' });

export default AutorComunicado;