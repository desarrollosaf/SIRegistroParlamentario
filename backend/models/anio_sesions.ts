import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface anio_sesionsAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type anio_sesionsPk = "id";
export type anio_sesionsId = anio_sesions[anio_sesionsPk];
export type anio_sesionsOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type anio_sesionsCreationAttributes = Optional<anio_sesionsAttributes, anio_sesionsOptionalAttributes>;

export class anio_sesions extends Model<anio_sesionsAttributes, anio_sesionsCreationAttributes> implements anio_sesionsAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // anio_sesions hasMany sesiones via anio_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof anio_sesions {
    return anio_sesions.init({
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
    tableName: 'anio_sesions',
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
