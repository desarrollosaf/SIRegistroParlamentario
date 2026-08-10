'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diputados', 'nombre_captura', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'nombres',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('diputados', 'nombre_captura');
  },
};
