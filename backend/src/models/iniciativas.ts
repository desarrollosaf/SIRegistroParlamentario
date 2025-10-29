import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import AutorIniciativa from './autor_iniciativas';
import DecretoIniciativa from './decreto_iniciativas';

class Iniciativas extends Model {
  declare id: string;
  declare folio: number;
  declare categoria_id: string;
  declare iniciativa: string;
  declare fecha_presentacion: string;
  declare fecha_expedicion: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// Inicialización
Iniciativas.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    folio: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
    },
    categoria_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    iniciativa: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha_presentacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_expedicion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'iniciativas',
    timestamps: true,
  }
);

// Asociaciones
Iniciativas.hasMany(AutorIniciativa, { foreignKey: 'iniciativa_id', as: 'autor_iniciativas' });
Iniciativas.hasMany(DecretoIniciativa, { foreignKey: 'iniciativa_id', as: 'decreto_iniciativas' });

export default Iniciativas;
