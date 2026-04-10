'use strict';

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_PATH = path.resolve(__dirname, '../data/decretos-iniciativas.csv');

function limpiarKeys(obj) {
  const nuevo = {};
  for (const key in obj) {
    const cleanKey = key.replace(/^\uFEFF/, '').trim();
    nuevo[cleanKey] = obj[key];
  }
  return nuevo;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`No se encontró el CSV en: ${CSV_PATH}`);
    }

    const contenido = fs.readFileSync(CSV_PATH, 'utf8');
    const registros = parse(contenido, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`\n📂 CSV cargado: ${registros.length} registros encontrados.\n`);

    // 🔹 CONTADORES POR TABLA
    let upd_iniciativas = 0;
    let fail_iniciativas = [];

    let ins_decretos = 0;
    let upd_decretos = 0;
    let res_decretos = 0;
    let fail_decretos = [];

    for (const filaRaw of registros) {
      const fila = limpiarKeys(filaRaw);

      const idIniciativa   = fila['id_iniciativa']?.trim();
      const rutaIniciativa = fila['ruta_iniciativa']?.trim();
      const rutaDecreto    = fila['ruta_decreto']?.trim();

      if (!idIniciativa) continue;

      // ── UPDATE iniciativas ──────────────────────────
      if (rutaIniciativa) {

        const [_, metadata] = await queryInterface.sequelize.query(
          `UPDATE \`inciativas_puntos_ordens\`
              SET \`path_doc\`  = :rutaIniciativa,
                  \`updatedAt\` = NOW()
            WHERE \`id\` = :idIniciativa
              AND \`deletedAt\` IS NULL`,
          {
            replacements: { rutaIniciativa, idIniciativa },
            type: Sequelize.QueryTypes.UPDATE,
          }
        );

        const afectadas = metadata?.affectedRows || metadata || 0;

        if (afectadas > 0) {
          upd_iniciativas++;
        } else {
          fail_iniciativas.push(idIniciativa);
        }
      }

      // ── UPSERT decretos ─────────────────────────────
      if (rutaDecreto) {

        const existentes = await queryInterface.sequelize.query(
          `SELECT \`id\`, \`deletedAt\` FROM \`decretos\`
            WHERE \`id_iniciativa\` = :idIniciativa
              AND \`decreto\`       = :rutaDecreto
            LIMIT 1`,
          {
            replacements: { idIniciativa, rutaDecreto },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        const existente = existentes[0];

        if (existente) {
          if (existente.deletedAt !== null) {
            await queryInterface.sequelize.query(
              `UPDATE \`decretos\`
                  SET \`deletedAt\` = NULL,
                      \`updatedAt\` = NOW()
                WHERE \`id\` = :id`,
              {
                replacements: { id: existente.id },
                type: Sequelize.QueryTypes.UPDATE,
              }
            );
            res_decretos++;
          } else {
            upd_decretos++; // ya existía activo
          }
        } else {
          await queryInterface.sequelize.query(
            `INSERT INTO \`decretos\`
              (\`id_iniciativa\`, \`decreto\`, \`createdAt\`, \`updatedAt\`)
             VALUES
              (:idIniciativa, :rutaDecreto, NOW(), NOW())`,
            {
              replacements: { idIniciativa, rutaDecreto },
              type: Sequelize.QueryTypes.INSERT,
            }
          );
          ins_decretos++;
        }

        // validar si no existe nada (edge raro)
        if (!existente && !rutaDecreto) {
          fail_decretos.push(idIniciativa);
        }
      }
    }

    // ── REPORTE FINAL ─────────────────────────────────

    console.log('\n══════════ 📊 REPORTE FINAL ══════════\n');

    console.log('📁 inciativas_puntos_ordens');
    console.log(`✔ Actualizados: ${upd_iniciativas}`);
    console.log(`❌ No encontrados: ${fail_iniciativas.length}`);

    if (fail_iniciativas.length) {
      console.log('IDs no encontrados (iniciativas):');
      console.log(fail_iniciativas.slice(0, 20)); // solo primeros 20
    }

    console.log('\n📁 decretos');
    console.log(`➕ Insertados : ${ins_decretos}`);
    console.log(`♻️ Restaurados: ${res_decretos}`);
    console.log(`✔ Ya existían : ${upd_decretos}`);
    console.log(`❌ Fallidos    : ${fail_decretos.length}`);

    if (fail_decretos.length) {
      console.log('IDs con problema (decretos):');
      console.log(fail_decretos.slice(0, 20));
    }

    console.log('\n══════════════════════════════════════\n');
  },

  async down() {
    console.log('↩️ down no implementado en esta versión');
  },
};