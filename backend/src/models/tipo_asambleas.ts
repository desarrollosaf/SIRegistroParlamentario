import { Model, DataTypes, Optional, Sequelize, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import type { sesiones, sesionesId } from './sesiones';

export interface tipo_asambleasAttributes {
  id: string;
  valor: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type tipo_asambleasPk = "id";
export type tipo_asambleasId = tipo_asambleas[tipo_asambleasPk];
export type tipo_asambleasOptionalAttributes = "created_at" | "updated_at" | "deleted_at";
export type tipo_asambleasCreationAttributes = Optional<tipo_asambleasAttributes, tipo_asambleasOptionalAttributes>;

export class tipo_asambleas extends Model<tipo_asambleasAttributes, tipo_asambleasCreationAttributes> implements tipo_asambleasAttributes {
  id!: string;
  valor!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // Asociaciones
  sesiones!: sesiones[];
  getSesiones!: HasManyGetAssociationsMixin<sesiones>;
  setSesiones!: HasManySetAssociationsMixin<sesiones, sesionesId>;
  addSesione!: HasManyAddAssociationMixin<sesiones, sesionesId>;
  addSesiones!: HasManyAddAssociationsMixin<sesiones, sesionesId>;
  createSesione!: HasManyCreateAssociationMixin<sesiones>;
  removeSesione!: HasManyRemoveAssociationMixin<sesiones, sesionesId>;
  removeSesiones!: HasManyRemoveAssociationsMixin<sesiones, sesionesId>;
  hasSesione!: HasManyHasAssociationMixin<sesiones, sesionesId>;
  hasSesiones!: HasManyHasAssociationsMixin<sesiones, sesionesId>;
  countSesiones!: HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize): typeof tipo_asambleas {
    return tipo_asambleas.init(
      {
        id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          primaryKey: true
        },
        valor: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
      },
      {
        sequelize,
        tableName: 'tipo_asambleas',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: ['id']
          }
        ]
      }
    );
  }
}
