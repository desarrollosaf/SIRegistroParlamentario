'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'proponentes',
      'tipo',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'valor' 
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('proponentes', 'tipo');
  }
};