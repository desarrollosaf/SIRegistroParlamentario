'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'puntos_ordens',
      'id_dictamen',
      {
        type: Sequelize.INTEGER,
        allowNull: true, 
        defaultValue: null 
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('puntos_ordens', 'id_dictamen');
  }
};