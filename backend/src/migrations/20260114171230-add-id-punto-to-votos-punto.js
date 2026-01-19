"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("votos_punto", "id_punto", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "mensaje", // Para MySQL/MariaDB
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("votos_punto", "id_punto");
  },
};