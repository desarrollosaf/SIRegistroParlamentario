'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'precluida', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'expediente'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'precluida');
  }
};