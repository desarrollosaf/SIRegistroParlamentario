'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inciativas_puntos_ordens', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      id_punto: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_evento: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      iniciativa: {
        type: Sequelize.DataTypes.TEXT('long'),
        allowNull: true, 
      },
      fecha_votacion: {
        type: Sequelize.DataTypes.DATE, 
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: true, 
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
    await queryInterface.dropTable('Inciativas');
  }
};