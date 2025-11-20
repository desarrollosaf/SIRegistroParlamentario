'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cat_fun_dep', [
      {
        tipo: "DEPENDENCIA",
        nombre_dependencia: "Fiscalía General de Justicia del Estado de México",
        nombre_titular: "José Luis Cervantes Martínez",
        vigente: 1,
        fecha_inicio: "2022-03-10",
        fecha_fin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tipo: "GOBERNADOR",
        nombre_dependencia: "Gobernadora o Gobernador del Estado",
        nombre_titular: "Delfina Gómez Álvarez",
        vigente: 1,
        fecha_inicio: "2023-09-16",
        fecha_fin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tipo: "DEPENDENCIA",
        nombre_dependencia: "Gobierno del Estado de México (GEM)",
        nombre_titular: "Delfina Gómez Álvarez",
        vigente: 1,
        fecha_inicio: "2023-09-16",
        fecha_fin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tipo: "DEPENDENCIA",
        nombre_dependencia: "Tribunal Superior de Justicia del Estado de México",
        nombre_titular: "Ricardo Sodi Cuellar",
        vigente: 1,
        fecha_inicio: "2020-02-01",
        fecha_fin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cat_fun_dep', null, {});
  }
};
