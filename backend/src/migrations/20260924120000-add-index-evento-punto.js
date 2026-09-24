"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Estas tablas se consultan por evento/punto en cada sesión (orden del día,
    // iniciativas del punto, reservas, intervenciones) y no tenían ningún
    // índice más allá de la PK — mismo patrón que
    // 20260819120000-add-index-votos-punto.js y
    // 20260903120000-add-index-asistencia-votos.js.
    await queryInterface.addIndex("puntos_ordens", ["id_evento"], {
      name: "idx_puntos_ordens_evento",
    });
    await queryInterface.addIndex("inciativas_puntos_ordens", ["id_evento"], {
      name: "idx_inciativas_puntos_ordens_evento",
    });
    await queryInterface.addIndex("inciativas_puntos_ordens", ["id_punto"], {
      name: "idx_inciativas_puntos_ordens_punto",
    });
    await queryInterface.addIndex("temas_puntos_votos", ["id_punto"], {
      name: "idx_temas_puntos_votos_punto",
    });
    await queryInterface.addIndex("temas_puntos_votos", ["id_evento"], {
      name: "idx_temas_puntos_votos_evento",
    });
    await queryInterface.addIndex("intervenciones", ["id_evento"], {
      name: "idx_intervenciones_evento",
    });
    await queryInterface.addIndex("intervenciones", ["id_punto"], {
      name: "idx_intervenciones_punto",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("puntos_ordens", "idx_puntos_ordens_evento");
    await queryInterface.removeIndex("inciativas_puntos_ordens", "idx_inciativas_puntos_ordens_evento");
    await queryInterface.removeIndex("inciativas_puntos_ordens", "idx_inciativas_puntos_ordens_punto");
    await queryInterface.removeIndex("temas_puntos_votos", "idx_temas_puntos_votos_punto");
    await queryInterface.removeIndex("temas_puntos_votos", "idx_temas_puntos_votos_evento");
    await queryInterface.removeIndex("intervenciones", "idx_intervenciones_evento");
    await queryInterface.removeIndex("intervenciones", "idx_intervenciones_punto");
  },
};
