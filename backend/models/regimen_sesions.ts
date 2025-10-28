import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface regimen_sesionsAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type regimen_sesionsPk = "id";
export type regimen_sesionsId = regimen_sesions[regimen_sesionsPk];
export type regimen_sesionsOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type regimen_sesionsCreationAttributes = Optional<regimen_sesionsAttributes, regimen_sesionsOptionalAttributes>;

export class regimen_sesions extends Model<regimen_sesionsAttributes, regimen_sesionsCreationAttributes> implements regimen_sesionsAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // regimen_sesions hasMany sesiones via regimen_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof regimen_sesions {
    return regimen_sesions.init({
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
    tableName: 'regimen_sesions',
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
