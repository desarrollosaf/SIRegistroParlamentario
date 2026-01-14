"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Actualizar el campo id_punto en votos_punto desde temas_puntos_votos
    await queryInterface.sequelize.query(`
      UPDATE votos_punto vp
      INNER JOIN temas_puntos_votos tpv ON vp.id_tema_punto_voto = tpv.id
      SET vp.id_punto = tpv.id_punto
      WHERE vp.id_tema_punto_voto IS NOT NULL
    `);

    // 2. Poner id_tema_punto_voto a NULL en votos_punto
    await queryInterface.sequelize.query(`
      UPDATE votos_punto
      SET id_tema_punto_voto = NULL
      WHERE id_tema_punto_voto IS NOT NULL
    `);

    // 3. Truncar la tabla temas_puntos_votos
    await queryInterface.sequelize.query(`
      TRUNCATE TABLE temas_puntos_votos
    `);
  },

  async down(queryInterface, Sequelize) {
    // No es posible revertir esta operación de manera automática
    // ya que se perdieron los datos de temas_puntos_votos
    console.log("Esta operación no puede ser revertida automáticamente");
  },
};