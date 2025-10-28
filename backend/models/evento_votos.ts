import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface evento_votosAttributes {
  id: number;
  fechaEvento: string;
  horaEvento: string;
  nombreEvento: string;
  tipoEvento: string;
  idUsuario?: string;
  random: string;
  tipoEventoIntegrantes: string;
  estatus: string;
  noSesion: string;
  created_at?: Date;
  updated_at?: Date;
}

export type evento_votosPk = "id";
export type evento_votosId = evento_votos[evento_votosPk];
export type evento_votosOptionalAttributes = "id" | "idUsuario" | "created_at" | "updated_at";
export type evento_votosCreationAttributes = Optional<evento_votosAttributes, evento_votosOptionalAttributes>;

export class evento_votos extends Model<evento_votosAttributes, evento_votosCreationAttributes> implements evento_votosAttributes {
  id!: number;
  fechaEvento!: string;
  horaEvento!: string;
  nombreEvento!: string;
  tipoEvento!: string;
  idUsuario?: string;
  random!: string;
  tipoEventoIntegrantes!: string;
  estatus!: string;
  noSesion!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof evento_votos {
    return evento_votos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    fechaEvento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    horaEvento: {
      type: DataTypes.TIME,
      allowNull: false
    },
    nombreEvento: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tipoEvento: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    idUsuario: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    random: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tipoEventoIntegrantes: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estatus: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    noSesion: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'evento_votos',
    timestamps: true,
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
