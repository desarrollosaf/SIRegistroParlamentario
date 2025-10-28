import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface tipo_asambleasAttributes {
  id: string;
  valor: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type tipo_asambleasPk = "id";
export type tipo_asambleasId = tipo_asambleas[tipo_asambleasPk];
export type tipo_asambleasOptionalAttributes = "deleted_at" | "created_at" | "updated_at";
export type tipo_asambleasCreationAttributes = Optional<tipo_asambleasAttributes, tipo_asambleasOptionalAttributes>;

export class tipo_asambleas extends Model<tipo_asambleasAttributes, tipo_asambleasCreationAttributes> implements tipo_asambleasAttributes {
  id!: string;
  valor!: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;

  // tipo_asambleas hasMany sesiones via tipo_asamblea_id
  sesiones!: sesiones[];
  getSesiones!: Sequelize.HasManyGetAssociationsMixin<sesiones>;
  setSesiones!: Sequelize.HasManySetAssociationsMixin<sesiones, sesionesId>;
  addSesione!: Sequelize.HasManyAddAssociationMixin<sesiones, sesionesId>;
  addSesiones!: Sequelize.HasManyAddAssociationsMixin<sesiones, sesionesId>;
  createSesione!: Sequelize.HasManyCreateAssociationMixin<sesiones>;
  removeSesione!: Sequelize.HasManyRemoveAssociationMixin<sesiones, sesionesId>;
  removeSesiones!: Sequelize.HasManyRemoveAssociationsMixin<sesiones, sesionesId>;
  hasSesione!: Sequelize.HasManyHasAssociationMixin<sesiones, sesionesId>;
  hasSesiones!: Sequelize.HasManyHasAssociationsMixin<sesiones, sesionesId>;
  countSesiones!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_asambleas {
    return tipo_asambleas.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_asambleas',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
