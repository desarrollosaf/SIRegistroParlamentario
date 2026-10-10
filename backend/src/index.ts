import 'dotenv/config'   // carga .env antes que cualquier módulo lea process.env
// import SUsuario from "./models/saf/s_usuario"
// import Departamento from "./models/saf/t_departamento"
// import Dependencia from "./models/saf/t_dependencia"
// import Direccion from "./models/saf/t_direccion"
import Server, { ROLE } from "./models/server"
import './models/associations'
import { startSpidVotingSync } from './services/spidVotingSync'
import { monitorearPool } from './utils/metricas'
import sequelizeSaf from './database/connection'
import sequelizeLegislativo from './database/legislativoConnection'
import sequelizeRegistro from './database/registrocomisiones'
import sequelizePleno from './database/pleno'
import sequelizeSpid from './database/spidConnection'

// Fase 0: mide cuánto espera cada petición por una conexión libre de cada
// pool (ver GET /api/diagnostico/metricas y los logs [POOL-ESPERA]).
monitorearPool('saf', sequelizeSaf)
monitorearPool('legislativo', sequelizeLegislativo)
monitorearPool('registrocomisiones', sequelizeRegistro)
monitorearPool('pleno', sequelizePleno)
monitorearPool('spid', sequelizeSpid)

// Red de seguridad: evita que un error no capturado (fuera de los handlers de
// socket, que ya están protegidos) tumbe el proceso completo en producción.
process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
});

const server =  new Server()

// Plan de contingencia: espejo (solo lectura) de spid hacia este backend.
// Opt-in vía SPID_SYNC_ENABLED, ver services/spidVotingSync.ts.
// Solo en el núcleo: escribe votos y necesita el estado de votaciones abiertas.
if (ROLE !== 'consultas') startSpidVotingSync(server.getApp())

const models = {
    // SUsuario,
    // Dependencia, 
    // Direccion,
    // Departamento,
};



Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export default models;