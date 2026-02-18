'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('iniciativas_estudios', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      id_iniciativa: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'inciativas_puntos_ordens',
          key: 'id'
        },
      },
      id_punto_evento: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'puntos_ordens',
          key: 'id'
        },
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('iniciativas_estudios');
  }
};