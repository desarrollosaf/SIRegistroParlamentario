'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'integrante_legislatura_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      defaultValue: null,
      after: 'remember_token',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'integrante_legislatura_id');
  }
};
