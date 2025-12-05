'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('puntos_comisiones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_punto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'puntos_ordens',
          key: 'id'
        },
      },
      id_comision: {
        type: Sequelize.CHAR(36),
        allowNull: true,
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
    await queryInterface.dropTable('puntos_comisiones');
  }
};