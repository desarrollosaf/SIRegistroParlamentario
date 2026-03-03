'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'expediente', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'status'  
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'expediente');
  }
};