'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('puntos_ordens', 'video_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'punto',
    });
    await queryInterface.addColumn('puntos_ordens', 'video_actualizado_en', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'video_url',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('puntos_ordens', 'video_actualizado_en');
    await queryInterface.removeColumn('puntos_ordens', 'video_url');
  },
};
