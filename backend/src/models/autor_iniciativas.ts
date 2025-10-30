import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import Iniciativa from './iniciativas';
import NivelAutor from './nivel_autors';

class AutorIniciativa extends Model {
  declare id: string;
  declare iniciativa_id: ForeignKey<string>;
  declare tipo_autor_id: string;
  declare autor_id: string;
  declare nivel_autor_id: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Asociaciones
  declare iniciativa?: NonAttribute<Iniciativa>;
  declare nivel_autor?: NonAttribute<NivelAutor>;

  declare static associations: {
    iniciativa: Association<AutorIniciativa, Iniciativa>;
    nivel_autor: Association<AutorIniciativa, NivelAutor>;
  };
}

AutorIniciativa.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    iniciativa_id: {
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
    nivel_autor_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'autor_iniciativas',
    timestamps: true,
    paranoid: true,
  }
);

// 👇 Asociaciones
AutorIniciativa.belongsTo(Iniciativa, { foreignKey: 'iniciativa_id', as: 'iniciativa' });
AutorIniciativa.belongsTo(NivelAutor, { foreignKey: 'nivel_autor_id', as: 'nivel_autor' });

export default AutorIniciativa;