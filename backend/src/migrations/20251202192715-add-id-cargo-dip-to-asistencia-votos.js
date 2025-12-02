'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('asistencia_votos', 'id_cargo_dip', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      after: 'comision_dip_id' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('asistencia_votos', 'id_cargo_dip');
  }
};