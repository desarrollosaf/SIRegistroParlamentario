'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('intervenciones', 'resumen', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null,
      after: 'mensaje'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('intervenciones', 'resumen');
  },
};