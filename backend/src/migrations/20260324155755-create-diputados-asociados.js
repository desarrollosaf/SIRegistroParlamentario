'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diputados_asociados', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_diputado: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      partido_dip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comision_dip_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_cargo_dip: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_agenda: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('diputados_asociados');
  },
};