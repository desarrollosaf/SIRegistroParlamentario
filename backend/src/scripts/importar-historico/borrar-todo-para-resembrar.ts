/**
 * Borra TODO el contenido de las tablas operativas de iniciativas (a pedido
 * explícito del usuario, que confirmó tener respaldo). Deja intactos
 * `agendas` y `puntos_ordens` (los eventos y el orden del día real).
 *
 * Orden de borrado por dependencias:
 *   iniciativas_estudios, expedientes_estudio_puntos, expedientes,
 *   puntos_comisiones, iniciativas_presenta, inciativas_puntos_ordens
 */
import IniciativaEstudio from '../../models/iniciativas_estudio';
import ExpedienteEstudiosPuntos from '../../models/expedientes_estudio_puntos';
import Expediente from '../../models/expediente';
import PuntosComisiones from '../../models/puntos_comisiones';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';

async function main() {
  console.log(`iniciativas_estudios: ${await IniciativaEstudio.destroy({ where: {}, force: true })}`);
  console.log(`expedientes_estudio_puntos: ${await ExpedienteEstudiosPuntos.destroy({ where: {} })}`);
  console.log(`expedientes: ${await Expediente.destroy({ where: {} })}`);
  console.log(`puntos_comisiones: ${await PuntosComisiones.destroy({ where: {} })}`);
  console.log(`iniciativas_presenta: ${await IniciativasPresenta.destroy({ where: {}, force: true })}`);
  console.log(`inciativas_puntos_ordens: ${await IniciativaPuntoOrden.destroy({ where: {}, force: true })}`);
  console.log('\n✔ Listo. agendas y puntos_ordens no se tocaron.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
