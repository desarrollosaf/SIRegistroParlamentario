import { Model, DataTypes, CreationOptional, ForeignKey, NonAttribute, Association } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import Iniciativa from './iniciativas';

class DecretoIniciativa extends Model {
  declare id: string;
  declare fecha_decreto: string;
  declare numero_decreto: number;
  declare nombre_decreto: string;
  declare iniciativa_id: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociación
  declare iniciativa?: NonAttribute<Iniciativa>;

  declare static associations: {
    iniciativa: Association<DecretoIniciativa, Iniciativa>;
  };
}

DecretoIniciativa.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    fecha_decreto: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    numero_decreto: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    nombre_decreto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iniciativa_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'iniciativas',
        key: 'id',
      },
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
    tableName: 'decreto_iniciativas',
    timestamps: true,
    underscored: true, // Usa created_at / updated_at
  }
);

// 👇 Asociación
DecretoIniciativa.belongsTo(Iniciativa, {
  foreignKey: 'iniciativa_id',
  as: 'iniciativa',
});

export default DecretoIniciativa;
