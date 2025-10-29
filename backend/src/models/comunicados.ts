import { Model, DataTypes, CreationOptional, Association, NonAttribute, HasManyGetAssociationsMixin, ForeignKey } from 'sequelize';
import sequelize from '../database/parlamentariosConnection';
import AutoresComunicado from './autores_comunicados';
import ComunicadosSesion from './comunicados_sesions';
import DescripcioneComunicado from './descripcione_comunicados';

class Comunicado extends Model {
  declare id: string;
  declare fecha: string;
  declare comunicado: string;
  declare titulo: string;
  declare texto: string;
  declare publicado: boolean | null;
  declare fecha_publicacion: Date | null;
  declare sesion: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  // Relaciones
  declare autores?: NonAttribute<AutoresComunicado[]>;
  declare sesiones?: NonAttribute<ComunicadosSesion[]>;
  declare descripciones?: NonAttribute<DescripcioneComunicado[]>;

  declare static associations: {
    autores: Association<Comunicado, AutoresComunicado>;
    sesiones: Association<Comunicado, ComunicadosSesion>;
    descripciones: Association<Comunicado, DescripcioneComunicado>;
  };
}

Comunicado.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    comunicado: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sesion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'comunicados',
    timestamps: true,
    paranoid: true,
    underscored: true, // columnas tipo snake_case
  }
);

// 🔗 Asociaciones
Comunicado.hasMany(AutoresComunicado, {
  foreignKey: 'comunicado_id',
  as: 'autores',
});

Comunicado.hasMany(ComunicadosSesion, {
  foreignKey: 'comunicado_id',
  as: 'sesiones',
});

Comunicado.hasMany(DescripcioneComunicado, {
  foreignKey: 'comunicado_id',
  as: 'descripciones',
});

export default Comunicado;
