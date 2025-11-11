"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("temas_puntos_votos", {
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
      tema_votacion: {
        type: Sequelize.STRING(255),
        allowNull: true, 
      },
      fecha_votacion: {
        type: Sequelize.DataTypes.DATE, 
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
    await queryInterface.dropTable("temas_puntos_votos");
  },
};
