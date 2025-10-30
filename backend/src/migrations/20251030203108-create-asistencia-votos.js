'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asistencia_votos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sentido_voto: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      mensaje: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      id_diputado: {
        type: Sequelize.DataTypes.CHAR(36),
        allowNull: false,
      },
      partido_dip: {
        type: Sequelize.DataTypes.CHAR(36),
        allowNull: false,
      },
      id_agenda: {
        type: Sequelize.DataTypes.CHAR(36),
        allowNull: false,
      },
      usuario_registra: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        field: 'created_at',
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.DataTypes.NOW,
      },
      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.DataTypes.NOW,
      },
      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('asistencia_votos');
  }
};
