"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("votos_punto", {
      id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },
      sentido: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      mensaje: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      id_tema_punto_voto: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_diputado: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_partido: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      id_comision_dip: {
        type: Sequelize.CHAR(36),
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

  async down(queryInterface) {
    await queryInterface.dropTable("votos_punto");
  },
};
