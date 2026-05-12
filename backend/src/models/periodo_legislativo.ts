import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/registrocomisiones';

/*
  SQL para crear la tabla en la base de datos registrocomisiones:

  CREATE TABLE periodos_legislativos (
    id        CHAR(36)     NOT NULL PRIMARY KEY,
    nombre    VARCHAR(255) NOT NULL,
    anio_legislativo VARCHAR(100) NULL,
    fecha_inicio  DATE NOT NULL,
    fecha_termino DATE NOT NULL,
    tipo      INT NOT NULL DEFAULT 1, -- 1=ordinario, 2=extraordinario
    createdAt DATETIME NULL,
    updatedAt DATETIME NULL,
    deletedAt DATETIME NULL
  );
*/

class PeriodoLegislativo extends Model {
  declare id: string;
  declare nombre: string;
  declare anio_legislativo: string | null;
  declare fecha_inicio: string;
  declare fecha_termino: string;
  declare tipo: number; // 1=ordinario, 2=extraordinario
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

PeriodoLegislativo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    anio_legislativo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_termino: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'periodos_legislativos',
    timestamps: true,
    paranoid: true,
  }
);

export default PeriodoLegislativo;
