"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Sin estos índices, cada consulta de asistencia (panel del diputado,
    // capturadora, obtenerListadoDiputados en agenda.ts, reportes) hace un
    // full table scan sobre asistencia_votos — la tabla no tenía ningún
    // índice más allá del id autoincremental. Mismo patrón que ya se aplicó
    // a votos_punto en 20260819120000-add-index-votos-punto.js.
    await queryInterface.addIndex("asistencia_votos", ["id_agenda"], {
      name: "idx_asistencia_votos_agenda",
    });
    await queryInterface.addIndex("asistencia_votos", ["id_diputado", "id_agenda"], {
      name: "idx_asistencia_votos_diputado_agenda",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("asistencia_votos", "idx_asistencia_votos_agenda");
    await queryInterface.removeIndex("asistencia_votos", "idx_asistencia_votos_diputado_agenda");
  },
};
