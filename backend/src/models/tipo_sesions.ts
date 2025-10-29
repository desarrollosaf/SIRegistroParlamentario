import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface tipo_sesionsAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type tipo_sesionsPk = "id";
export type tipo_sesionsId = tipo_sesions[tipo_sesionsPk];
export type tipo_sesionsOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type tipo_sesionsCreationAttributes = Optional<tipo_sesionsAttributes, tipo_sesionsOptionalAttributes>;

export class tipo_sesions extends Model<tipo_sesionsAttributes, tipo_sesionsCreationAttributes> implements tipo_sesionsAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // tipo_sesions hasMany sesiones via tipo_sesion_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof tipo_sesions {
    return tipo_sesions.init({
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
    tableName: 'tipo_sesions',
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
