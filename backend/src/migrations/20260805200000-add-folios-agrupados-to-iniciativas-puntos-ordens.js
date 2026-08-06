'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'folios_agrupados', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'folio_historico',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'folios_agrupados');
  },
};
