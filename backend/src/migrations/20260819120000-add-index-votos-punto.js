"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Sin estos índices, obtenerResultadosVotacionOptimizado (agenda.ts) hace un
    // full table scan en cada apertura de punto y en cada ciclo de polling (30s).
    await queryInterface.addIndex("votos_punto", ["id_tema_punto_voto"], {
      name: "idx_votos_punto_tema_punto_voto",
    });
    await queryInterface.addIndex("votos_punto", ["id_punto", "id_iniciativa"], {
      name: "idx_votos_punto_punto_iniciativa",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("votos_punto", "idx_votos_punto_tema_punto_voto");
    await queryInterface.removeIndex("votos_punto", "idx_votos_punto_punto_iniciativa");
  },
};
