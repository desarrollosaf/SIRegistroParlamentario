'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expedientes_estudio_puntos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      expediente_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'puntos_ordens',
          key: 'id'
        },
      },
      punto_origen_sesion_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'puntos_ordens',
          key: 'id'
        },
      },
     
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expedientes_estudio_puntos');
  }
};