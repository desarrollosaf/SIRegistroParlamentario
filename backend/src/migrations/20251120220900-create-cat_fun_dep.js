'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cat_fun_dep', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      nombre_dependencia: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      nombre_titular: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      vigente: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cat_fun_dep');
  }
};
