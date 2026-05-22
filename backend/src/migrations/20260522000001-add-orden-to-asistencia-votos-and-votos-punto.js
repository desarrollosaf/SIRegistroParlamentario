'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('asistencia_votos', 'orden', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'comision_dip_id',
    });

    await queryInterface.addColumn('votos_punto', 'orden', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'id_comision_dip',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('asistencia_votos', 'orden');
    await queryInterface.removeColumn('votos_punto', 'orden');
  },
};
