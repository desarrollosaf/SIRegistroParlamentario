import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface periodo_sesionsAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type periodo_sesionsPk = "id";
export type periodo_sesionsId = periodo_sesions[periodo_sesionsPk];
export type periodo_sesionsOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type periodo_sesionsCreationAttributes = Optional<periodo_sesionsAttributes, periodo_sesionsOptionalAttributes>;

export class periodo_sesions extends Model<periodo_sesionsAttributes, periodo_sesionsCreationAttributes> implements periodo_sesionsAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // periodo_sesions hasMany sesiones via periodo_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof periodo_sesions {
    return periodo_sesions.init({
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
    tableName: 'periodo_sesions',
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
