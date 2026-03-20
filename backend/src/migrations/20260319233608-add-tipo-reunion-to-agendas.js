'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendas', 'tipo_reunion', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'documentacion_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('agendas', 'tipo_reunion');
  }
};