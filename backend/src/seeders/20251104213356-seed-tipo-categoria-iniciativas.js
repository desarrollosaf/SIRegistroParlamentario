'use strict';

module.exports = {
  async up(queryInterface) {
    const tipos = [
      'Elección de la mesa directiva',
      'Iniciativa',
      'Clausura de la sesión / junta',
      'Instalación de la diputación permanente',
      'Elección de la presidencia  de la mesa directiva',
      'Dictamen',
      'Entrega de documentación que obra en poder de la comisión instaladora',
      'Emisión de convocatoria pública',
      'Posicionamiento',
      'Elección de la diputación permanente',
      'Comparecencia',
      'Reanudación de la sesión',
      'Decreto',
      'Himno Nacional',
      'Renuncia',
      'Junta de Coordinación Politica',
      'Himno del Estado de México',
      'Solicitud de licencia',
      'Listado de Asuntos',
      'Declaratoria solemne de clausura',
      'Iniciativas de tarifas de agua',
      'Pronunciamiento',
      'Presupuesto de egresos del Gobierno del Estado de México',
      'Comunicado',
      'Efeméride',
      'Declaratoria solemne de apertura',
      'Presentación de la cuenta pública',
      'Declaratoria de instalación',
      'Declaratoria de aprobación de minuta',
      'Punto de acuerdo',
      'Elección de la vicepresidentes y secretarios de la directiva',
      'Receso',
      'Reincorporación',
      'Solicitud',
      'Protesta constitucional',
      'Tabla de valores unitarios de suelos y construcciones',
      'Minuta de proyecto de decreto',
      'Acuerdo',
      'Acta de la sesión anterior',
      'Aviso',
      'Punto de acuerdo',
      'Informe de funciones (Comisión instaladora)',
      'Informe de actividades/funciones',
      'Designación de comisión protocolaria',
      'Declaratoria formal de constitución',
    ];

    await queryInterface.bulkInsert(
      'tipo_categoria_iniciativas',
      tipos.map((valor) => ({
        valor,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tipo_categoria_iniciativas', null, {});
  },
};
