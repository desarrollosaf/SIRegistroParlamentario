import 'dotenv/config'   // carga .env antes que cualquier módulo lea process.env
// import SUsuario from "./models/saf/s_usuario"
// import Departamento from "./models/saf/t_departamento"
// import Dependencia from "./models/saf/t_dependencia"
// import Direccion from "./models/saf/t_direccion"
import Server from "./models/server"
import './models/associations'

// Red de seguridad: evita que un error no capturado (fuera de los handlers de
// socket, que ya están protegidos) tumbe el proceso completo en producción.
process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
});

const server =  new Server()

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