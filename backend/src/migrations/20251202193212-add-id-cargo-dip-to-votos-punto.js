'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('votos_punto', 'id_cargo_dip', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      after: 'id_comision_dip' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('votos_punto', 'id_cargo_dip');
  }
};