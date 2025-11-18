'use strict';

module.exports = {
  async up(queryInterface) {
    const secretarias = [
      {
        valor: "Secretaría General de Gobierno",
        titular: "Mtro. Horacio Duarte Olivares"
      },
      {
        valor: "Secretaría de Seguridad",
        titular: "Tte. Cor. Inf. D.E.M. Cristóbal Castañeda Camarillo"
      },
      {
        valor: "Secretaría de Finanzas",
        titular: "C.P. Oscar Flores Jiménez"
      },
      {
        valor: "Secretaría de Salud",
        titular: "Dra. Macarena Montoya Olvera"
      },
      {
        valor: "Secretaría del Trabajo",
        titular: "Profesor Norberto Morales Poblete"
      },
      {
        valor: "Secretaría de Educación, Ciencia, Tecnología e Innovación",
        titular: "Mtro. Miguel Ángel Hernández Espejel"
      },
      {
        valor: "Secretaría de Bienestar",
        titular: "Mtro. Juan Carlos González Romero"
      },
      {
        valor: "Secretaría de Desarrollo Urbano e Infraestructura",
        titular: "Ing. Carlos Maza Lara"
      },
      {
        valor: "Secretaría del Campo",
        titular: "Mtra. María Eugenia Rojano Váldes"
      },
      {
        valor: "Secretaría de Desarrollo Económico",
        titular: "Lic. Laura González Hernández"
      },
      {
        valor: "Secretaría de Cultura y Turismo",
        titular: "Lic. Nelly Minerva Carrasco Godínez"
      },
      {
        valor: "Secretaría de la Contraloría",
        titular: "Lic. Hilda Salazar Gil"
      },
      {
        valor: "Secretaría del Medio Ambiente y Desarrollo Sostenible",
        titular: "Mtra. Alhely Rubio Arronis"
      },
      {
        valor: "Secretaría del Agua",
        titular: "Dr. Pedro Moctezuma Barragán"
      },
      {
        valor: "Secretaría de las Mujeres",
        titular: "Mtra. Mónica Chavéz Durán"
      },
      {
        valor: "Secretaría de Movilidad",
        titular: "Mtro. Daniel Andrés Sibaja González"
      }
    ];

    await queryInterface.bulkInsert(
      'secretarias',
      secretarias.map((item) => ({
        nombre: item.valor,
        titular: item.titular,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('secretarias', null, {});
  },
};
