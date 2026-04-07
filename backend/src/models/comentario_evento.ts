import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/registrocomisiones';
import Agenda from './agendas';

class ComentarioEvento extends Model {
    declare id: string;
    declare id_evento: ForeignKey<string>;
    declare comentario: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ComentarioEvento.init(
    {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        id_evento: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        comentario: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'createdAt'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updatedAt'
        }
    },
    {
        sequelize,
        tableName: 'comentarios_evento',
        timestamps: true
    }
);

// Asociación
ComentarioEvento.belongsTo(Agenda, { foreignKey: 'id_evento', as: 'agenda' });
Agenda.hasMany(ComentarioEvento, { foreignKey: 'id_evento', as: 'comentarios' });

export default ComentarioEvento;