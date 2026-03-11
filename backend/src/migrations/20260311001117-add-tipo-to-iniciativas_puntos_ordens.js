'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'tipo', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'iniciativa'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'tipo');
  }
};