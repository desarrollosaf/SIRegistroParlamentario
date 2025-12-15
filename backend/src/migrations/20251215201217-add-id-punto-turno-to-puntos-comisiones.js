'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'puntos_comisiones',
      'id_punto_turno',
      {
        type: Sequelize.INTEGER,
        allowNull: true, 
        defaultValue: null 
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('puntos_comisiones', 'id_punto_turno');
  }
};