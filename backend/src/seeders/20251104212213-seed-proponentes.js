'use strict';

module.exports = {
  async up(queryInterface) {
    const proponentes = [
      'Ayuntamientos',
      'Comisiones Legislativas',
      'Cámara de Diputados del H. Congreso de la Unión',
      'Fiscalía General de Justicia del Estado de México',
      'Gobernadora o Gobernador del Estado',
      'GEM',
      'Municipios',
      'Ciudadanas y ciudadanos del Estado',
      'Diputadas y Diputados',
      'Tribunal Superior de Justicia',
      'Junta de Coordinación Politica',
      'Comición de Derechos Humanos del Estado de México',
      'Secretarías del GEM',
      'Comisión instaladora',
      'Mesa Directiva en turno',
      'Legislatura',
      'Cámara de Senadores del H. Congreso de la Unión',
      'Diputación Permanente',
      'Grupo Parlamentario',
    ];

    await queryInterface.bulkInsert(
      'proponentes',
      proponentes.map((valor) => ({
        valor,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('proponentes', null, {});
  },
};
