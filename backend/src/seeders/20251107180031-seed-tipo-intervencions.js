'use strict';

module.exports = {
  async up(queryInterface) {
    const { v4: uuidv4 } = await import('uuid');

    const datos = [
      { id: uuidv4(), valor: 'A favor', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), valor: 'En contra', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), valor: 'Comentario', created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('tipo_intervencions', datos);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tipo_intervencions', null, {});
  },
};
