'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('intervenciones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_punto: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_evento: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_diputado: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_tipo_intervencion: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      mensaje: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      tipo: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      destacado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('intervenciones');
  },
};
