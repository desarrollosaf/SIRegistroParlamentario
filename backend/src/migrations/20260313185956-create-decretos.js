'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('decretos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      num_decreto: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fecha_decreto: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      nombre_decreto: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      decreto: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_iniciativa: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      congreso: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('decretos');
  }
};