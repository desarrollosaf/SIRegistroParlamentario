'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inciativas_puntos_ordens', 'folio_historico', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'publico',
    });

    await queryInterface.addIndex('inciativas_puntos_ordens', ['folio_historico'], {
      name: 'inciativas_puntos_ordens_folio_historico_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('inciativas_puntos_ordens', 'inciativas_puntos_ordens_folio_historico_idx');
    await queryInterface.removeColumn('inciativas_puntos_ordens', 'folio_historico');
  },
};
