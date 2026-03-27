'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendas', 'publico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'tipo_reunion'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('agendas', 'publico');
  }
};