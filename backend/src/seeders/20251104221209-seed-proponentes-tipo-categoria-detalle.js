'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [proponentes] = await queryInterface.sequelize.query(`SELECT id, valor FROM proponentes`);
    const [tipos] = await queryInterface.sequelize.query(`SELECT id, valor FROM tipo_categoria_iniciativas`);

    const relaciones = [];

    const mapTipos = (proponenteValor, tipoNombres) => {
      const prop = proponentes.find(p => p.valor === proponenteValor);
      if (!prop) return;
      tipoNombres.forEach(nombre => {
        const tipo = tipos.find(t => t.valor === nombre);
        if (tipo) {
          relaciones.push({
            proponente_id: prop.id,
            tipo_categoria_id: tipo.id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      });
    };

    // ==============================
    // Relaciones según tus reglas
    // ==============================

    mapTipos('Diputadas y Diputados', [
      'Acuerdo',
      'Comunicado',
      'Declaratoria de aprobación de minuta',
      'Decreto',
      'Efeméride',
      'Elección de la diputación permanente',
      'Elección de la mesa directiva',
      'Elección de la presidencia  de la mesa directiva',
      'Elección de la vicepresidentes y secretarios de la directiva',
      'Iniciativa',
      'Posicionamiento',
      'Pronunciamiento',
      'Reincorporación',
      'Renuncia',
      'Solicitud',
      'Solicitud de licencia'
    ]);


    mapTipos('Mesa Directiva en turno', [
      'Acta de la sesión anterior',
      'Aviso',
      'Clausura de la sesión / junta',
      'Comunicado',
      'Declaratoria de aprobación de minuta',
      'Declaratoria de instalación',
      'Declaratoria formal de constitución',
      'Declaratoria solemne de clausura',
      'Declaratoria solemne de apertura',
      'Designación de comisión protocolaria',
      'Emisión de convocatoria pública',
      'Himno del Estado de México',
      'Himno Nacional',
      'Informe de actividades/funciones',
      'Iniciativa',
      'Protesta constitucional',
      'Reanudación de la sesión',
      'Receso',
      'Solicitud de licencia',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Junta de Coordinación Politica', [
      'Acuerdo',
      'Comunicado',
      'Punto de acuerdo',
      'Renuncia',
      'Solicitud',
      'Iniciativa'
    ]);

    mapTipos('Secretarías del GEM', [
      'Comparecencia',
      'Renuncia',
      'Solicitud',
      'Comunicado'
    ]);

   
    mapTipos('Gobernadora o Gobernador del Estado', [
      'Decreto',
      'Iniciativa',
      'Presentación de la cuenta pública',
      'Presupuesto de egresos del Gobierno del Estado de México',
      'Renuncia',
      'Solicitud',
      'Declaratoria de aprobación de minuta'
    ]);


    mapTipos('Tribunal Superior de Justicia', [
      'Decreto',
      'Iniciativa',
      'Renuncia',
      'Solicitud'
    ]);

 
    mapTipos('Ayuntamientos', [
      'Decreto',
      'Iniciativa',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Ciudadanas y ciudadanos del Estado', [
      'Decreto',
      'Iniciativa',
      'Renuncia',
      'Solicitud'
    ]);

 
    mapTipos('Comición de Derechos Humanos del Estado de México', [
      'Decreto',
      'Iniciativa',
      'Renuncia',
      'Solicitud'
    ]);

  
    mapTipos('Fiscalía General de Justicia del Estado de México', [
      'Decreto',
      'Iniciativa',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Comisiones Legislativas', [
      'Dictamen',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Comisión instaladora', [
      'Entrega de documentación que obra en poder de la comisión instaladora',
      'Informe de funciones (Comisión instaladora)',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Municipios', [
      'Iniciativas de tarifas de agua',
      'Tabla de valores unitarios de suelos y construcciones',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Diputación Permanente', [
      'Acta de la sesión anterior',
      'Acuerdo',
      'Clausura de la sesión / junta',
      'Declaratoria de instalación',
      'Dictamen',
      'Informe de actividades/funciones',
      'Iniciativa',
      'Instalación de la diputación permanente',
      'Minuta de proyecto de decreto',
      'Punto de acuerdo',
      'Listado de Asuntos'
    ]);


    mapTipos('Cámara de Diputados del H. Congreso de la Unión', [
      'Minuta de proyecto de decreto',
      'Renuncia',
      'Solicitud'
    ]);

  
    mapTipos('Cámara de Senadores del H. Congreso de la Unión', [
      'Minuta de proyecto de decreto',
      'Renuncia',
      'Solicitud'
    ]);


    mapTipos('Grupo Parlamentario', [
      'Iniciativa',
      'Punto de acuerdo'
    ]);


    mapTipos('Legislatura', [
      'Iniciativa'
    ]);

    mapTipos('GEM', [
      'Comunicado',
      'Solicitud'
    ]);


    if (relaciones.length > 0) {
      await queryInterface.bulkInsert('proponentes_tipo_categoria_detalle', relaciones);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('proponentes_tipo_categoria_detalle', null, {});
  },
};
