'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'publico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'precluida'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'publico');
  }
};