'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('votos_punto', 'id_iniciativa', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      defaultValue: null,
      after: 'id_punto',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('votos_punto', 'id_iniciativa');
  }
};
