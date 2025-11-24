'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('puntos_presenta', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      id_punto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'puntos_ordens',
          key: 'id'
        },
      },

      id_tipo_presenta: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      id_presenta: {
        type: Sequelize.STRING,
        allowNull: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('puntos_presenta');
  }
};
