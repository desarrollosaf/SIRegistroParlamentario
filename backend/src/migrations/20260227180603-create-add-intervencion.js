"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("intervenciones", "liga", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after: "tipo", // Para MySQL/MariaDB
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("intervenciones", "liga");
  },
};