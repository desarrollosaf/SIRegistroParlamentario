"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("puntos_ordens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_evento: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      nopunto: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      punto: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      observaciones: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      path_doc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tribuna: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      id_tipo: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      punto_turno_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      id_proponente: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      dispensa: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      editado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable("puntos_ordens");
  },
};
