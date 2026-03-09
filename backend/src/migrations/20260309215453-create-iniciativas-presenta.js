'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('iniciativas_presenta', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_iniciativa: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_tipo_presenta: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_presenta: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('iniciativas_presenta');
  },
};