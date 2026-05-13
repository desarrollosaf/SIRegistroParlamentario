'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'id_sap', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'publico',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'id_sap');
  },
};