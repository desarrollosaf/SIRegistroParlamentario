'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'path_doc', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'expediente' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'path_doc');
  }
};