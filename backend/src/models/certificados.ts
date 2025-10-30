import { Model, DataTypes, CreationOptional, ForeignKey, Association, NonAttribute } from 'sequelize';
import sequelize from '../database/legislativoConnection';
import DatosUser from './datos_users';
import User from './users';

class Certificado extends Model {
  declare id: string;
  declare id_diputado: ForeignKey<string>;
  declare rfc: string;
  declare vigencia_inicio: string;
  declare vigencia_fin: string;
  declare path_firma_autografa: string;
  declare path_doc_validacion: string;
  declare path_certificado: string;
  declare id_usuario_registro: ForeignKey<string>;
  declare hash_certificado: string;
  declare status: CreationOptional<number>;
  declare fecha_revocacion: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Asociaciones
  declare diputado?: NonAttribute<DatosUser>;
  declare usuario_registro?: NonAttribute<User>;

  declare static associations: {
    diputado: Association<Certificado, DatosUser>;
    usuario_registro: Association<Certificado, User>;
  };
}

Certificado.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    id_diputado: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    vigencia_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    vigencia_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    path_firma_autografa: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path_doc_validacion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path_certificado: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_usuario_registro: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    hash_certificado: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    fecha_revocacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'certificados',
    timestamps: true,
  }
);

// 👇 Asociaciones
Certificado.belongsTo(DatosUser, { foreignKey: 'id_diputado', as: 'diputado' });
Certificado.belongsTo(User, { foreignKey: 'id_usuario_registro', as: 'usuario_registro' });

export default Certificado;