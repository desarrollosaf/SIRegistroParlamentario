'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendas', 'version_estenografica', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'liga'
    });
    await queryInterface.addColumn('agendas', 'orden_dia', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'version_estenografica'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendas', 'version_estenografica');
    await queryInterface.removeColumn('agendas', 'orden_dia');
  }
};