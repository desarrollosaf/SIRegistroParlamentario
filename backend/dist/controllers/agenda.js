"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportdatos = exports.enviarNotInicioEvento = exports.enviarWhatsAsistenciaPDF = exports.generarPDFAsistencia = exports.enviarWhatsVotacionPDF = exports.generarPDFVotacion = exports.EliminardipAsociado = exports.Eliminarlista = exports.addDipLista = exports.gestionIntegrantes = exports.enviarWhatsPunto = exports.updateAgenda = exports.getAgendaHoy = exports.getAgenda = exports.saveagenda = exports.catalogossave = exports.reiniciarvoto = exports.actualizarvoto = exports.getvotacionpunto = exports.eliminarinter = exports.getintervenciones = exports.saveintervencion = exports.eliminarpunto = exports.actualizarPunto = exports.getreservas = exports.eliminarreserva = exports.crearreserva = exports.getpuntos = exports.guardarpunto = exports.getTiposPuntos = exports.catalogos = exports.actualizar = exports.getevento = exports.geteventos = void 0;
const agendas_1 = __importDefault(require("../models/agendas"));
const sedes_1 = __importDefault(require("../models/sedes"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const diputado_1 = __importDefault(require("../models/diputado"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const partidos_1 = __importDefault(require("../models/partidos"));
const proponentes_1 = __importDefault(require("../models/proponentes"));
const expedientes_estudio_puntos_1 = __importDefault(require("../models/expedientes_estudio_puntos"));
const expediente_1 = __importDefault(require("../models/expediente"));
const comisions_1 = __importDefault(require("../models/comisions"));
const tipo_comisions_1 = __importDefault(require("../models/tipo_comisions"));
const sequelize_1 = require("sequelize");
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const tipo_intervencions_1 = __importDefault(require("../models/tipo_intervencions"));
const intervenciones_1 = __importDefault(require("../models/intervenciones"));
const temas_puntos_votos_1 = __importDefault(require("../models/temas_puntos_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const sequelize_2 = require("sequelize");
const tipo_autors_1 = __importDefault(require("../models/tipo_autors"));
const otros_autores_1 = __importDefault(require("../models/otros_autores"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const secretarias_1 = require("../models/secretarias");
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const puntos_presenta_1 = __importDefault(require("../models/puntos_presenta"));
const axios_1 = __importDefault(require("axios"));
const locale_1 = require("date-fns/locale");
const date_fns_1 = require("date-fns");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const puntos_comisiones_1 = __importDefault(require("../models/puntos_comisiones"));
const tipo_cargo_comisions_1 = __importDefault(require("../models/tipo_cargo_comisions"));
const exceljs_1 = __importDefault(require("exceljs"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../models/iniciativas_estudio"));
const iniciativaspresenta_1 = __importDefault(require("../models/iniciativaspresenta"));
const diputados_asociados_1 = __importDefault(require("../models/diputados_asociados"));
const geteventos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(id);
        const uuidSesion = 'd5687f72-a328-4be1-a23c-4c3575092163';
        let whereTipoEvento;
        if (id === '1') {
            whereTipoEvento = { id: uuidSesion };
        }
        else if (id === '0') {
            whereTipoEvento = {
                id: {
                    [sequelize_1.Op.ne]: uuidSesion
                }
            };
        }
        else {
            whereTipoEvento = {};
        }
        const eventos = yield agendas_1.default.findAll({
            include: [
                {
                    model: sedes_1.default,
                    as: "sede",
                    attributes: ["id", "sede"]
                },
                {
                    model: tipo_eventos_1.default,
                    as: "tipoevento",
                    attributes: ["id", "nombre"],
                    where: whereTipoEvento
                }
            ],
            order: [['fecha', 'DESC']]
        });
        const eventosConComisiones = [];
        for (const evento of eventos) {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
            let comisiones = [];
            let titulo = '';
            if (comisionIds.length > 0) {
                comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre"],
                    raw: true
                });
                titulo = comisiones.map(c => c.nombre).join(", ");
            }
            eventosConComisiones.push(Object.assign(Object.assign({}, evento.toJSON()), { comisiones,
                titulo }));
        }
        return res.status(200).json({
            msg: "listoooo :v ",
            citas: eventosConComisiones
        });
    }
    catch (error) {
        console.error("Error obteniendo eventos:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener los eventos",
            error: error.message
        });
    }
});
exports.geteventos = geteventos;
const getevento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // 1. Obtener evento
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        // 2. Determinar tipo de evento
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const tipoEvento = esSesion ? 1 : 2; // 1 = Sesión, 2 = Comisiones
        // 3. Obtener título y puntos según tipo de evento
        let titulo = "";
        let puntos = []; // ✅ Declarar aquí, fuera del if/else
        if (esSesion) {
            titulo = (_b = evento.descripcion) !== null && _b !== void 0 ? _b : "";
        }
        else {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            if (anfitriones.length > 0) { // ✅ Validar antes de continuar
                const puntosturnados = yield puntos_comisiones_1.default.findAll({
                    where: sequelize_2.Sequelize.literal(`(${anfitriones.map(a => `FIND_IN_SET('${a.autor_id}', REPLACE(REPLACE(id_comision, '[', ''), ']', ''))`).join(' AND ')})`)
                });
                if (puntosturnados.length > 0) { // ✅ Validar antes de buscar puntos
                    const puntosRaw = yield puntos_ordens_1.default.findAll({
                        where: {
                            id: puntosturnados.map(p => p.id_punto)
                        },
                        attributes: ["id", "punto", "nopunto"],
                        include: [
                            {
                                model: agendas_1.default,
                                as: 'evento',
                                attributes: ["fecha", "id"]
                            }
                        ]
                    });
                    puntos = puntosRaw.map((p) => {
                        var _a, _b;
                        const data = p.toJSON();
                        const fecha = ((_a = data.evento) === null || _a === void 0 ? void 0 : _a.fecha)
                            ? new Date(data.evento.fecha).toISOString().split('T')[0]
                            : '';
                        return {
                            id: data.id,
                            punto: `${fecha} - ${(_b = data.evento) === null || _b === void 0 ? void 0 : _b.id} - ${data.nopunto} - ${data.punto}`
                        };
                    });
                }
                const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
                if (comisionIds.length > 0) {
                    const comisiones = yield comisions_1.default.findAll({
                        where: { id: comisionIds },
                        attributes: ["nombre"],
                        raw: true
                    });
                    titulo = comisiones.map(c => c.nombre).join(", ");
                }
            }
        }
        // 4. Verificar si existen asistencias
        const asistenciasExistentes = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            order: [['created_at', 'DESC']],
            raw: true,
        });
        let dipasociadosRaw = yield diputados_asociados_1.default.findAll({
            where: { id_agenda: evento.id },
            raw: true
        });
        let dipasociados = [];
        if (!esSesion) {
            dipasociados = yield procesarDiputadosAsociadosComision(dipasociadosRaw);
        }
        // 5. Si NO existen asistencias, crearlas
        if (asistenciasExistentes.length === 0) {
            yield crearAsistencias(evento, esSesion);
            const io = req.app.get('io');
            io.emit('evento_iniciado', { id });
            // Volver a consultar las asistencias recién creadas
            const asistenciasNuevas = yield asistencia_votos_1.default.findAll({
                where: { id_agenda: id },
                order: [['created_at', 'DESC']],
                raw: true,
            });
            const integrantes = yield procesarAsistencias(asistenciasNuevas, esSesion);
            return res.status(200).json({
                msg: "Asistencias creadas exitosamente",
                evento,
                integrantes,
                titulo,
                tipoEvento,
                puntos,
                dipasociados
            });
        }
        // 6. Si SÍ existen asistencias, procesarlas
        const integrantes = yield procesarAsistencias(asistenciasExistentes, esSesion);
        return res.status(200).json({
            msg: "Evento con asistencias existentes",
            evento,
            integrantes,
            titulo,
            tipoEvento,
            puntos,
            dipasociados
        });
    }
    catch (error) {
        console.error("Error obteniendo evento:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener el evento",
            error: error.message,
        });
    }
});
exports.getevento = getevento;
/**
 * Crea asistencias para el evento
 */
function crearAsistencias(evento, esSesion) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const listadoDiputados = [];
        if (esSesion) {
            const { Op } = require('sequelize');
            const fechaEvento = new Date(evento.fecha).toISOString().split('T')[0];
            if (!fechaEvento) {
                throw new Error('El evento no tiene fecha válida');
            }
            // Para sesiones: todos los diputados de la legislatura actual
            const legislatura = yield legislaturas_1.default.findOne({
                order: [["fecha_inicio", "DESC"]],
            });
            if (legislatura) {
                const diputados = yield integrante_legislaturas_1.default.findAll({
                    where: {
                        legislatura_id: legislatura.id,
                        fecha_inicio: {
                            [Op.lte]: fechaEvento // El diputado ya estaba en la legislatura
                        },
                        [Op.or]: [
                            {
                                fecha_fin: {
                                    [Op.gte]: fechaEvento // Aún no había terminado su periodo
                                }
                            },
                            {
                                fecha_fin: null // O está activo (sin fecha fin)
                            }
                        ]
                    },
                    include: [
                        {
                            model: diputado_1.default,
                            as: "diputado",
                            paranoid: false // Incluir diputados eliminados también
                        }
                    ],
                    paranoid: false // Si también quieres incluir diputados eliminados
                });
                for (const inteLegis of diputados) {
                    if (inteLegis.diputado) {
                        listadoDiputados.push({
                            id_diputado: inteLegis.diputado.id,
                            id_partido: inteLegis.partido_id,
                            comision_dip_id: null,
                            cargo_dip_id: null,
                        });
                    }
                }
            }
        }
        else {
            // Para comisiones: solo integrantes de las comisiones anfitrionas
            const comisiones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
            });
            if (comisiones.length > 0) {
                const comisionIds = comisiones.map((c) => c.autor_id);
                const integrantes = yield integrante_comisions_1.default.findAll({
                    where: { comision_id: comisionIds },
                    include: [
                        {
                            model: integrante_legislaturas_1.default,
                            as: "integranteLegislatura",
                            include: [{ model: diputado_1.default, as: "diputado" }],
                        },
                    ],
                });
                for (const inte of integrantes) {
                    if ((_a = inte.integranteLegislatura) === null || _a === void 0 ? void 0 : _a.diputado) {
                        listadoDiputados.push({
                            id_diputado: inte.integranteLegislatura.diputado.id,
                            id_partido: inte.integranteLegislatura.partido_id,
                            comision_dip_id: inte.comision_id,
                            cargo_dip_id: inte.tipo_cargo_comision_id
                        });
                    }
                }
            }
        }
        // Crear asistencias en bulk
        const mensaje = "PENDIENTE";
        const timestamp = new Date();
        const asistencias = listadoDiputados.map((diputado) => ({
            sentido_voto: 0,
            mensaje,
            timestamp,
            id_diputado: diputado.id_diputado,
            partido_dip: diputado.id_partido,
            comision_dip_id: diputado.comision_dip_id,
            id_cargo_dip: diputado.cargo_dip_id, // 👈 Ya se guarda en la tabla
            id_agenda: evento.id,
        }));
        yield asistencia_votos_1.default.bulkCreate(asistencias);
    });
}
/**
 * Procesa las asistencias y las agrupa según el tipo de evento
 */
function procesarAsistencias(asistencias, esSesion) {
    return __awaiter(this, void 0, void 0, function* () {
        if (esSesion) {
            // Para sesiones: lista plana sin duplicados
            return yield procesarAsistenciasSesion(asistencias);
        }
        else {
            // Para comisiones: agrupadas y ordenadas por cargo
            return yield procesarAsistenciasComisiones(asistencias);
        }
    });
}
/**
 * Procesa asistencias para SESIONES (lista plana ordenada alfabéticamente)
 */
function procesarAsistenciasSesion(asistencias) {
    return __awaiter(this, void 0, void 0, function* () {
        // Eliminar duplicados por id_diputado (mantener el más reciente)
        const asistenciasSinDuplicados = Object.values(asistencias.reduce((acc, curr) => {
            if (!acc[curr.id_diputado])
                acc[curr.id_diputado] = curr;
            return acc;
        }, {}));
        const diputadoIds = [...new Set(asistenciasSinDuplicados.map(a => a.id_diputado).filter(Boolean))];
        const partidoIds = [...new Set(asistenciasSinDuplicados.map(a => a.partido_dip).filter(Boolean))];
        const [diputados, partidos] = yield Promise.all([
            diputado_1.default.findAll({
                where: { id: diputadoIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
                paranoid: false
            }),
            partidos_1.default.findAll({
                where: { id: partidoIds },
                attributes: ["id", "siglas"],
                raw: true,
                paranoid: false
            })
        ]);
        const diputadosMap = new Map(diputados.map((d) => [d.id, d]));
        const partidosMap = new Map(partidos.map((p) => [p.id, p]));
        const resultados = asistenciasSinDuplicados.map(inte => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(inte.id_diputado);
            const partido = partidosMap.get(inte.partido_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return Object.assign(Object.assign({}, inte), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null });
        });
        // Ordenar alfabéticamente por nombre de diputado
        resultados.sort((a, b) => {
            const nombreA = a.diputado || '';
            const nombreB = b.diputado || '';
            return nombreA.localeCompare(nombreB, 'es');
        });
        return resultados;
    });
}
/**
 * Procesa asistencias para COMISIONES (agrupadas por comisión y ordenadas por cargo)
 */
function procesarAsistenciasComisiones(asistencias) {
    return __awaiter(this, void 0, void 0, function* () {
        const diputadoIds = [...new Set(asistencias.map(a => a.id_diputado).filter(Boolean))];
        const partidoIds = [...new Set(asistencias.map(a => a.partido_dip).filter(Boolean))];
        const comisionIds = [...new Set(asistencias.map(a => a.comision_dip_id).filter(Boolean))];
        const cargoIds = [...new Set(asistencias.map(a => a.id_cargo_dip).filter(Boolean))]; // 👈 NUEVO
        const [diputados, partidos, comisiones, cargos] = yield Promise.all([
            diputado_1.default.findAll({
                where: { id: diputadoIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true
            }),
            partidos_1.default.findAll({
                where: { id: partidoIds },
                attributes: ["id", "siglas"],
                raw: true
            }),
            comisionIds.length > 0 ? comisions_1.default.findAll({
                where: { id: comisionIds },
                attributes: ["id", "nombre", "importancia"],
                raw: true
            }) : [],
            cargoIds.length > 0 ? tipo_cargo_comisions_1.default.findAll({
                where: { id: cargoIds },
                attributes: ["id", "valor", "nivel"],
                raw: true
            }) : []
        ]);
        // Crear mapas
        const diputadosMap = new Map(diputados.map((d) => [d.id, d]));
        const partidosMap = new Map(partidos.map((p) => [p.id, p]));
        const comisionesMap = new Map(comisiones.map((c) => [c.id, c]));
        const cargosMap = new Map(cargos.map((c) => [c.id, c])); // 👈 NUEVO
        // Mapear asistencias con información completa
        const resultados = asistencias.map(inte => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(inte.id_diputado);
            const partido = partidosMap.get(inte.partido_dip);
            const comision = inte.comision_dip_id ? comisionesMap.get(inte.comision_dip_id) : null;
            const cargo = inte.id_cargo_dip ? cargosMap.get(inte.id_cargo_dip) : null; // 👈 NUEVO
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return Object.assign(Object.assign({}, inte), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null, comision_id: inte.comision_dip_id, comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || 'Sin comisión', comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999 });
        });
        // Agrupar por comisión
        const integrantesAgrupados = resultados.reduce((grupos, integrante) => {
            const comisionNombre = integrante.comision_nombre;
            if (!grupos[comisionNombre]) {
                grupos[comisionNombre] = {
                    comision_id: integrante.comision_id,
                    comision_nombre: comisionNombre,
                    importancia: integrante.comision_importancia,
                    integrantes: []
                };
            }
            grupos[comisionNombre].integrantes.push(integrante);
            return grupos;
        }, {});
        // Convertir a array y ordenar por importancia de comisión
        const comisionesArray = Object.values(integrantesAgrupados).sort((a, b) => {
            return a.importancia - b.importancia;
        });
        // Ordenar integrantes dentro de cada comisión por nivel de cargo
        comisionesArray.forEach((comision) => {
            comision.integrantes.sort((a, b) => a.nivel_cargo - b.nivel_cargo);
        });
        return comisionesArray;
    });
}
function procesarDiputadosAsociadosComision(dipasociados) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!dipasociados || dipasociados.length === 0)
            return [];
        // IDs únicos
        const diputadoIds = [...new Set(dipasociados.map(d => d.id_diputado).filter(Boolean))];
        const partidoIds = [...new Set(dipasociados.map(d => d.partido_dip).filter(Boolean))];
        // Consultas
        const [diputados, partidos] = yield Promise.all([
            diputado_1.default.findAll({
                where: { id: diputadoIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true
            }),
            partidos_1.default.findAll({
                where: { id: partidoIds },
                attributes: ["id", "siglas"],
                raw: true
            })
        ]);
        // Mapas
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        // Armar respuesta
        return dipasociados.map(d => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(d.id_diputado);
            const partido = partidosMap.get(d.partido_dip);
            const nombreCompleto = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return {
                id: d.id,
                id_diputado: d.id_diputado,
                diputado: nombreCompleto,
                partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null
            };
        });
    });
}
const actualizar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.id) {
            return res.status(400).json({
                msg: "El campo 'id' es requerido",
                estatus: 400
            });
        }
        if (body.sentido === undefined || body.sentido === null) {
            return res.status(400).json({
                msg: "El campo 'sentido' es requerido",
                estatus: 400
            });
        }
        const voto = yield asistencia_votos_1.default.findOne({
            where: {
                id: body.id,
            },
        });
        if (!voto) {
            return res.status(404).json({
                msg: "No se encontró el registro de asistencia",
                estatus: 404
            });
        }
        let nuevoSentido;
        let nuevoMensaje;
        switch (body.sentido) {
            case 1:
                nuevoSentido = 1;
                nuevoMensaje = "ASISTENCIA";
                break;
            case 2:
                nuevoSentido = 2;
                nuevoMensaje = "ASISTENCIA ZOOM";
                break;
            case 0:
                nuevoSentido = 0;
                nuevoMensaje = "PENDIENTE";
                break;
            default:
                return res.status(400).json({
                    msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (ASISTENCIA) o 2 (ASISTENCIA ZOOM)",
                    estatus: 400
                });
        }
        yield asistencia_votos_1.default.update({
            sentido_voto: nuevoSentido,
            mensaje: nuevoMensaje,
        }, {
            where: {
                id: body.id,
            },
        });
        return res.status(200).json({
            msg: "Registro actualizado correctamente",
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al actualizar asistencia:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            estatus: 500,
            error: error.message
        });
    }
});
exports.actualizar = actualizar;
const catalogos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proponentes = yield proponentes_1.default.findAll({
            attributes: ['id', 'valor'],
            raw: true,
        });
        const partidos = yield partidos_1.default.findAll({
            attributes: ['id', 'siglas'],
            raw: true,
        });
        const comisiones = yield comisions_1.default.findAll({
            attributes: ['id', 'nombre'],
            raw: true,
        });
        const dictamenesRaw = yield puntos_ordens_1.default.findAll({
            where: { id_dictamen: 0 },
            include: [
                {
                    model: iniciativas_estudio_1.default,
                    as: 'puntosestudiados',
                    where: { status: 2 },
                },
                {
                    model: agendas_1.default,
                    as: 'evento',
                    attributes: ["fecha", "id"]
                }
            ]
        });
        const dictamenes = dictamenesRaw.map((p) => {
            var _a, _b;
            const d = p.toJSON();
            const fecha = ((_a = d.evento) === null || _a === void 0 ? void 0 : _a.fecha)
                ? new Date(d.evento.fecha).toISOString().split('T')[0]
                : '';
            return {
                id: d.id,
                punto: `${fecha} - ${(_b = d.evento) === null || _b === void 0 ? void 0 : _b.id} - ${d.punto}`
            };
        });
        const legislatura = yield legislaturas_1.default.findOne({
            order: [["fecha_inicio", "DESC"]],
        });
        let diputadosArray = [];
        if (legislatura) {
            const diputados = yield integrante_legislaturas_1.default.findAll({
                where: { legislatura_id: legislatura.id },
                include: [
                    {
                        model: diputado_1.default,
                        as: "diputado",
                        attributes: ["id", "nombres", "apaterno", "amaterno"],
                    },
                ],
            });
            diputadosArray = diputados
                .filter(d => d.diputado)
                .map(d => {
                var _a, _b, _c;
                return ({
                    id: d.diputado.id,
                    nombre: `${(_a = d.diputado.nombres) !== null && _a !== void 0 ? _a : ""} ${(_b = d.diputado.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = d.diputado.amaterno) !== null && _c !== void 0 ? _c : ""}`.trim(),
                });
            });
        }
        const tipointer = yield tipo_intervencions_1.default.findAll({
            attributes: ['id', 'valor'],
            raw: true,
        });
        return res.json({
            proponentes: proponentes,
            comisiones: comisiones,
            diputados: diputadosArray,
            tipointer: tipointer,
            partidos: partidos,
            dictamenes: dictamenes
        });
    }
    catch (error) {
        console.error('Error al generar consulta:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
});
exports.catalogos = catalogos;
const getTiposPuntos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const proponentes = body;
        if (!proponentes || !Array.isArray(proponentes) || proponentes.length === 0) {
            return res.status(400).json({ message: 'Se requiere un arreglo de proponentes' });
        }
        let dtSlctConsolidado = [];
        let tiposConsolidados = [];
        let combosConsolidados = [];
        for (const proponenteData of proponentes) {
            const proponente = yield proponentes_1.default.findByPk(proponenteData.id);
            if (!proponente) {
                continue;
            }
            let tiposRelacionados = yield proponente.getTipos({
                attributes: ['id', 'valor'],
                joinTableAttributes: []
            });
            tiposRelacionados.forEach((tipo) => {
                tiposConsolidados.push(Object.assign(Object.assign({}, tipo.toJSON()), { proponente_id: proponente.id, proponente_valor: proponente.valor }));
            });
            let dtSlctTemp = null;
            if (proponente.valor === 'Diputadas y Diputados') {
                const legis = yield legislaturas_1.default.findOne({
                    order: [["fecha_inicio", "DESC"]],
                });
                if (legis) {
                    const dips = yield integrante_legislaturas_1.default.findAll({
                        where: { legislatura_id: legis.id },
                        include: [{
                                model: diputado_1.default,
                                as: 'diputado',
                                attributes: ['id', 'apaterno', 'amaterno', 'nombres']
                            }],
                    });
                    const dipss = dips
                        .filter((d) => d.diputado)
                        .map((item) => {
                        var _a, _b, _c;
                        return ({
                            id: `${proponente.id}/${item.diputado.id}`, // 👈 Concatenado
                            id_original: item.diputado.id, // 👈 ID original
                            valor: `${(_a = item.diputado.apaterno) !== null && _a !== void 0 ? _a : ''} ${(_b = item.diputado.amaterno) !== null && _b !== void 0 ? _b : ''} ${(_c = item.diputado.nombres) !== null && _c !== void 0 ? _c : ''}`.trim(),
                            proponente_id: proponente.id,
                            proponente_valor: proponente.valor,
                            tipo: 'diputado'
                        });
                    });
                    dtSlctTemp = dipss;
                }
            }
            else if (proponente.valor === 'Mesa Directiva en turno') {
                const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Mesa Directiva' } });
                if (idMesa) {
                    const mesa = yield comisions_1.default.findOne({
                        where: { tipo_comision_id: idMesa.id },
                        order: [['created_at', 'DESC']],
                    });
                    if (mesa) {
                        dtSlctTemp = [{
                                id: `${proponente.id}/${mesa.id}`,
                                id_original: mesa.id,
                                valor: mesa.nombre,
                                proponente_id: proponente.id,
                                proponente_valor: proponente.valor,
                                tipo: 'comision'
                            }];
                    }
                }
            }
            else if (proponente.valor === 'Junta de Coordinación Politica') {
                const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Comisiones Legislativas' } });
                if (idMesa) {
                    const mesa = yield comisions_1.default.findOne({
                        where: {
                            tipo_comision_id: idMesa.id,
                            nombre: { [sequelize_1.Op.like]: '%jucopo%' },
                        },
                        order: [['created_at', 'DESC']],
                    });
                    if (mesa) {
                        dtSlctTemp = [{
                                id: `${proponente.id}/${mesa.id}`,
                                id_original: mesa.id,
                                valor: mesa.nombre,
                                proponente_id: proponente.id,
                                proponente_valor: proponente.valor,
                                tipo: 'comision'
                            }];
                    }
                }
            }
            else if (proponente.valor === 'Ayuntamientos') {
                const municipios = yield municipiosag_1.default.findAll();
                dtSlctTemp = municipios.map(l => ({
                    id: `${proponente.id}/${l.id}`,
                    id_original: l.id,
                    valor: l.nombre,
                    proponente_id: proponente.id,
                    proponente_valor: proponente.valor,
                    tipo: 'municipio'
                }));
            }
            else if (proponente.valor === 'Comisiones Legislativas') {
                const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Comisiones Legislativas' } });
                if (idMesa) {
                    const comi = yield comisions_1.default.findAll({ where: { tipo_comision_id: idMesa.id } });
                    dtSlctTemp = comi.map((item) => ({
                        id: `${proponente.id}/${item.id}`,
                        id_original: item.id,
                        valor: item.nombre,
                        proponente_id: proponente.id,
                        proponente_valor: proponente.valor,
                        tipo: 'comision'
                    }));
                }
            }
            else if (proponente.valor === 'Municipios') {
                const municipios = yield municipiosag_1.default.findAll();
                dtSlctTemp = municipios.map(l => ({
                    id: `${proponente.id}/${l.id}`,
                    id_original: l.id,
                    valor: l.nombre,
                    proponente_id: proponente.id,
                    proponente_valor: proponente.valor,
                    tipo: 'municipio'
                }));
            }
            else if (proponente.valor === 'Diputación Permanente') {
                const idMesa = yield tipo_comisions_1.default.findOne({ where: { valor: 'Diputación Permanente' } });
                if (idMesa) {
                    const mesa = yield comisions_1.default.findOne({
                        where: { tipo_comision_id: idMesa.id },
                        order: [['created_at', 'DESC']],
                    });
                    if (mesa) {
                        dtSlctTemp = [{
                                id: `${proponente.id}/${mesa.id}`,
                                id_original: mesa.id,
                                valor: mesa.nombre,
                                proponente_id: proponente.id,
                                proponente_valor: proponente.valor,
                                tipo: 'comision'
                            }];
                    }
                }
            }
            else if (proponente.valor === 'Grupo Parlamentario') {
                const partidos = yield partidos_1.default.findAll();
                dtSlctTemp = partidos.map(l => ({
                    id: `${proponente.id}/${l.id}`,
                    id_original: l.id,
                    valor: l.siglas,
                    proponente_id: proponente.id,
                    proponente_valor: proponente.valor,
                    tipo: 'partido'
                }));
            }
            else if (proponente.valor === 'Legislatura') {
                const legislaturas = yield legislaturas_1.default.findAll();
                dtSlctTemp = legislaturas.map(l => ({
                    id: `${proponente.id}/${l.id}`,
                    id_original: l.id,
                    valor: l.numero,
                    proponente_id: proponente.id,
                    proponente_valor: proponente.valor,
                    tipo: 'legislatura'
                }));
            }
            else if (proponente.valor === 'Secretarías del GEM') {
                const secretgem = yield secretarias_1.Secretarias.findAll();
                dtSlctTemp = secretgem.map(s => ({
                    id: `${proponente.id}/${s.id}`,
                    id_original: s.id,
                    valor: `${s.nombre} / ${s.titular}`,
                    proponente_id: proponente.id,
                    proponente_valor: proponente.valor,
                    tipo: 'secretaria'
                }));
            }
            else {
                const catalogo = yield cat_fun_dep_1.default.findAll({
                    where: {
                        tipo: proponente.id,
                    },
                });
                dtSlctTemp = catalogo.map(data => ({
                    id: `${proponente.id}/${data.id}`,
                    id_original: data.id,
                    valor: data.nombre_titular,
                    proponente_id: proponente.id,
                    proponente_valor: proponente.valor,
                    tipo: 'funcionario'
                }));
            }
            if (dtSlctTemp) {
                if (Array.isArray(dtSlctTemp)) {
                    dtSlctConsolidado.push(...dtSlctTemp);
                }
                else {
                    dtSlctConsolidado.push(dtSlctTemp);
                }
            }
        }
        return res.json({
            dtSlct: dtSlctConsolidado,
            tipos: tiposConsolidados,
        });
    }
    catch (error) {
        console.error('Error en getTiposPuntos:', error);
        return res.status(500).json({
            message: 'Error al obtener tipos de puntos',
        });
    }
});
exports.getTiposPuntos = getTiposPuntos;
const guardarpunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { body } = req;
        const file = req.file;
        // console.log(body);
        // return 500;
        const presentaArray = (body.presenta || "")
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .map((item) => {
            const [proponenteId, autorId] = item.split('/');
            return {
                proponenteId: parseInt(proponenteId),
                autorId: autorId
            };
        });
        const proponentesIds = (body.proponente || "")
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));
        const turnocomision = (body.id_comision || "")
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
        const evento = yield agendas_1.default.findOne({ where: { id } });
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        const puntonuevo = yield puntos_ordens_1.default.create({
            id_evento: evento.id,
            nopunto: body.numpunto,
            id_tipo: body.tipo,
            tribuna: body.tribuna,
            path_doc: file ? `storage/puntos/${file.filename}` : null,
            punto: body.punto,
            observaciones: body.observaciones,
            se_turna_comision: body.se_turna_comision === 'true' ? 1 : 0,
            dispensa: body.dispensa === 'true' ? 1 : 0
        });
        const puntosTurnadosArray = JSON.parse(body.puntos_turnados);
        if (body.tipo_evento != 0 && evento.tipo_evento_id != "a413e44b-550b-47ab-b004-a6f28c73a750") {
            if (puntosTurnadosArray.length > 0) {
                if (puntosTurnadosArray.length === 1) {
                    const estudio = yield iniciativas_estudio_1.default.create({
                        type: "1",
                        punto_origen_id: puntosTurnadosArray[0],
                        punto_destino_id: puntonuevo.id,
                        status: 1,
                    });
                }
                else {
                    const expediente = yield expediente_1.default.create({
                        evento_comision_id: evento.id,
                        descripcion: "Inicitativas en conjunto"
                    });
                    for (const item of puntosTurnadosArray) {
                        console.log(item);
                        const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
                            where: {
                                id_punto: item,
                            },
                        });
                        for (const data of iniciativas) {
                            data.update({
                                expediente: expediente.id
                            });
                        }
                        yield expedientes_estudio_puntos_1.default.create({
                            expediente_id: expediente.id,
                            punto_origen_sesion_id: item
                        });
                    }
                    const estudio = yield iniciativas_estudio_1.default.create({
                        type: "2",
                        punto_origen_id: expediente.id,
                        punto_destino_id: puntonuevo.id,
                        status: 1,
                    });
                }
            }
        }
        else {
            const dictamenesArray = JSON.parse(body.dictamenes || '[]');
            if (dictamenesArray.length === 1) {
                const data = yield iniciativas_estudio_1.default.findOne({
                    where: { punto_destino_id: dictamenesArray[0] },
                });
                if (data) {
                    yield puntos_ordens_1.default.update({ id_dictamen: puntonuevo.id }, { where: { id: data.punto_destino_id } });
                    yield iniciativas_estudio_1.default.create({
                        punto_origen_id: data.punto_origen_id,
                        type: data.type,
                        punto_destino_id: puntonuevo.id,
                        status: 6,
                    });
                }
            }
            else if (dictamenesArray.length > 1) {
                const expediente = yield expediente_1.default.create({
                    evento_comision_id: evento.id,
                    descripcion: "Iniciativas en conjunto"
                });
                for (const item of dictamenesArray) {
                    const data = yield iniciativas_estudio_1.default.findOne({
                        where: { punto_destino_id: item },
                    });
                    if (data) {
                        yield puntos_ordens_1.default.update({ id_dictamen: puntonuevo.id }, { where: { id: data.punto_destino_id } });
                    }
                    const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
                        where: { id_punto: item },
                    });
                    for (const ini of iniciativas) {
                        yield ini.update({ expediente: expediente.id });
                    }
                    yield expedientes_estudio_puntos_1.default.create({
                        expediente_id: expediente.id,
                        punto_origen_sesion_id: item
                    });
                }
                yield iniciativas_estudio_1.default.create({
                    type: "2",
                    punto_origen_id: expediente.id,
                    punto_destino_id: puntonuevo.id,
                    status: 6,
                });
            }
        }
        if (body.reservas) {
            const temasArray = typeof body.reservas === 'string'
                ? JSON.parse(body.reservas)
                : body.reservas;
            for (const item of temasArray) {
                yield temas_puntos_votos_1.default.create({
                    id_punto: puntonuevo.id,
                    id_evento: evento.id,
                    tema_votacion: item.descripcion,
                    fecha_votacion: null,
                });
            }
        }
        if (body.iniciativas) {
            const IniciativasArray = typeof body.iniciativas === 'string'
                ? JSON.parse(body.iniciativas)
                : body.iniciativas;
            for (const iniciativa of IniciativasArray) {
                const presentaArray = (Array.isArray(iniciativa.id_presenta)
                    ? iniciativa.id_presenta
                    : (iniciativa.id_presenta || "").split(","))
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0)
                    .map((p) => {
                    const [proponenteId, autorId] = p.split('/');
                    return {
                        proponenteId: parseInt(proponenteId),
                        autorId: autorId
                    };
                });
                const ini = yield inciativas_puntos_ordens_1.default.create({
                    id_punto: puntonuevo.id,
                    id_evento: evento.id,
                    iniciativa: iniciativa.descripcion,
                    tipo: iniciativa.tipo,
                    fecha_votacion: null,
                });
                for (const item of presentaArray) {
                    yield iniciativaspresenta_1.default.create({
                        id_iniciativa: ini.id,
                        id_tipo_presenta: item.proponenteId,
                        id_presenta: item.autorId
                    });
                }
            }
        }
        for (const item of presentaArray) {
            yield puntos_presenta_1.default.create({
                id_punto: puntonuevo.id,
                id_tipo_presenta: item.proponenteId,
                id_presenta: item.autorId
            });
        }
        // if(body.tipo_evento == 0){
        const comisionesString = `[${turnocomision.join(',')}]`;
        yield puntos_comisiones_1.default.create({
            id_punto: puntonuevo.id,
            id_comision: comisionesString,
        });
        // }
        return res.status(201).json({
            message: "Punto creado correctamente",
            data: puntonuevo,
        });
    }
    catch (error) {
        console.error("Error al guardar el punto:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.guardarpunto = guardarpunto;
//////////////////////////////////////////
// Función reutilizable fuera del handler
const procesarPresentan = (presentan) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const proponentesUnicos = new Map();
    const presentanData = [];
    for (const p of presentan) {
        const tipoValor = (_b = (_a = p.tipo_presenta) === null || _a === void 0 ? void 0 : _a.valor) !== null && _b !== void 0 ? _b : '';
        let valor = '';
        if (tipoValor === 'Diputadas y Diputados') {
            const dip = yield diputado_1.default.findOne({ where: { id: p.id_presenta } });
            valor = `${(_c = dip === null || dip === void 0 ? void 0 : dip.apaterno) !== null && _c !== void 0 ? _c : ''} ${(_d = dip === null || dip === void 0 ? void 0 : dip.amaterno) !== null && _d !== void 0 ? _d : ''} ${(_e = dip === null || dip === void 0 ? void 0 : dip.nombres) !== null && _e !== void 0 ? _e : ''}`.trim();
        }
        else if (['Mesa Directiva en turno', 'Junta de Coordinación Politica', 'Comisiones Legislativas', 'Diputación Permanente'].includes(tipoValor)) {
            const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_f = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _f !== void 0 ? _f : '';
        }
        else if (['Ayuntamientos', 'Municipios'].includes(tipoValor)) {
            const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_g = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _g !== void 0 ? _g : '';
        }
        else if (tipoValor === 'Grupo Parlamentario') {
            const partido = yield partidos_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_h = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _h !== void 0 ? _h : '';
        }
        else if (tipoValor === 'Legislatura') {
            const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_j = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _j !== void 0 ? _j : '';
        }
        else if (tipoValor === 'Secretarías del GEM') {
            const sec = yield secretarias_1.Secretarias.findOne({ where: { id: p.id_presenta } });
            valor = `${(_k = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _k !== void 0 ? _k : ''} / ${(_l = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _l !== void 0 ? _l : ''}`;
        }
        else {
            const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta } });
            valor = (_m = cat === null || cat === void 0 ? void 0 : cat.nombre_titular) !== null && _m !== void 0 ? _m : '';
        }
        if (!proponentesUnicos.has(tipoValor)) {
            proponentesUnicos.set(tipoValor, tipoValor);
        }
        presentanData.push({ proponente: tipoValor, valor, id_presenta: p.id_presenta });
    }
    return {
        proponentesString: Array.from(proponentesUnicos.keys()).join(", "),
        presentaString: presentanData.map(p => p.valor).join(', ')
    };
});
const getpuntos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión" || evento.tipo_evento_id === "a413e44b-550b-47ab-b004-a6f28c73a750";
        const puntosRaw = yield puntos_ordens_1.default.findAll({
            where: { id_evento: id },
            order: [['nopunto', 'ASC']],
            include: [
                {
                    model: puntos_presenta_1.default,
                    as: "presentan",
                    attributes: [
                        [
                            sequelize_2.Sequelize.fn('CONCAT', sequelize_2.Sequelize.col('presentan.id_tipo_presenta'), '/', sequelize_2.Sequelize.col('presentan.id_presenta')),
                            'id'
                        ],
                        "id_tipo_presenta",
                        "id_presenta",
                        ["id_tipo_presenta", "id_proponente"]
                    ]
                },
                {
                    model: puntos_comisiones_1.default,
                    as: "turnocomision",
                    attributes: ["id", "id_punto", "id_comision", "id_punto_turno"]
                },
                {
                    model: puntos_comisiones_1.default,
                    as: "puntoTurnoComision",
                    attributes: ["id", "id_punto", "id_comision", "id_punto_turno"]
                },
                {
                    model: temas_puntos_votos_1.default,
                    as: "reservas",
                    attributes: ["id", "tema_votacion"]
                },
                {
                    model: inciativas_puntos_ordens_1.default,
                    as: "iniciativas",
                    attributes: ["id", "iniciativa", "tipo"],
                    include: [
                        {
                            model: iniciativaspresenta_1.default,
                            as: "presentan",
                            attributes: ["id_tipo_presenta", "id_presenta"],
                            include: [
                                {
                                    model: proponentes_1.default,
                                    as: "tipo_presenta",
                                    attributes: ["id", "valor"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: iniciativas_estudio_1.default,
                    as: "puntosestudiados",
                    attributes: ["id", "punto_origen_id", "punto_destino_id", "type"],
                    include: [
                        {
                            model: puntos_ordens_1.default,
                            as: "iniciativaorigen",
                            attributes: ["id", "punto"]
                        },
                        {
                            model: expedientes_estudio_puntos_1.default,
                            as: "expediente",
                            attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
                            include: [
                                {
                                    model: puntos_ordens_1.default,
                                    as: "puntoOrigen",
                                    attributes: ["id", "punto"]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!puntosRaw) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        const puntos = yield Promise.all(puntosRaw.map((punto) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const data = punto.toJSON();
            const turnosNormalizados = ((_a = data.turnocomision) === null || _a === void 0 ? void 0 : _a.length)
                ? data.turnocomision
                : (_b = data.puntoTurnoComision) !== null && _b !== void 0 ? _b : [];
            delete data.puntoTurnoComision;
            const turnosExpandidos = [];
            turnosNormalizados.forEach((turno) => {
                if (turno.id_comision && typeof turno.id_comision === 'string') {
                    const comisionesArray = turno.id_comision
                        .replace(/[\[\]]/g, '')
                        .split(',')
                        .map((id) => id.trim())
                        .filter((id) => id);
                    comisionesArray.forEach(comisionId => {
                        turnosExpandidos.push({
                            id: turno.id,
                            id_punto: turno.id_punto,
                            id_comision: comisionId,
                            id_punto_turno: turno.id_punto_turno
                        });
                    });
                }
                else {
                    turnosExpandidos.push(turno);
                }
            });
            // 👇 Procesar iniciativas con sus presentan
            const iniciativasConInfo = yield Promise.all((data.iniciativas || []).map((ini) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const { proponentesString, presentaString } = ((_a = ini.presentan) === null || _a === void 0 ? void 0 : _a.length)
                    ? yield procesarPresentan(ini.presentan)
                    : { proponentesString: '', presentaString: '' };
                return {
                    id: ini.id,
                    iniciativa: ini.iniciativa,
                    proponente: proponentesString,
                    presenta: presentaString,
                    tipo: ini.tipo,
                };
            })));
            const estudiado = (_c = data.puntosestudiados) === null || _c === void 0 ? void 0 : _c[0];
            let puntosestudiado = null;
            let dictamenes = null;
            if (estudiado) {
                if (estudiado.type === "1") {
                    const info = [
                        {
                            id: (_d = estudiado.iniciativaorigen) === null || _d === void 0 ? void 0 : _d.id,
                            punto: (_e = estudiado.iniciativaorigen) === null || _e === void 0 ? void 0 : _e.punto
                        }
                    ];
                    if (esSesion) {
                        dictamenes = info;
                    }
                    else {
                        puntosestudiado = info;
                    }
                }
                else if (estudiado.type === "2") {
                    if (esSesion) {
                        const info = [];
                        const puntoss = yield puntos_ordens_1.default.findAll({
                            where: { id_dictamen: estudiado.punto_destino_id },
                        });
                        for (const d of puntoss) {
                            info.push({ id: d === null || d === void 0 ? void 0 : d.id, punto: d === null || d === void 0 ? void 0 : d.punto });
                        }
                        dictamenes = info;
                    }
                    else {
                        const puntosExpediente = yield expedientes_estudio_puntos_1.default.findAll({
                            where: { expediente_id: estudiado.punto_origen_id },
                            include: [
                                {
                                    model: puntos_ordens_1.default,
                                    as: 'puntoOrigen',
                                    attributes: ["id", "punto"]
                                }
                            ]
                        });
                        puntosestudiado = puntosExpediente.map((p) => {
                            var _a, _b;
                            return ({
                                id: (_a = p.toJSON().puntoOrigen) === null || _a === void 0 ? void 0 : _a.id,
                                punto: (_b = p.toJSON().puntoOrigen) === null || _b === void 0 ? void 0 : _b.punto
                            });
                        });
                    }
                }
            }
            delete data.puntosestudiados;
            return Object.assign(Object.assign({}, data), { turnocomision: turnosExpandidos, iniciativas: iniciativasConInfo, // 👈 reemplaza el array original
                puntosestudiado,
                dictamenes });
        })));
        const selects = yield inciativas_puntos_ordens_1.default.findAll({
            where: {
                id_evento: id,
                id_punto: {
                    [sequelize_1.Op.or]: [null, '', '0']
                }
            },
            attributes: ["id", "iniciativa"]
        });
        return res.status(201).json({
            message: "Se encontraron registros",
            data: puntos,
            selectini: selects
        });
    }
    catch (error) {
        console.error("Error al traer los puntos:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getpuntos = getpuntos;
const crearreserva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: body.punto },
        });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const nuevoTema = yield temas_puntos_votos_1.default.create({
            id_punto: punto.id,
            id_evento: punto.id_evento,
            tema_votacion: body.descripcion,
            fecha_votacion: null,
        });
        return res.status(200).json({
            message: "Reserva creada exitosamente",
        });
    }
    catch (error) {
        console.error("Error al crear la reserva:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.crearreserva = crearreserva;
const eliminarreserva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const reserva = yield temas_puntos_votos_1.default.findOne({
            where: { id }
        });
        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }
        yield votos_punto_1.default.destroy({
            where: { id_tema_punto_voto: id }
        });
        yield reserva.destroy();
        return res.status(200).json({
            message: "Reserva eliminada correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar la reserva:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.eliminarreserva = eliminarreserva;
const getreservas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const reserva = yield temas_puntos_votos_1.default.findAll({
            where: { id_punto: id },
            attributes: ["id", "tema_votacion"]
        });
        const iniciativa = yield inciativas_puntos_ordens_1.default.findAll({
            where: { id_punto: id },
            attributes: ["id", "iniciativa"]
        });
        return res.status(200).json({
            data: {
                reservas: reserva,
                iniciativas: iniciativa
            }
        });
    }
    catch (error) {
        console.error("Error al obtener las reserva:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getreservas = getreservas;
const actualizarPunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    console.log("LLEGUE ACTUALIZAR PUNTO: ");
    try {
        const { id } = req.params;
        const { body } = req;
        const file = req.file;
        // console.log(body);
        // return 500;
        const presentaArray = (body.presenta || "")
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .map((item) => {
            const [proponenteId, autorId] = item.split('/');
            return {
                proponenteId: parseInt(proponenteId),
                autorId: autorId
            };
        });
        const proponentesIds = (body.proponente || "")
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));
        const turnocomision = (body.id_comision || "")
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id },
            include: [
                {
                    model: agendas_1.default,
                    as: 'evento',
                }
            ]
        });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const evento = yield agendas_1.default.findOne({ where: { id: punto.id_evento } }); // 👈 agregado
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        const nuevoPath = file ? `storage/puntos/${file.filename}` : punto.path_doc;
        const puntosTurnadosArray = JSON.parse(body.puntos_turnados);
        let puntoDesc = body.punto;
        if (body.tipo_evento != 0 && punto.evento.tipo_evento_id != "a413e44b-550b-47ab-b004-a6f28c73a750") {
            console.log("EVENTO 1");
            if (puntosTurnadosArray.length > 0) {
                const estudioExistente = yield iniciativas_estudio_1.default.findOne({
                    where: { punto_destino_id: punto.id }
                });
                if (puntosTurnadosArray.length === 1) {
                    if (estudioExistente) {
                        const eraExpediente = estudioExistente.type === "2";
                        if (eraExpediente) {
                            const expedienteId = estudioExistente.punto_origen_id;
                            yield inciativas_puntos_ordens_1.default.update({ expediente: null }, { where: { expediente: expedienteId } });
                            yield expedientes_estudio_puntos_1.default.destroy({
                                where: { expediente_id: expedienteId }
                            });
                            yield expediente_1.default.destroy({ where: { id: expedienteId } });
                        }
                        yield estudioExistente.update({
                            type: "1",
                            punto_origen_id: puntosTurnadosArray[0],
                            status: 1,
                        });
                    }
                    else {
                        yield iniciativas_estudio_1.default.create({
                            type: "1",
                            punto_origen_id: puntosTurnadosArray[0],
                            punto_destino_id: punto.id,
                            status: 1,
                        });
                    }
                }
                else {
                    // CASO: ahora son VARIOS puntos (expediente)
                    let expedienteId = null;
                    if ((estudioExistente === null || estudioExistente === void 0 ? void 0 : estudioExistente.type) === "2") {
                        // Ya era expediente → reutilizar
                        expedienteId = estudioExistente.punto_origen_id;
                        const puntosExistentes = yield expedientes_estudio_puntos_1.default.findAll({
                            where: { expediente_id: expedienteId },
                            attributes: ['punto_origen_sesion_id']
                        });
                        const idsExistentes = puntosExistentes.map((p) => p.punto_origen_sesion_id);
                        // Puntos que ya no vienen → eliminar
                        const aEliminar = idsExistentes.filter((id) => !puntosTurnadosArray.includes(id));
                        if (aEliminar.length > 0) {
                            yield expedientes_estudio_puntos_1.default.destroy({
                                where: { expediente_id: expedienteId, punto_origen_sesion_id: aEliminar }
                            });
                            yield inciativas_puntos_ordens_1.default.update({ expediente: null }, { where: { id_punto: aEliminar } });
                        }
                        // Puntos nuevos que no existían → agregar
                        const aAgregar = puntosTurnadosArray.filter((id) => !idsExistentes.includes(id));
                        for (const item of aAgregar) {
                            yield expedientes_estudio_puntos_1.default.create({
                                expediente_id: expedienteId,
                                punto_origen_sesion_id: item
                            });
                            const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
                                where: { id_punto: item }
                            });
                            for (const ini of iniciativas) {
                                yield ini.update({ expediente: expedienteId });
                            }
                        }
                        // Actualizar estudio existente
                        yield estudioExistente.update({
                            punto_origen_id: expedienteId,
                            status: 1,
                        });
                    }
                    else {
                        // Antes era uno solo o no existía → crear nuevo expediente
                        if (estudioExistente) {
                            yield estudioExistente.destroy();
                        }
                        const expediente = yield expediente_1.default.create({
                            evento_comision_id: evento.id,
                            descripcion: "Iniciativas en conjunto"
                        });
                        expedienteId = expediente.id;
                        for (const item of puntosTurnadosArray) {
                            yield expedientes_estudio_puntos_1.default.create({
                                expediente_id: expedienteId,
                                punto_origen_sesion_id: item
                            });
                            const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
                                where: { id_punto: item }
                            });
                            for (const ini of iniciativas) {
                                yield ini.update({ expediente: expedienteId });
                            }
                        }
                        yield iniciativas_estudio_1.default.create({
                            type: "2",
                            punto_origen_id: expedienteId,
                            punto_destino_id: punto.id,
                            status: 1,
                        });
                    }
                }
            }
            else {
                console.log("SOLO ES UN PUNTO: ");
                const puntoTurnado = yield puntos_comisiones_1.default.findOne({
                    where: { id_punto_turno: punto.id },
                });
                if (puntoTurnado) {
                    yield puntoTurnado.update({ id_punto_turno: null });
                }
                puntoDesc = body.punto;
            }
        }
        else {
            console.log("EVENTO 0");
            const dictamenesArray = JSON.parse(body.dictamenes || "[]");
            console.log("DICTAMENES ARRAY: ");
            const punto_estudio = yield iniciativas_estudio_1.default.findOne({
                where: { punto_destino_id: punto.id },
            });
            const type = (punto_estudio === null || punto_estudio === void 0 ? void 0 : punto_estudio.type) || '';
            punto_estudio === null || punto_estudio === void 0 ? void 0 : punto_estudio.destroy();
            yield puntos_ordens_1.default.update({ id_dictamen: 0 }, { where: { id_dictamen: punto.id } });
            console.log(dictamenesArray);
            if (dictamenesArray.length === 1) {
                console.log("DICTAMENES UPDATE ARRAY: ");
                let data = null;
                const whereCondition = type == "1" ? { punto_origen_id: dictamenesArray[0] } : { punto_destino_id: dictamenesArray[0] };
                data = yield iniciativas_estudio_1.default.findOne({
                    where: whereCondition,
                });
                if (data) {
                    yield puntos_ordens_1.default.update({ id_dictamen: punto.id }, { where: { id: data.punto_destino_id } });
                    yield iniciativas_estudio_1.default.create({
                        punto_origen_id: data.punto_origen_id,
                        type: data.type,
                        punto_destino_id: punto.id,
                        status: 6,
                    });
                }
            }
            else if (dictamenesArray.length > 1) {
                const prevConjunto = yield iniciativas_estudio_1.default.findOne({
                    where: { punto_destino_id: punto.id, type: "2" },
                });
                let expediente = null;
                if (prevConjunto) {
                    expediente = yield expediente_1.default.findByPk((_a = prevConjunto.punto_origen_id) !== null && _a !== void 0 ? _a : '');
                    if (expediente) {
                        yield expedientes_estudio_puntos_1.default.destroy({
                            where: { expediente_id: expediente.id },
                        });
                    }
                }
                if (!expediente) {
                    expediente = yield expediente_1.default.create({
                        evento_comision_id: evento.id,
                        descripcion: "Iniciativas en conjunto",
                    });
                }
                else {
                    yield expediente.update({ descripcion: "Iniciativas en conjunto" });
                }
                for (const item of dictamenesArray) {
                    const data = yield iniciativas_estudio_1.default.findOne({
                        where: { punto_destino_id: item },
                    });
                    if (data) {
                        yield puntos_ordens_1.default.update({ id_dictamen: punto.id }, { where: { id: data.punto_destino_id } });
                    }
                    const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
                        where: { id_punto: item },
                    });
                    for (const ini of iniciativas) {
                        yield ini.update({ expediente: expediente.id });
                    }
                    yield expedientes_estudio_puntos_1.default.create({
                        expediente_id: expediente.id,
                        punto_origen_sesion_id: item,
                    });
                }
                yield iniciativas_estudio_1.default.create({
                    type: "2",
                    punto_origen_id: expediente.id,
                    punto_destino_id: punto.id,
                    status: 6,
                });
            }
            // const data = await IniciativaEstudio.findOne({
            //   where: { punto_destino_id: body.id_punto_turnado },
            // });
            // if (data) {
            //   await PuntosOrden.update(
            //     { id_dictamen: punto.id },
            //     { where: { id: data.punto_destino_id } }
            //   );
            //   await IniciativaEstudio.create({
            //     punto_origen_id: data.punto_origen_id,
            //     type: 1,
            //     punto_destino_id: punto.id,
            //     status: 6,
            //   });
            // }
        }
        yield punto.update({
            nopunto: (_b = body.numpunto) !== null && _b !== void 0 ? _b : punto.nopunto,
            id_tipo: (_c = body.tipo) !== null && _c !== void 0 ? _c : punto.id_tipo,
            tribuna: (_d = body.tribuna) !== null && _d !== void 0 ? _d : punto.tribuna,
            path_doc: nuevoPath,
            punto: puntoDesc,
            observaciones: (_e = body.observaciones) !== null && _e !== void 0 ? _e : punto.observaciones,
            editado: 1,
            se_turna_comision: body.se_turna_comision ? 1 : 0,
            dispensa: body.dispensa === 'true' ? 1 : 0
        });
        yield puntos_presenta_1.default.destroy({
            where: { id_punto: punto.id }
        });
        for (const item of presentaArray) {
            yield puntos_presenta_1.default.create({
                id_punto: punto.id,
                id_tipo_presenta: item.proponenteId,
                id_presenta: item.autorId
            });
        }
        // if(body.tipo_evento == 0){
        yield puntos_comisiones_1.default.destroy({
            where: { id_punto: punto.id }
        });
        const comisionesString = `[${turnocomision.join(',')}]`;
        yield puntos_comisiones_1.default.create({
            id_punto: punto.id,
            id_comision: comisionesString,
        });
        // }
        return res.status(200).json({
            message: "Punto actualizado correctamente",
            data: punto,
        });
    }
    catch (error) {
        console.error("Error al actualizar el punto:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.actualizarPunto = actualizarPunto;
const eliminarpunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const punto = yield puntos_ordens_1.default.findOne({ where: { id } });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        yield puntos_ordens_1.default.update({ id_dictamen: 0 }, { where: { id_dictamen: punto.id } });
        yield iniciativas_estudio_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { punto_origen_id: punto.id },
                    { punto_destino_id: punto.id }
                ]
            }
        });
        yield inciativas_puntos_ordens_1.default.destroy({ where: { id_punto: punto.id } });
        yield punto.destroy();
        return res.status(200).json({
            message: "Punto eliminado correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar el punto:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.eliminarpunto = eliminarpunto;
const saveintervencion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        //console.log(body)
        const registros = body.id_diputado.map((diputadoId) => ({
            id_punto: body.id_punto,
            id_evento: body.id_evento,
            id_diputado: diputadoId,
            id_tipo_intervencion: body.id_tipo_intervencion,
            mensaje: body.comentario,
            tipo: body.tipo,
            liga: body.liga,
            destacado: body.destacada,
        }));
        console.log(registros);
        const nuevasIntervenciones = yield intervenciones_1.default.bulkCreate(registros, {
            returning: true,
        });
        if (body.destacada == 1) {
            for (const intervencion of nuevasIntervenciones) {
                yield enviarWhatsIntervencion(intervencion);
            }
        }
        return res.status(200).json({
            message: "Intervenciones guardadas correctamente",
        });
    }
    catch (error) {
        console.error("Error al guardar intervenciones:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.saveintervencion = saveintervencion;
const getintervenciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const intervenci = yield intervenciones_1.default.findAll({
            where: {
                id_evento: body.idagenda,
                tipo: body.tipo,
                id_punto: body.idpunto,
            },
            include: [
                {
                    model: tipo_intervencions_1.default,
                    as: "tipointerven",
                    attributes: ["id", "valor"],
                },
            ],
        });
        const resultados = yield Promise.all(intervenci.map((inte) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const diputado = yield diputado_1.default.findOne({
                where: { id: inte.id_diputado },
                attributes: ["apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            return {
                id: inte.id,
                id_evento: inte.id_evento,
                id_punto: inte.id_punto,
                mensaje: inte.mensaje,
                tipo: inte.tipo,
                destacado: inte.destacado,
                tipointerven: inte.tipointerven,
                liga: inte.liga,
                diputado: nombreCompletoDiputado,
            };
        })));
        return res.status(200).json({
            data: resultados,
        });
    }
    catch (error) {
        console.error("Error al traer el evento:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getintervenciones = getintervenciones;
const eliminarinter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const inter = yield intervenciones_1.default.findOne({ where: { id } });
        if (!inter) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        yield inter.destroy();
        return res.status(200).json({
            message: "Intervencion eliminada correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar la intervencion:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.eliminarinter = eliminarinter;
const getvotacionpunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        let tema;
        let puntoa;
        let votos;
        if (body.idPunto && body.idReserva) {
            tema = body.idReserva;
            puntoa = null;
            votos = yield votos_punto_1.default.findOne({ where: { id_tema_punto_voto: body.idReserva } });
        }
        else {
            tema = null;
            puntoa = body.idPunto;
            votos = yield votos_punto_1.default.findOne({ where: { id_punto: body.idPunto } });
        }
        console.log("tema:", tema, "punto:", puntoa);
        const punto = yield puntos_ordens_1.default.findOne({ where: { id: body.idPunto } });
        if (!punto) {
            return res.status(404).json({ msg: "Punto no encontrado" });
        }
        const evento = yield agendas_1.default.findOne({
            where: { id: punto.id_evento },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const tipoEvento = esSesion ? 'sesion' : 'comision';
        const tipovento = esSesion ? 1 : 2;
        let mensajeRespuesta = "Punto con votos existentes";
        if (!votos) {
            const listadoDiputados = yield obtenerListadoDiputados(evento);
            const votospunto = listadoDiputados.map((dip) => ({
                sentido: 0,
                mensaje: "PENDIENTE",
                id_punto: puntoa,
                id_tema_punto_voto: tema,
                id_diputado: dip.id_diputado,
                id_partido: dip.id_partido,
                id_comision_dip: dip.comision_dip_id,
                id_cargo_dip: dip.id_cargo_dip,
            }));
            yield votos_punto_1.default.bulkCreate(votospunto);
            mensajeRespuesta = "Votacion creada correctamente";
        }
        const integrantes = yield obtenerResultadosVotacionOptimizado(tema, puntoa, tipoEvento);
        return res.status(200).json({
            msg: mensajeRespuesta,
            evento,
            integrantes,
            tipovento
        });
    }
    catch (error) {
        console.error("Error al traer los votos:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getvotacionpunto = getvotacionpunto;
function obtenerListadoDiputados(evento) {
    return __awaiter(this, void 0, void 0, function* () {
        const listadoDiputados = [];
        const dipasociados = yield tipo_cargo_comisions_1.default.findOne({
            where: { valor: "Diputado Asociado" }
        });
        const diputados = yield asistencia_votos_1.default.findAll({
            where: {
                id_agenda: evento.id,
            }
        });
        for (const inteLegis of diputados) {
            listadoDiputados.push({
                id_diputado: inteLegis.id_diputado,
                id_partido: inteLegis.partido_dip,
                comision_dip_id: inteLegis.comision_dip_id,
                id_cargo_dip: inteLegis.id_cargo_dip,
            });
        }
        return listadoDiputados;
    });
}
function obtenerResultadosVotacionOptimizado(idTemaPuntoVoto, idPunto, tipoEvento) {
    return __awaiter(this, void 0, void 0, function* () {
        const dipasociados = yield tipo_cargo_comisions_1.default.findOne({
            where: { valor: "Diputado Asociado" }
        });
        const whereConditions = {};
        if (idTemaPuntoVoto) {
            whereConditions.id_tema_punto_voto = idTemaPuntoVoto;
        }
        else if (idPunto) {
            whereConditions.id_punto = idPunto;
        }
        else {
            return []; // No hay nada que buscar
        }
        const votosRaw = yield votos_punto_1.default.findAll({
            where: whereConditions,
            raw: true,
        });
        if (votosRaw.length === 0) {
            return [];
        }
        const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (tipoEvento === 'comision') {
            const comisionIds = votosRaw
                .map(v => v.id_comision_dip)
                .filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = votosRaw
                .map(v => v.id_cargo_dip)
                .filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const resultados = votosRaw.map((voto) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(voto.id_diputado);
            const partido = partidosMap.get(voto.id_partido);
            const comision = comisionesMap.get(voto.id_comision_dip);
            const cargo = cargosMap.get(voto.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : null;
            const resultado = {
                id: voto.id,
                sentido: voto.sentido,
                mensaje: voto.mensaje,
                id_diputado: voto.id_diputado,
                id_partido: voto.id_partido,
                id_comision_dip: voto.id_comision_dip,
                id_cargo_dip: voto.id_cargo_dip,
                diputado: nombreCompletoDiputado,
                partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || null,
            };
            if (tipoEvento === 'comision') {
                resultado.comision_nombre = (comision === null || comision === void 0 ? void 0 : comision.nombre) || null;
                resultado.comision_importancia = (comision === null || comision === void 0 ? void 0 : comision.importancia) || null;
                resultado.cargo = (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null;
                resultado.nivel_cargo = (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999;
            }
            return resultado;
        });
        if (tipoEvento === 'sesion') {
            resultados.sort((a, b) => {
                const nombreA = a.diputado || '';
                const nombreB = b.diputado || '';
                return nombreA.localeCompare(nombreB, 'es');
            });
            return resultados;
        }
        else {
            resultados.sort((a, b) => {
                const nivelA = a.nivel_cargo || 999;
                const nivelB = b.nivel_cargo || 999;
                return nivelA - nivelB;
            });
            const agrupados = resultados.reduce((acc, voto) => {
                const comisionId = voto.id_comision_dip || 'sin_comision';
                if (!acc[comisionId]) {
                    acc[comisionId] = {
                        comision_id: voto.id_comision_dip,
                        comision_nombre: voto.comision_nombre || null,
                        importancia: voto.comision_importancia || null,
                        integrantes: [],
                    };
                }
                acc[comisionId].integrantes.push(voto);
                return acc;
            }, {});
            const resultado = Object.values(agrupados).sort((a, b) => {
                const importanciaA = parseInt(a.importancia || '999');
                const importanciaB = parseInt(b.importancia || '999');
                return importanciaA - importanciaB;
            });
            return resultado;
        }
    });
}
const actualizarvoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.idpunto || !body.id || body.sentido === undefined) {
            return res.status(400).json({
                msg: "Faltan datos requeridos: idpunto, iddiputado y sentido",
            });
        }
        let nuevoSentido;
        let nuevoMensaje;
        switch (body.sentido) {
            case 1:
                nuevoSentido = 1;
                nuevoMensaje = "A FAVOR";
                break;
            case 2:
                nuevoSentido = 2;
                nuevoMensaje = "ABSTENCIÓN";
                break;
            case 0:
                nuevoSentido = 0;
                nuevoMensaje = "PENDIENTE";
                break;
            case 3:
                nuevoSentido = 3;
                nuevoMensaje = "EN CONTRA";
                break;
            default:
                return res.status(400).json({
                    msg: "Sentido de voto inválido. Usa 1 (A FAVOR), 2 (ABSTENCIÓN) o 0/3 (EN CONTRA)",
                });
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: nuevoSentido,
            mensaje: nuevoMensaje,
        }, {
            where: {
                id: body.id,
            }
        });
        if (cantidadActualizada === 0) {
            return res.status(404).json({
                msg: "No se encontró el voto del diputado para este punto",
            });
        }
        return res.status(200).json({
            msg: "Voto actualizado correctamente",
            estatus: 200,
            registrosActualizados: cantidadActualizada,
        });
    }
    catch (error) {
        console.error('Error al actualizar el voto:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.actualizarvoto = actualizarvoto;
const reiniciarvoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.idPunto) {
            return res.status(400).json({
                msg: "Falta el parámetro requerido: idPunto",
            });
        }
        let whereCondition;
        if (body.idReserva) {
            const temavotos = yield temas_puntos_votos_1.default.findOne({
                where: { id: body.idReserva }
            });
            if (!temavotos) {
                return res.status(404).json({
                    msg: "No se encontró el tema de votación",
                });
            }
            whereCondition = { id_tema_punto_voto: temavotos.id };
        }
        else {
            const punto = yield puntos_ordens_1.default.findOne({
                where: { id: body.idPunto }
            });
            if (!punto) {
                return res.status(404).json({
                    msg: "No se encontró el punto",
                });
            }
            whereCondition = { id_punto: punto.id };
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: 0,
            mensaje: "PENDIENTE",
        }, {
            where: whereCondition
        });
        if (cantidadActualizada === 0) {
            return res.status(404).json({
                msg: "No se encontraron votos para reiniciar",
            });
        }
        return res.status(200).json({
            msg: `${cantidadActualizada} voto(s) reiniciado(s) correctamente a PENDIENTE`,
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al reiniciar las votaciones:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.reiniciarvoto = reiniciarvoto;
const catalogossave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sedes = yield sedes_1.default.findAll({
            attributes: ['id', ['sede', 'name']]
        });
        const comisiones = yield comisions_1.default.findAll({
            attributes: ['id', ['nombre', 'name']]
        });
        const municipios = yield municipiosag_1.default.findAll({
            attributes: ['id', ['nombre', 'name']],
        });
        const partidos = yield partidos_1.default.findAll({
            attributes: ['id', ['nombre', 'name']]
        });
        const tipoAutores = yield tipo_autors_1.default.findAll({
            attributes: ['id', ['valor', 'name']]
        });
        const otros = yield otros_autores_1.default.findAll({
            attributes: ['id', ['valor', 'name']]
        });
        const legislatura = yield legislaturas_1.default.findAll({
            attributes: ['id', ['numero', 'name']]
        });
        const tipoevento = yield tipo_eventos_1.default.findAll({
            attributes: ['id', ['nombre', 'name']]
        });
        const idComites = yield tipo_comisions_1.default.findOne({
            where: { valor: 'Comités' }
        });
        let comites = {};
        if (idComites) {
            const com = yield comisions_1.default.findAll({
                where: { tipo_comision_id: idComites.id },
                attributes: ['id', ['nombre', 'name']]
            });
            comites = Object.fromEntries(com.map(item => [item.id, item.nombre]));
        }
        const idPermanente = yield tipo_comisions_1.default.findOne({
            where: { valor: 'Diputación Permanente' }
        });
        let permanente = [];
        if (idPermanente) {
            const dips = yield comisions_1.default.findAll({
                where: { tipo_comision_id: idPermanente.id },
                attributes: ['id', 'nombre']
            });
            console.log(dips);
            permanente = dips.map(item => ({
                id: item.id,
                name: item.nombre
            }));
            console.log('permanente:', permanente);
        }
        // console.log("holaaa:1",permanente)
        // return 500;
        const legisla = yield legislaturas_1.default.findOne({
            order: [["fecha_inicio", "DESC"]],
        });
        let diputadosArray = [];
        if (legisla) {
            const diputados = yield integrante_legislaturas_1.default.findAll({
                where: { legislatura_id: legisla.id },
                include: [
                    {
                        model: diputado_1.default,
                        as: "diputado",
                        attributes: ["id", "nombres", "apaterno", "amaterno"],
                    },
                ],
            });
            diputadosArray = diputados
                .filter(d => d.diputado)
                .map(d => {
                var _a, _b, _c;
                return ({
                    id: d.diputado.id,
                    name: `${(_a = d.diputado.nombres) !== null && _a !== void 0 ? _a : ""} ${(_b = d.diputado.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = d.diputado.amaterno) !== null && _c !== void 0 ? _c : ""}`.trim(),
                });
            });
        }
        return res.json({
            sedes,
            comisiones,
            municipios,
            partidos,
            tipoAutores,
            otros,
            legislatura,
            tipoevento,
            comites,
            permanente,
            diputadosArray
        });
    }
    catch (error) {
        console.error("Error al obtener catálogos de agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.catalogossave = catalogossave;
const saveagenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const agendaBody = req.body;
        let anfitriones = req.body.autores || [];
        if (typeof anfitriones === "string") {
            anfitriones = JSON.parse(anfitriones);
        }
        const files = req.files;
        const versionEstenografica = ((_b = (_a = files === null || files === void 0 ? void 0 : files.version_estenografica) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename) || null;
        const ordenDia = ((_d = (_c = files === null || files === void 0 ? void 0 : files.orden_dia) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.filename) || null;
        const agenda = yield agendas_1.default.create({
            descripcion: agendaBody.descripcion,
            fecha: agendaBody.fecha,
            sede_id: agendaBody.sede_id,
            tipo_evento_id: agendaBody.tipo_evento_id,
            transmision: agendaBody.transmite,
            liga: agendaBody.liga || null,
            fecha_hora_inicio: agendaBody.hora_inicio || null,
            fecha_hora_fin: agendaBody.hora_fin || null,
            version_estenografica: versionEstenografica ? `storage/agendas/${versionEstenografica}` : null,
            orden_dia: ordenDia ? `storage/agendas/${ordenDia}` : null,
            tipo_reunion: agendaBody.reunion != null && agendaBody.reunion !== '' && agendaBody.reunion !== 'null'
                ? parseInt(agendaBody.reunion)
                : null
        });
        for (const item of anfitriones) {
            // console.log("esto es anfitriones", anfitriones)
            // console.log("esto es item", item)
            // return 500;
            const tipoAutorRecord = yield tipo_autors_1.default.findOne({
                where: { valor: item.tipo }
            });
            const tipoAutorId = tipoAutorRecord === null || tipoAutorRecord === void 0 ? void 0 : tipoAutorRecord.id;
            if (!tipoAutorId)
                continue;
            if (Array.isArray(item.autor_id)) {
                for (const autor of item.autor_id) {
                    yield anfitrion_agendas_1.default.create({
                        agenda_id: agenda.id,
                        tipo_autor_id: tipoAutorId,
                        autor_id: autor.autor_id
                    });
                }
            }
            else if (typeof item.autor_id === "string") {
                yield anfitrion_agendas_1.default.create({
                    agenda_id: agenda.id,
                    tipo_autor_id: tipoAutorId,
                    autor_id: item.autor_id
                });
            }
        }
        return res.json({ response: "success", id: agenda.id });
    }
    catch (error) {
        console.error("Error al guardar la agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.saveagenda = saveagenda;
const getAgenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const agenda = yield agendas_1.default.findByPk(id, {
            include: [
                {
                    model: anfitrion_agendas_1.default,
                    as: "anfitrion_agendas"
                }
            ]
        });
        if (!agenda) {
            return res.status(404).json({ msg: "Agenda no encontrada" });
        }
        return res.json(agenda);
    }
    catch (error) {
        console.error("Error al obtener la agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.getAgenda = getAgenda;
const getAgendaHoy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fecha } = req.params;
        console.log(fecha);
        const eventos = yield agendas_1.default.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.between]: [
                        fecha + ' 00:00:00',
                        fecha + ' 23:59:59'
                    ]
                }
            },
            include: [
                {
                    model: sedes_1.default,
                    as: "sede",
                    attributes: ["id", "sede"]
                },
                {
                    model: tipo_eventos_1.default,
                    as: "tipoevento",
                    attributes: ["id", "nombre"],
                }
            ],
            order: [['fecha', 'DESC']]
        });
        console.log(eventos);
        const eventosConComisiones = [];
        for (const evento of eventos) {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
            let comisiones = [];
            let titulo = '';
            if (comisionIds.length > 0) {
                comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre"],
                    raw: true
                });
                titulo = comisiones.map(c => c.nombre).join(", ");
            }
            eventosConComisiones.push(Object.assign(Object.assign({}, evento.toJSON()), { comisiones,
                titulo }));
        }
        return res.status(200).json({
            msg: "listoooo :v ",
            eventos: eventosConComisiones
        });
    }
    catch (error) {
        console.error("Error obteniendo eventos:", error);
        return res.status(500).json({
            msg: "Ocurrió un error al obtener los eventos",
            error: error.message
        });
    }
});
exports.getAgendaHoy = getAgendaHoy;
const updateAgenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const agendaId = req.params.id;
        const body = req.body;
        // console.log(body);
        // return 500;
        let anfitriones = req.body.autores || [];
        if (typeof anfitriones === "string") {
            anfitriones = JSON.parse(anfitriones);
        }
        const agenda = yield agendas_1.default.findByPk(agendaId);
        if (!agenda) {
            return res.status(404).json({ msg: "Agenda no encontrada" });
        }
        const files = req.files;
        const versionEstenograficaFile = ((_b = (_a = files === null || files === void 0 ? void 0 : files.version_estenografica) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename) || null;
        const ordenDiaFile = ((_d = (_c = files === null || files === void 0 ? void 0 : files.orden_dia) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.filename) || null;
        // console.log("Orden del dia", ordenDiaFile )
        // console.log("Version", files?.version_estenografica?.[0]?.filename  )
        // return 500;
        yield agenda.update({
            descripcion: body.descripcion,
            fecha: body.fecha,
            sede_id: body.sede_id,
            tipo_evento_id: body.tipo_evento_id,
            transmision: body.transmite,
            liga: body.liga || null,
            fecha_hora_inicio: body.hora_inicio || null,
            fecha_hora_fin: body.hora_fin || null,
            version_estenografica: versionEstenograficaFile ? `storage/agendas/${versionEstenograficaFile}` : agenda.version_estenografica,
            orden_dia: ordenDiaFile ? `storage/agendas/${ordenDiaFile}` : agenda.orden_dia,
            tipo_reunion: body.reunion != null && body.reunion !== '' && body.reunion !== 'null'
                ? parseInt(body.reunion)
                : null
        });
        yield anfitrion_agendas_1.default.destroy({
            where: { agenda_id: agendaId }
        });
        for (const item of anfitriones) {
            const tipoAutorRecord = yield tipo_autors_1.default.findOne({
                where: { valor: item.tipo }
            });
            const tipoAutorId = tipoAutorRecord === null || tipoAutorRecord === void 0 ? void 0 : tipoAutorRecord.id;
            if (!tipoAutorId)
                continue;
            if (Array.isArray(item.autor_id)) {
                for (const autor of item.autor_id) {
                    yield anfitrion_agendas_1.default.create({
                        agenda_id: agendaId,
                        tipo_autor_id: tipoAutorId,
                        autor_id: autor.autor_id
                    });
                }
            }
            else if (typeof item.autor_id === "string") {
                yield anfitrion_agendas_1.default.create({
                    agenda_id: agendaId,
                    tipo_autor_id: tipoAutorId,
                    autor_id: item.autor_id
                });
            }
        }
        return res.json({
            response: "success",
            id: agendaId
        });
    }
    catch (error) {
        console.error("Error al actualizar la agenda:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.updateAgenda = updateAgenda;
const enviarWhatsIntervencion = (intervencion) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const datos = yield intervenciones_1.default.findOne({
            where: { id: intervencion.id },
            attributes: ['id', 'id_diputado', 'mensaje', 'id_punto', 'id_evento'],
            include: [
                {
                    model: puntos_ordens_1.default,
                    as: "punto",
                    attributes: ["nopunto", "punto"],
                    required: false
                },
                {
                    model: agendas_1.default,
                    as: "evento",
                    attributes: ["descripcion", "fecha"],
                    required: false
                }
            ],
            raw: false
        });
        if (!datos)
            return;
        const diputado = yield diputado_1.default.findOne({
            where: { id: datos.id_diputado },
            attributes: ["apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const nombreCompleto = diputado
            ? [diputado.apaterno, diputado.amaterno, diputado.nombres]
                .filter(Boolean)
                .join(" ")
            : "Diputado";
        let titulo = "Intervención destacada";
        if (datos.punto) {
            titulo = `del punto ${datos.punto.nopunto}.- ${datos.punto.punto}`;
        }
        else if (datos.evento) {
            const fechaFormateada = (0, date_fns_1.format)(new Date(datos.evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
            titulo = `de la ${datos.evento.descripcion} (${fechaFormateada})`;
        }
        yield axios_1.default.post("https://api.ultramsg.com/instance144598/messages/chat", new URLSearchParams({
            token: "ml56a7d6tn7ha7cc",
            to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
            body: `*Intervención destacada ${titulo}*\n*${nombreCompleto}*: ${datos.mensaje}\n`,
            priority: "1",
            referenceId: "",
            msgId: "",
            mentions: ""
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 5000
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error("Timeout enviando WhatsApp");
        }
        else {
            console.error("Error enviando WhatsApp:", error);
        }
    }
});
const enviarWhatsPunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const datos = yield puntos_ordens_1.default.findOne({
            where: { id },
            include: [
                {
                    model: puntos_presenta_1.default,
                    as: "presentan",
                    required: false
                },
                {
                    model: agendas_1.default,
                    as: "evento",
                    attributes: ["descripcion", "fecha"],
                    required: false
                }
            ],
            raw: false
        });
        if (!datos) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const nopunto = (_b = (_a = datos.nopunto) !== null && _a !== void 0 ? _a : datos.nopunto) !== null && _b !== void 0 ? _b : "";
        const puntoTexto = (_d = (_c = datos.punto) !== null && _c !== void 0 ? _c : datos.punto) !== null && _d !== void 0 ? _d : "";
        const tituloPunto = `${nopunto}.- ${puntoTexto}`;
        const descripcion = (_f = (_e = datos.evento) === null || _e === void 0 ? void 0 : _e.descripcion) !== null && _f !== void 0 ? _f : "Sin descripción";
        let fechaFormateada = "";
        if ((_g = datos.evento) === null || _g === void 0 ? void 0 : _g.fecha) {
            fechaFormateada = (0, date_fns_1.format)(new Date(datos.evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
        }
        const mensaje = `*Punto número ${nopunto}:*\n${puntoTexto}\n\n*Descripción del evento:* ${descripcion}\n*Fecha:* ${fechaFormateada}`;
        const params = {
            token: "ml56a7d6tn7ha7cc",
            to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
            body: mensaje,
            priority: "1",
            referenceId: "",
            msgId: "",
            mentions: ""
        };
        yield axios_1.default.post("https://api.ultramsg.com/instance144598/messages/chat", new URLSearchParams(params), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        return res.status(200).json({
            message: "WhatsApp enviado correctamente",
            enviado: true
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error("Timeout enviando WhatsApp");
        }
        else {
            console.error("Error enviando WhatsApp:", error);
        }
        return res.status(500).json({ message: "Error enviando WhatsApp" });
    }
});
exports.enviarWhatsPunto = enviarWhatsPunto;
const gestionIntegrantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        let cargos = [];
        let comisiones = [];
        if (!esSesion) {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            const comisionIds = anfitriones.map(a => a.autor_id).filter(Boolean);
            if (comisionIds.length > 0) {
                comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ['id', 'nombre'],
                    raw: true,
                });
            }
            cargos = yield tipo_cargo_comisions_1.default.findAll({
                attributes: ['id', 'valor', 'nivel'],
                order: [['nivel', 'ASC']],
                raw: true,
            });
        }
        const partidos = yield partidos_1.default.findAll({
            attributes: ['id', 'siglas'],
            raw: true,
        });
        const legislatura = yield legislaturas_1.default.findOne({
            order: [["fecha_inicio", "DESC"]],
        });
        let diputadosArray = [];
        if (legislatura) {
            const diputados = yield integrante_legislaturas_1.default.findAll({
                where: { legislatura_id: legislatura.id },
                paranoid: false,
                include: [
                    {
                        model: diputado_1.default,
                        as: "diputado",
                        paranoid: false,
                        attributes: ["id", "nombres", "apaterno", "amaterno"],
                    },
                ],
            });
            diputadosArray = diputados
                .filter(d => d.diputado)
                .map(d => {
                var _a, _b, _c;
                return ({
                    id: d.diputado.id,
                    nombre: `${(_a = d.diputado.nombres) !== null && _a !== void 0 ? _a : ""} ${(_b = d.diputado.apaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = d.diputado.amaterno) !== null && _c !== void 0 ? _c : ""}`.trim(),
                });
            })
                .sort((a, b) => a.nombre.localeCompare(b.nombre));
        }
        console.log(diputadosArray.length);
        return res.json({
            diputados: diputadosArray,
            partidos: partidos,
            cargos: cargos,
            comisiones: comisiones,
            esSesion: esSesion
        });
    }
    catch (error) {
        console.error("Error en gestionIntegrantes:", error);
        return res.status(500).json({
            msg: "Error al obtener integrantes",
            error: error.message
        });
    }
});
exports.gestionIntegrantes = gestionIntegrantes;
const addDipLista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const cargo = yield tipo_cargo_comisions_1.default.findOne({
            where: { id: body.id_cargo_dip }
        });
        if (cargo && cargo.valor == "Diputado Asociado") {
            const asistencia = yield diputados_asociados_1.default.create({
                id_diputado: body.id_diputado,
                partido_dip: body.id_partido,
                comision_dip_id: body.comision_dip_id,
                id_agenda: body.id_agenda,
                id_cargo_dip: body.id_cargo_dip
            });
        }
        else {
            const mensaje = "PENDIENTE";
            const timestamp = new Date();
            const asistencia = yield asistencia_votos_1.default.create({
                sentido_voto: 0,
                mensaje,
                timestamp,
                id_diputado: body.id_diputado,
                partido_dip: body.id_partido,
                comision_dip_id: body.comision_dip_id,
                id_agenda: body.id_agenda,
                id_cargo_dip: body.id_cargo_dip
            });
            const temavotos = yield temas_puntos_votos_1.default.findAll({
                where: { id_evento: body.id_agenda }
            });
            for (const tema of temavotos) {
                yield tema.createVotospunto({
                    sentido: 0,
                    mensaje,
                    id_diputado: body.id_diputado,
                    id_partido: body.id_partido,
                    id_comision_dip: body.comision_dip_id,
                    id_cargo_dip: body.id_cargo_dip
                });
            }
        }
        return res.json({
            msg: "Diputado agregado correctamente",
            estatus: 200,
        });
    }
    catch (error) {
        console.error("Error en guardar el nuevo diputado :", error);
        return res.status(500).json({
            msg: "Error en guardar el nuevo diputado",
            error: error.message
        });
    }
});
exports.addDipLista = addDipLista;
const Eliminarlista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const integrante = yield asistencia_votos_1.default.findOne({ where: { id } });
        if (!integrante) {
            return res.status(404).json({
                msg: "El diputado no existe en la lista",
                estatus: 404
            });
        }
        const temas = yield temas_puntos_votos_1.default.findAll({
            where: { id_evento: integrante.id_agenda },
            attributes: ["id"]
        });
        const temasIds = temas.map(t => t.id);
        if (temasIds.length > 0) {
            yield votos_punto_1.default.destroy({
                where: {
                    id_diputado: integrante.id_diputado,
                    id_comision_dip: integrante.comision_dip_id,
                    id_tema_punto_voto: temasIds
                }
            });
        }
        yield integrante.destroy();
        return res.json({
            msg: "Diputado y votos correspondientes eliminados correctamente",
            estatus: 200
        });
    }
    catch (error) {
        console.error("Error en Eliminarlista:", error);
        return res.status(500).json({
            msg: "Error al eliminar integrante",
            error: error.message
        });
    }
});
exports.Eliminarlista = Eliminarlista;
const EliminardipAsociado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const integrante = yield diputados_asociados_1.default.findOne({ where: { id } });
        if (!integrante) {
            return res.status(404).json({
                msg: "El diputado no existe en la lista",
                estatus: 404
            });
        }
        yield integrante.destroy();
        return res.json({
            msg: "Diputado Asociado eliminado correctamente",
            estatus: 200
        });
    }
    catch (error) {
        console.error("Error en Eliminarlista:", error);
        return res.status(500).json({
            msg: "Error al eliminar el diputado asociado",
            error: error.message
        });
    }
});
exports.EliminardipAsociado = EliminardipAsociado;
const generarPDFVotacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        // const body = req.body;
        console.log("punto", id);
        // return 500;
        const punto = yield puntos_ordens_1.default.findOne({ where: { id } });
        if (!punto) {
            return res.status(404).json({ msg: "Punto no encontrado" });
        }
        const evento = yield agendas_1.default.findOne({
            where: { id: punto.id_evento },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        // Determinar tipo de evento
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        // let temavotos = await TemasPuntosVotos.findOne({ where: { id_punto: id } });
        // if (!temavotos) {
        //   return res.status(404).json({ msg: "No hay votaciones para este punto" });
        // }
        const votosRaw = yield votos_punto_1.default.findAll({
            where: { id_punto: punto.id },
            raw: true,
        });
        if (votosRaw.length === 0) {
            return res.status(404).json({ msg: "No hay votos registrados" });
        }
        // Obtener diputados
        const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        // Obtener partidos
        const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        // Obtener comisiones y cargos (solo si es comisión)
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (!esSesion) {
            const comisionIds = votosRaw.map(v => v.id_comision_dip).filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = votosRaw.map(v => v.id_cargo_dip).filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const getSentidoTexto = (sentido) => {
            switch (sentido) {
                case 1: return "A FAVOR";
                case 2: return "ABSTENCIÓN";
                case 3: return "EN CONTRA";
                case 0: return "PENDIENTE";
                default: return "PENDIENTE";
            }
        };
        const getColorSentido = (sentido) => {
            switch (sentido) {
                case 1: return '#22c55e'; // Verde - A FAVOR
                case 3: return '#dc2626'; // Rojo - EN CONTRA
                case 2: return '#f59e0b'; // Amarillo - ABSTENCIÓN
                case 0: return '#6b7280'; // Gris - PENDIENTE
                default: return '#6b7280';
            }
        };
        // Mapear votos con detalles
        const votosConDetalles = votosRaw.map((voto) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(voto.id_diputado);
            const partido = partidosMap.get(voto.id_partido);
            const comision = comisionesMap.get(voto.id_comision_dip);
            const cargo = cargosMap.get(voto.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : "Sin nombre";
            return Object.assign(Object.assign({}, voto), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido", comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || null, comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999, sentidoTexto: getSentidoTexto(voto.sentido), sentidoNumerico: voto.sentido, mensaje: voto.mensaje });
        });
        // Calcular totales
        const totales = {
            favor: votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
            contra: votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
            abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
            pendiente: votosConDetalles.filter(v => v.mensaje === 'PENDIENTE' && v.sentidoNumerico === 0).length,
        };
        const totalVotos = votosConDetalles.length;
        // Crear PDF
        const doc = new pdfkit_1.default({
            size: 'LETTER',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            bufferPages: true
        });
        const fileName = `votacion-punto-${id}-${Date.now()}.pdf`;
        const outputPath = path_1.default.join(__dirname, '../../storage/pdfs', fileName);
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const writeStream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(writeStream);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);
        // Ruta de la imagen de fondo
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva.jpg");
        // Función para dibujar fondo de página
        const drawBackground = () => {
            doc.image(bgPath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.y = 106;
        };
        // Dibujar fondo en la primera página
        drawBackground();
        // ===== DISEÑO DEL PDF =====
        // Encabezado
        doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE VOTACIÓN', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
        doc.moveDown(1);
        // Información del Evento
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
        doc.moveDown(0.3);
        // Tipo
        doc.fontSize(11).font('Helvetica-Bold').text('Tipo: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(((_b = evento.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) || 'N/A');
        // Sede
        doc.fontSize(11).font('Helvetica-Bold').text('Sede: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(((_c = evento.sede) === null || _c === void 0 ? void 0 : _c.sede) || 'N/A');
        // Fecha
        doc.fontSize(11).font('Helvetica-Bold').text('Fecha: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A');
        doc.moveDown(1);
        // Información del Punto
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL PUNTO');
        doc.moveDown(0.3);
        // Número
        doc.fontSize(11).font('Helvetica-Bold').text('Número: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(punto.nopunto || 'N/A');
        // Descripción (justificada)
        doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(punto.punto || 'N/A', { width: 500, align: "justify" });
        doc.moveDown(1);
        // Resumen de Votación
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE VOTACIÓN');
        doc.moveDown(0.3);
        const tableTop = doc.y;
        const colWidths = [110, 90, 90, 90, 80];
        const rowHeight = 25;
        // Encabezados de tabla
        doc.fontSize(11).font('Helvetica-Bold');
        // A FAVOR - Verde
        doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
        doc.fillColor('#fff').text('A FAVOR', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });
        // EN CONTRA - Rojo
        doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#dc2626', '#000');
        doc.fillColor('#fff').text('EN CONTRA', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });
        // ABSTENCIÓN - Amarillo
        doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
        doc.fillColor('#fff').text('ABSTENCIÓN', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });
        // PENDIENTE - Gris
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
        doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });
        // TOTAL - Azul
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, colWidths[4], rowHeight).fillAndStroke('#1e40af', '#000');
        doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, tableTop + 7, { width: colWidths[4] - 10, align: 'center' });
        // Valores de totales
        const valuesTop = tableTop + rowHeight;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.favor.toString(), 55, valuesTop + 7, { width: colWidths[0] - 10, align: 'center' });
        doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.contra.toString(), 50 + colWidths[0] + 5, valuesTop + 7, { width: colWidths[1] - 10, align: 'center' });
        doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.abstencion.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 7, { width: colWidths[2] - 10, align: 'center' });
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 7, { width: colWidths[3] - 10, align: 'center' });
        // TOTAL
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], valuesTop, colWidths[4], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totalVotos.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, valuesTop + 7, { width: colWidths[4] - 10, align: 'center' });
        doc.moveDown(2);
        doc.x = doc.page.margins.left;
        // ===== DETALLE DE VOTACIÓN SEGÚN TIPO DE EVENTO =====
        if (esSesion) {
            generarDetalleSesion(doc, votosConDetalles, drawBackground, getColorSentido);
        }
        else {
            generarDetalleComision(doc, votosConDetalles, drawBackground, getColorSentido);
        }
        doc.end();
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }
    catch (error) {
        console.error("Error al generar PDF:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Error al generar PDF de votación",
                error: error.message
            });
        }
    }
});
exports.generarPDFVotacion = generarPDFVotacion;
function generarDetalleSesion(doc, votos, drawBackground, getColorSentido) {
    // Título principal - barra vino igual que asistencia
    const titY = doc.y;
    doc.rect(30, titY, doc.page.width - 60, 22).fill('#96134b');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
        .text('DETALLE DE VOTACIÓN', 30, titY + 5, { width: doc.page.width - 60, align: 'center' });
    doc.y = titY + 30;
    const votosOrdenados = [...votos].sort((a, b) => a.diputado.localeCompare(b.diputado, 'es'));
    // Encabezado columnas - gris claro con texto vino
    const hY = doc.y;
    const colX = { no: 30, diputado: 58, partido: 390, sentido: 455 };
    const tableW = doc.page.width - 60;
    doc.rect(30, hY, tableW, 18).fill('#d4d4d4');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
    doc.text('No.', colX.no + 2, hY + 5, { width: 25 });
    doc.text('DIPUTADO', colX.diputado + 2, hY + 5, { width: 325 });
    doc.text('PARTIDO', colX.partido + 2, hY + 5, { width: 60 });
    doc.text('SENTIDO', colX.sentido + 2, hY + 5, { width: 90 });
    let currentY = hY + 18;
    votosOrdenados.forEach((voto, index) => {
        if (currentY > 700) {
            doc.addPage();
            drawBackground();
            currentY = 106;
            // Re-título en nueva página
            const rY = currentY;
            doc.rect(30, rY, doc.page.width - 60, 22).fill('#96134b');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
                .text('DETALLE DE VOTACIÓN', 30, rY + 5, { width: doc.page.width - 60, align: 'center' });
            currentY = rY + 30;
            // Re-encabezado
            doc.rect(30, currentY, tableW, 18).fill('#d4d4d4');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
            doc.text('No.', colX.no + 2, currentY + 5, { width: 25 });
            doc.text('DIPUTADO', colX.diputado + 2, currentY + 5, { width: 325 });
            doc.text('PARTIDO', colX.partido + 2, currentY + 5, { width: 60 });
            doc.text('SENTIDO', colX.sentido + 2, currentY + 5, { width: 90 });
            currentY += 18;
        }
        // Filas alternadas
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
        doc.rect(30, currentY, tableW, 16).fill(bgColor);
        doc.moveTo(30, currentY + 16).lineTo(30 + tableW, currentY + 16).stroke('#e0e0e0');
        doc.fontSize(8).font('Helvetica').fillColor('#000');
        doc.text(`${index + 1}`, colX.no + 2, currentY + 4, { width: 25 });
        doc.text(voto.diputado, colX.diputado + 2, currentY + 4, { width: 325, ellipsis: true });
        doc.text(voto.partido, colX.partido + 2, currentY + 4, { width: 60, ellipsis: true });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(getColorSentido(voto.sentidoNumerico));
        doc.text(voto.sentidoTexto, colX.sentido + 2, currentY + 4, { width: 90, ellipsis: true });
        currentY += 16;
    });
    doc.y = currentY + 10;
}
function generarDetalleComision(doc, votos, drawBackground, getColorSentido) {
    // Título principal - barra vino igual que asistencia
    const titY = doc.y;
    doc.rect(30, titY, doc.page.width - 60, 22).fill('#96134b');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
        .text('DETALLE DE VOTACIÓN POR COMISIÓN', 30, titY + 5, { width: doc.page.width - 60, align: 'center' });
    doc.y = titY + 30;
    const votosPorComision = votos.reduce((grupos, voto) => {
        const comision = voto.comision_nombre || 'Sin comisión';
        if (!grupos[comision]) {
            grupos[comision] = { nombre: comision, importancia: voto.comision_importancia, votos: [] };
        }
        grupos[comision].votos.push(voto);
        return grupos;
    }, {});
    const comisionesOrdenadas = Object.values(votosPorComision)
        .sort((a, b) => a.importancia - b.importancia);
    comisionesOrdenadas.forEach((comision) => {
        if (doc.y > 650) {
            doc.addPage();
            drawBackground();
            doc.y = 106;
            // Re-título en nueva página
            const rY = doc.y;
            doc.rect(30, rY, doc.page.width - 60, 22).fill('#96134b');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
                .text('DETALLE DE VOTACIÓN POR COMISIÓN', 30, rY + 5, { width: doc.page.width - 60, align: 'center' });
            doc.y = rY + 30;
        }
        // Subtítulo comisión - barra gris igual que asistencia
        const subY = doc.y;
        doc.rect(30, subY, doc.page.width - 60, 20).fill('#7a7a7a');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
            .text(comision.nombre.toUpperCase(), 35, subY + 5, { width: doc.page.width - 70, align: 'center' });
        doc.y = subY + 20;
        const votosOrdenados = [...comision.votos].sort((a, b) => a.nivel_cargo - b.nivel_cargo);
        // Encabezado columnas - gris claro con texto vino
        const hY = doc.y;
        const colX = { no: 30, diputado: 58, cargo: 290, partido: 400, sentido: 455 };
        const tableW = doc.page.width - 60;
        doc.rect(30, hY, tableW, 18).fill('#d4d4d4');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
        doc.text('No.', colX.no + 2, hY + 5, { width: 25 });
        doc.text('DIPUTADO', colX.diputado + 2, hY + 5, { width: 225 });
        doc.text('CARGO', colX.cargo + 2, hY + 5, { width: 105 });
        doc.text('PARTIDO', colX.partido + 2, hY + 5, { width: 50 });
        doc.text('SENTIDO', colX.sentido + 2, hY + 5, { width: 90 });
        let currentY = hY + 18;
        votosOrdenados.forEach((voto, index) => {
            if (currentY > 700) {
                doc.addPage();
                drawBackground();
                currentY = 106;
                // Subtítulo continuación
                doc.rect(30, currentY, doc.page.width - 60, 20).fill('#7a7a7a');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
                    .text(`${comision.nombre.toUpperCase()} (continuación)`, 35, currentY + 5, { width: doc.page.width - 70, align: 'center' });
                currentY += 20;
                // Re-encabezado
                doc.rect(30, currentY, tableW, 18).fill('#d4d4d4');
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
                doc.text('No.', colX.no + 2, currentY + 5, { width: 25 });
                doc.text('DIPUTADO', colX.diputado + 2, currentY + 5, { width: 225 });
                doc.text('CARGO', colX.cargo + 2, currentY + 5, { width: 105 });
                doc.text('PARTIDO', colX.partido + 2, currentY + 5, { width: 50 });
                doc.text('SENTIDO', colX.sentido + 2, currentY + 5, { width: 90 });
                currentY += 18;
            }
            // Filas alternadas
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
            doc.rect(30, currentY, tableW, 16).fill(bgColor);
            doc.moveTo(30, currentY + 16).lineTo(30 + tableW, currentY + 16).stroke('#e0e0e0');
            doc.fontSize(8).font('Helvetica').fillColor('#000');
            doc.text(`${index + 1}`, colX.no + 2, currentY + 4, { width: 25 });
            doc.text(voto.diputado, colX.diputado + 2, currentY + 4, { width: 225, ellipsis: true });
            doc.text(voto.cargo || 'Sin cargo', colX.cargo + 2, currentY + 4, { width: 105, ellipsis: true });
            doc.text(voto.partido, colX.partido + 2, currentY + 4, { width: 50, ellipsis: true });
            doc.fontSize(8).font('Helvetica-Bold').fillColor(getColorSentido(voto.sentidoNumerico));
            doc.text(voto.sentidoTexto, colX.sentido + 2, currentY + 4, { width: 90, ellipsis: true });
            currentY += 16;
        });
        doc.y = currentY + 10;
    });
}
// export const enviarWhatsVotacionPDF = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { body } = req;
//     if (!body.idPunto) {
//       return res.status(400).json({ msg: "Falta el parámetro requerido: idPunto" });
//     }
//     const punto = await PuntosOrden.findOne({ where: { id: body.idPunto } });
//     if (!punto) return res.status(404).json({ msg: "Punto no encontrado" });
//     const evento = await Agenda.findOne({
//       where: { id: punto.id_evento },
//       include: [
//         { model: Sedes, as: "sede", attributes: ["id", "sede"] },
//         { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
//       ],
//     });
//     if (!evento) return res.status(404).json({ msg: "Evento no encontrado" });
//     const esSesion = evento.tipoevento?.nombre === "Sesión";
//     let whereCondition: any;
//     let temaInfo: any = null;
//     if (body.idReserva) {
//       const temavotos = await TemasPuntosVotos.findOne({ where: { id: body.idReserva } });
//       if (!temavotos) return res.status(404).json({ msg: "No se encontró el tema de votación" });
//       whereCondition = { id_tema_punto_voto: temavotos.id };
//       temaInfo = temavotos;
//     } else {
//       whereCondition = { id_punto: body.idPunto };
//     }
//     // ===== SESIÓN, PUNTO E INICIATIVA DE ORIGEN =====
//     const estudio = await IniciativaEstudio.findOne({ where: { punto_destino_id: body.idPunto } });
//     let sesionInfo = null;
//     let puntoOrigenInfo = null;
//     let iniciativaInfo = null;
//     if (estudio) {
//       let puntoOrigenId = null;
//       if (estudio.type === "1") {
//         puntoOrigenId = estudio.punto_origen_id;
//       } else if (estudio.type === "2") {
//         const expPunto = await ExpedienteEstudiosPuntos.findOne({
//           where: { expediente_id: estudio.punto_origen_id },
//           attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
//         });
//         puntoOrigenId = expPunto?.punto_origen_sesion_id ?? null;
//       }
//       if (puntoOrigenId) {
//         const puntoOrigen = await PuntosOrden.findOne({
//           where: { id: puntoOrigenId },
//           include: [{
//             model: Agenda, as: 'evento',
//             attributes: ["id", "fecha", "descripcion"],
//             include: [{ model: TipoEventos, as: 'tipoevento', attributes: ["nombre"] }]
//           }]
//         });
//         if (puntoOrigen) {
//           sesionInfo = {
//             fecha: puntoOrigen.evento?.fecha
//               ? new Date(puntoOrigen.evento.fecha).toLocaleDateString('es-MX')
//               : 'N/A',
//             descripcion: puntoOrigen.evento?.descripcion ?? 'N/A'
//           };
//           puntoOrigenInfo = {
//             nopunto: puntoOrigen.nopunto ?? 'N/A',
//             punto: puntoOrigen.punto ?? 'N/A'
//           };
//           const iniciativa = await IniciativaPuntoOrden.findOne({
//             where: { id_punto: puntoOrigenId },
//             attributes: ["id", "iniciativa", "expediente"]
//           });
//           if (iniciativa) {
//             iniciativaInfo = {
//               id: iniciativa.id,
//               iniciativa: iniciativa.iniciativa,
//               expediente: iniciativa.expediente
//             };
//           }
//         }
//       }
//     }
//     // ===== VOTOS =====
//     const votosRaw = await VotosPunto.findAll({ where: whereCondition, raw: true });
//     if (votosRaw.length === 0) return res.status(404).json({ msg: "No hay votos registrados" });
//     const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
//     const diputados = await Diputado.findAll({
//       where: { id: diputadoIds },
//       attributes: ["id", "apaterno", "amaterno", "nombres"],
//       raw: true,
//     });
//     const diputadosMap = new Map(diputados.map(d => [d.id, d]));
//     const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
//     const partidos = await Partidos.findAll({
//       where: { id: partidoIds },
//       attributes: ["id", "siglas"],
//       raw: true,
//     });
//     const partidosMap = new Map(partidos.map(p => [p.id, p]));
//     let comisionesMap = new Map();
//     let cargosMap = new Map();
//     if (!esSesion) {
//       const comisionIds = votosRaw.map(v => v.id_comision_dip).filter(Boolean);
//       if (comisionIds.length > 0) {
//         const comisiones = await Comision.findAll({
//           where: { id: comisionIds },
//           attributes: ["id", "nombre", "importancia"],
//           raw: true,
//         });
//         comisionesMap = new Map(comisiones.map(c => [c.id, c]));
//       }
//       const cargoIds = votosRaw.map(v => v.id_cargo_dip).filter(Boolean);
//       if (cargoIds.length > 0) {
//         const cargos = await TipoCargoComision.findAll({
//           where: { id: cargoIds },
//           attributes: ["id", "valor", "nivel"],
//           raw: true,
//         });
//         cargosMap = new Map(cargos.map(c => [c.id, c]));
//       }
//     }
//     const getSentidoTexto = (sentido: number): string => {
//       switch (sentido) {
//         case 0: return "PENDIENTE";
//         case 1: return "A FAVOR";
//         case 2: return "ABSTENCIÓN";
//         case 3: return "EN CONTRA";
//         default: return "PENDIENTE";
//       }
//     };
//     const getColorSentido = (sentido: number): string => {
//       switch (sentido) {
//         case 1: return '#22c55e';
//         case 3: return '#dc2626';
//         case 2: return '#f59e0b';
//         case 0: return '#6b7280';
//         default: return '#6b7280';
//       }
//     };
//     const votosConDetalles = votosRaw.map((voto) => {
//       const diputado = diputadosMap.get(voto.id_diputado);
//       const partido = partidosMap.get(voto.id_partido);
//       const comision = comisionesMap.get(voto.id_comision_dip);
//       const cargo = cargosMap.get(voto.id_cargo_dip);
//       const nombreCompletoDiputado = diputado
//         ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
//         : "Sin nombre";
//       return {
//         ...voto,
//         diputado: nombreCompletoDiputado,
//         partido: partido?.siglas || "Sin partido",
//         comision_nombre: comision?.nombre || null,
//         comision_importancia: comision?.importancia || 999,
//         cargo: cargo?.valor || null,
//         nivel_cargo: cargo?.nivel || 999,
//         sentidoTexto: getSentidoTexto(voto.sentido),
//         sentidoNumerico: voto.sentido,
//         mensaje: voto.mensaje
//       };
//     });
//     const totales = {
//       favor:      votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
//       contra:     votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
//       abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
//       pendiente:  votosConDetalles.filter(v => v.sentidoNumerico === 0).length,
//     };
//     const totalVotos = votosConDetalles.length;
//     // ===== CREAR PDF =====
//     const doc = new PDFDocument({ 
//       size: 'LETTER', 
//       margins: { top: 0, bottom: 30, left: 0, right: 0 },
//       bufferPages: true
//     });
//     const fileName = `votacion-punto-${body.idPunto}-${Date.now()}.pdf`;
//     const outputPath = path.join(__dirname, '../../storage/pdfs', fileName);
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     const writeStream = fs.createWriteStream(outputPath);
//     doc.pipe(writeStream);
//     const bgPath = path.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
//     const drawBackground = () => {
//       doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });
//       doc.y = 106;
//     };
//     drawBackground();
//     // ===== HELPER: TÍTULO CON ICONO DIAMANTE =====
//     const drawSectionHeader = (label: string, x: number, y: number, w: number): number => {
//       doc.rect(x, y, w, 22).fill('#96134b');
//       doc.save();
//       doc.translate(x - 8, y + 11).rotate(45);
//       doc.rect(-7, -7, 14, 14).fill('#96134b');
//       doc.restore();
//       doc.save();
//       doc.translate(x - 8, y + 11).rotate(45);
//       doc.rect(-5, -5, 10, 10).fill('#c0395e');
//       doc.restore();
//       doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
//         .text(label, x + 10, y + 6, { width: w - 20 });
//       return y + 22;
//     };
//     // ===== HELPER: FILA INFO =====
//     const drawInfoRow = (
//       label: string, value: string,
//       x: number, y: number, w: number,
//       isEven: boolean, rowH: number = 18
//     ): number => {
//       doc.rect(x, y, w, rowH).fill(isEven ? '#ffffff' : '#f5f5f5');
//       doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
//         .text(label, x + 10, y + 5, { width: 80, align: 'right' });
//       doc.fontSize(9).font('Helvetica').fillColor('#000')
//         .text(value, x + 100, y + 5, { width: w - 110 });
//       return y + rowH;
//     };
//     // ===== BLOQUE DERECHO — al lado del bloque vino =====
//     const vinoX = 30;
//     const vinoY = 106;
//     const vinoW = 150;
//     const rightX = vinoX + vinoW + 20;
//     const rightW = doc.page.width - rightX - 30;
//     let rightY = vinoY;
//     // --- INFORMACIÓN DEL EVENTO ---
//     rightY = drawSectionHeader('INFORMACIÓN DEL EVENTO', rightX, rightY, rightW);
//     const eventoRows = [
//       { label: 'Tipo',  value: evento.tipoevento?.nombre || 'N/A' },
//       { label: 'Sede',  value: evento.sede?.sede || 'N/A' },
//       { label: 'Fecha', value: evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A' },
//     ];
//     eventoRows.forEach((row, i) => {
//       rightY = drawInfoRow(row.label, row.value, rightX, rightY, rightW, i % 2 === 0);
//     });
//     // --- SESIÓN DE ORIGEN (al lado del bloque vino) ---
//     if (sesionInfo) {
//       rightY = drawSectionHeader('SESIÓN DE ORIGEN', rightX, rightY, rightW);
//       rightY = drawInfoRow('Fecha', sesionInfo.fecha, rightX, rightY, rightW, true);
//       rightY = drawInfoRow('Descripción', sesionInfo.descripcion, rightX, rightY, rightW, false, 35);
//     }
//     // --- PUNTO DE ORIGEN (al lado del bloque vino) ---
//     if (puntoOrigenInfo) {
//       rightY = drawSectionHeader('PUNTO DE ORIGEN', rightX, rightY, rightW);
//       rightY = drawInfoRow('Número', String(puntoOrigenInfo.nopunto), rightX, rightY, rightW, true);
//       rightY = drawInfoRow('Punto', puntoOrigenInfo.punto, rightX, rightY, rightW, false, 35);
//     }
//     // ===== BLOQUE VINO — alto exacto de lo que ocupó el lado derecho =====
//     const vinoH = rightY - vinoY;
//     doc.rect(vinoX, vinoY, vinoW, vinoH).fill('#96134b');
//     doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
//       .text('REGISTRO DE', vinoX + 10, vinoY + 40, { width: vinoW - 20, align: 'left' });
//     doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
//       .text('VOTACIÓN', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
//     doc.moveDown(0.5);
//     doc.fontSize(8).font('Helvetica').fillColor('#fff')
//       .text('Legislatura del Estado de México', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
//     // ===== SECCIONES RESTANTES — ancho completo =====
//     const fullX = 30;
//     const fullW = doc.page.width - 60;
//     doc.y = rightY + 10;
//     // --- INICIATIVA ---
//     if (iniciativaInfo) {
//       let secY = doc.y;
//       secY = drawSectionHeader('INICIATIVA', fullX, secY, fullW);
//       secY = drawInfoRow('Descripción', iniciativaInfo.iniciativa ?? 'N/A', fullX, secY, fullW, true, 35);
//       doc.y = secY;
//     }
//     // --- INFORMACIÓN DEL PUNTO ---
//     {
//       let secY = doc.y;
//       secY = drawSectionHeader('INFORMACIÓN DEL PUNTO', fullX, secY, fullW);
//       secY = drawInfoRow('Número', String(punto.nopunto || 'N/A'), fullX, secY, fullW, true);
//       secY = drawInfoRow('Descripción', punto.punto || 'N/A', fullX, secY, fullW, false, 35);
//       if (temaInfo) {
//         secY = drawInfoRow('Reserva', temaInfo.tema_votacion || 'N/A', fullX, secY, fullW, true, 35);
//       }
//       doc.y = secY;
//     }
//     // --- RESUMEN DE ASISTENCIA ---
//     {
//       let secY = doc.y;
//       secY = drawSectionHeader('RESUMEN DE ASISTENCIA', fullX, secY, fullW);
//       const badges = [
//         { label: 'A FAVOR',    value: totales.favor,      bg: '#22c55e' },
//         { label: 'EN CONTRA',  value: totales.contra,     bg: '#dc2626' },
//         { label: 'ABSTENCIÓN', value: totales.abstencion, bg: '#f59e0b' },
//         { label: 'PENDIENTE',  value: totales.pendiente,  bg: '#6b7280' },
//         { label: 'Total',      value: totalVotos,         bg: '#1e40af' },
//       ];
//       doc.rect(fullX, secY, fullW, 28).fill('#ffffff');
//       const badgeW = Math.floor(fullW / badges.length);
//       badges.forEach((badge, i) => {
//         const bx = fullX + i * badgeW;
//         const by = secY + 4;
//         doc.rect(bx + 4, by, badgeW - 8, 12).fill(badge.bg);
//         doc.fontSize(7).font('Helvetica-Bold').fillColor('#fff')
//           .text(badge.label, bx + 4, by + 2, { width: badgeW - 8, align: 'center' });
//         doc.rect(bx + 4, by + 12, badgeW - 8, 12).fill('#ffffff');
//         doc.rect(bx + 4, by + 12, badgeW - 8, 12).stroke('#e0e0e0');
//         doc.fontSize(8).font('Helvetica-Bold').fillColor('#000')
//           .text(String(badge.value), bx + 4, by + 14, { width: badgeW - 8, align: 'center' });
//       });
//       doc.y = secY + 28 + 15;
//     }
//     // ===== DETALLE =====
//     if (esSesion) {
//       generarDetalleSesion(doc, votosConDetalles, drawBackground, getColorSentido);
//     } else {
//       generarDetalleComision(doc, votosConDetalles, drawBackground, getColorSentido);
//     }
//     doc.end();
//     await new Promise((resolve, reject) => {
//       writeStream.on('finish', resolve);
//       writeStream.on('error', reject);
//     });
//     console.log('PDF generado exitosamente en:', outputPath);
//     // ===== WHATSAPP =====
//     let fechaFormateada = "";
//     if (evento.fecha) {
//       fechaFormateada = format(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
//     }
//     let infoComisiones = "";
//     if (!esSesion) {
//       const comisionesUnicas = [...new Set(
//         votosConDetalles
//           .map(v => v.comision_nombre)
//           .filter(nombre => nombre && nombre !== 'Sin comisión')
//       )].sort();
//       if (comisionesUnicas.length > 0) {
//         infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
//       }
//     }
//     const mensajeTexto = (temaInfo 
//       ? `*VOTACION - RESERVA* ${punto.nopunto}\n\n`
//       : `*VOTACION - PUNTO ${punto.nopunto}*\n\n`) +
//       `*Punto:* ${punto.punto || 'N/A'}\n` +
//       (temaInfo ? `*Reserva:* ${temaInfo.tema_votacion || 'N/A'}\n` : '') +
//       `*Evento:* ${evento.tipoevento?.nombre || 'N/A'}\n` +
//       `*Fecha:* ${fechaFormateada}${infoComisiones}\n` +
//       `*Resultados:*\n` +
//       `A favor: ${totales.favor}\n` +
//       `En contra: ${totales.contra}\n` +
//       `Abstencion: ${totales.abstencion}\n` +
//       `Pendiente: ${totales.pendiente}\n\n` +
//       `Total de votos: ${totalVotos}\n\n` +
//       `Adjunto PDF con detalle completo`;
//     if (!fs.existsSync(outputPath)) throw new Error('El archivo PDF no se generó correctamente');
//     const pdfBuffer = fs.readFileSync(outputPath);
//     const base64PDF = pdfBuffer.toString('base64');
//     const params = {
//       token: 'ml56a7d6tn7ha7cc',
//       to: "+525561081154,",
//       filename: fileName,
//       document: base64PDF,
//       caption: mensajeTexto
//     };
//     const whatsappResponse = await axios.post(
//       'https://api.ultramsg.com/instance144598/messages/document',
//       new URLSearchParams(params),
//       {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         timeout: 60000,
//         maxContentLength: Infinity,
//         maxBodyLength: Infinity
//       }
//     );
//     return res.status(200).json({
//       message: "PDF de votación generado y enviado por WhatsApp correctamente",
//       enviado: true,
//       archivo: fileName,
//       totales,
//       whatsappResponse: whatsappResponse.data
//     });
//   } catch (error: any) {
//     console.error("Error completo:", error);
//     if (axios.isAxiosError(error)) {
//       console.error("Error de Axios:", {
//         message: error.message,
//         code: error.code,
//         response: error.response?.data
//       });
//     }
//     return res.status(500).json({ 
//       message: "Error al generar y enviar PDF de votación por WhatsApp",
//       error: error.message,
//       details: axios.isAxiosError(error) ? error.response?.data : undefined
//     });
//   }
// };
const enviarWhatsVotacionPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    try {
        const { body } = req;
        if (!body.idPunto) {
            return res.status(400).json({ msg: "Falta el parámetro requerido: idPunto" });
        }
        const punto = yield puntos_ordens_1.default.findOne({ where: { id: body.idPunto } });
        if (!punto)
            return res.status(404).json({ msg: "Punto no encontrado" });
        const evento = yield agendas_1.default.findOne({
            where: { id: punto.id_evento },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento)
            return res.status(404).json({ msg: "Evento no encontrado" });
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        let whereCondition;
        let temaInfo = null;
        if (body.idReserva) {
            const temavotos = yield temas_puntos_votos_1.default.findOne({ where: { id: body.idReserva } });
            if (!temavotos)
                return res.status(404).json({ msg: "No se encontró el tema de votación" });
            whereCondition = { id_tema_punto_voto: temavotos.id };
            temaInfo = temavotos;
        }
        else {
            whereCondition = { id_punto: body.idPunto };
        }
        // ===== TRAZA COMPLETA =====
        const estudio = yield iniciativas_estudio_1.default.findOne({
            where: { punto_destino_id: body.idPunto },
            attributes: ["id", "status", "type", "punto_origen_id", "punto_destino_id"]
        });
        // type=1 (normal)
        let sesionInfo = null;
        let puntoOrigenInfo = null;
        let iniciativaInfo = null;
        let estudiosInfoNormal = []; // estudios type=1
        // type=2 (expediente)
        let sesionesOrigenInfo = [];
        let iniciativasInfo = [];
        let estudiosInfo = [];
        // compartido
        let dictamenInfo = null;
        const esExpediente = (estudio === null || estudio === void 0 ? void 0 : estudio.type) === "2";
        if (estudio) {
            if (estudio.type === "1") {
                // ===== FLUJO NORMAL =====
                const puntoOrigenId = estudio.punto_origen_id;
                const puntoOrigen = yield puntos_ordens_1.default.findOne({
                    where: { id: puntoOrigenId },
                    include: [{
                            model: agendas_1.default, as: 'evento',
                            attributes: ["id", "fecha", "descripcion"],
                            include: [{ model: tipo_eventos_1.default, as: 'tipoevento', attributes: ["nombre"] }]
                        }]
                });
                if (puntoOrigen) {
                    sesionInfo = {
                        fecha: ((_b = puntoOrigen.evento) === null || _b === void 0 ? void 0 : _b.fecha) ? new Date(puntoOrigen.evento.fecha).toLocaleDateString('es-MX') : 'N/A',
                        descripcion: (_d = (_c = puntoOrigen.evento) === null || _c === void 0 ? void 0 : _c.descripcion) !== null && _d !== void 0 ? _d : 'N/A'
                    };
                    puntoOrigenInfo = {
                        nopunto: (_e = puntoOrigen.nopunto) !== null && _e !== void 0 ? _e : 'N/A',
                        punto: (_f = puntoOrigen.punto) !== null && _f !== void 0 ? _f : 'N/A'
                    };
                }
                const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
                    where: { id_punto: puntoOrigenId },
                    attributes: ["id", "iniciativa", "expediente"]
                });
                if (iniciativa) {
                    iniciativaInfo = {
                        id: iniciativa.id,
                        iniciativa: iniciativa.iniciativa,
                        expediente: iniciativa.expediente
                    };
                }
                // ===== ESTUDIOS TYPE=1 =====
                const estudiosNormalDB = yield iniciativas_estudio_1.default.findAll({
                    where: {
                        punto_origen_id: puntoOrigenId,
                        status: "1",
                        type: "1"
                    },
                    include: [{
                            model: puntos_ordens_1.default, as: "iniciativa",
                            attributes: ["id", "nopunto", "punto"],
                            include: [{
                                    model: agendas_1.default, as: "evento",
                                    attributes: ["id", "fecha", "descripcion"],
                                    include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                                }]
                        }]
                });
                estudiosInfoNormal = yield Promise.all(estudiosNormalDB.map((e) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    const pd = e.iniciativa;
                    const ev = pd === null || pd === void 0 ? void 0 : pd.evento;
                    // Comisiones del estudio
                    const comisionesData = (pd === null || pd === void 0 ? void 0 : pd.id) ? yield getComisionesTurnado(pd.id) : null;
                    return {
                        fecha: (ev === null || ev === void 0 ? void 0 : ev.fecha) ? new Date(ev.fecha).toLocaleDateString('es-MX') : 'N/A',
                        tipo_evento: (_b = (_a = ev === null || ev === void 0 ? void 0 : ev.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) !== null && _b !== void 0 ? _b : 'N/A',
                        numpunto: (_c = pd === null || pd === void 0 ? void 0 : pd.nopunto) !== null && _c !== void 0 ? _c : 'N/A',
                        punto: (_d = pd === null || pd === void 0 ? void 0 : pd.punto) !== null && _d !== void 0 ? _d : 'N/A',
                        comisiones: (_e = comisionesData === null || comisionesData === void 0 ? void 0 : comisionesData.comisiones_turnado) !== null && _e !== void 0 ? _e : 'N/A'
                    };
                })));
                // Dictamen type=1
                const dictamen = yield iniciativas_estudio_1.default.findOne({
                    where: { punto_origen_id: puntoOrigenId, status: "2" },
                    include: [{
                            model: puntos_ordens_1.default, as: "iniciativa",
                            attributes: ["id", "nopunto", "punto"],
                            include: [{
                                    model: agendas_1.default, as: "evento",
                                    attributes: ["id", "fecha", "descripcion"],
                                    include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                                }]
                        }]
                });
                if (dictamen) {
                    const puntoDict = dictamen.iniciativa;
                    const eventoDict = puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.evento;
                    const comisionesData = yield getComisionesTurnado(puntoOrigenId);
                    let autoresString = '';
                    if (puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.id) {
                        const iniciativaDictamen = yield inciativas_puntos_ordens_1.default.findOne({
                            where: { id_punto: puntoDict.id },
                            attributes: ["id"],
                            include: [{
                                    model: iniciativaspresenta_1.default, as: "presentan",
                                    attributes: ["id_tipo_presenta", "id_presenta"],
                                    include: [{ model: proponentes_1.default, as: "tipo_presenta", attributes: ["id", "valor"] }]
                                }]
                        });
                        if (((_g = iniciativaDictamen === null || iniciativaDictamen === void 0 ? void 0 : iniciativaDictamen.presentan) === null || _g === void 0 ? void 0 : _g.length) > 0) {
                            const resultado = yield procesarPresentan(iniciativaDictamen.presentan);
                            autoresString = resultado.proponentesString;
                        }
                    }
                    dictamenInfo = {
                        fecha: (eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.fecha) ? new Date(eventoDict.fecha).toLocaleDateString('es-MX') : 'N/A',
                        tipo_evento: (_j = (_h = eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.tipoevento) === null || _h === void 0 ? void 0 : _h.nombre) !== null && _j !== void 0 ? _j : 'N/A',
                        numpunto: (_k = puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.nopunto) !== null && _k !== void 0 ? _k : 'N/A',
                        punto: (_l = puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.punto) !== null && _l !== void 0 ? _l : 'N/A',
                        comisiones: (_m = comisionesData === null || comisionesData === void 0 ? void 0 : comisionesData.comisiones_turnado) !== null && _m !== void 0 ? _m : 'N/A',
                        autores: autoresString
                    };
                }
            }
            else if (estudio.type === "2") {
                // ===== FLUJO EXPEDIENTE =====
                const expPuntos = yield expedientes_estudio_puntos_1.default.findAll({
                    where: { expediente_id: estudio.punto_origen_id },
                    attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
                });
                const puntosOrigenIds = expPuntos
                    .map((e) => e.punto_origen_sesion_id)
                    .filter(Boolean);
                console.log("PUNTOS ORIGEN IDS:", puntosOrigenIds);
                if (puntosOrigenIds.length > 0) {
                    const puntosOrigen = yield puntos_ordens_1.default.findAll({
                        where: { id: { [sequelize_1.Op.in]: puntosOrigenIds } },
                        include: [{
                                model: agendas_1.default, as: 'evento',
                                attributes: ["id", "fecha", "descripcion"],
                                include: [{ model: tipo_eventos_1.default, as: 'tipoevento', attributes: ["nombre"] }]
                            }]
                    });
                    sesionesOrigenInfo = puntosOrigen.map((po) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        return ({
                            nopunto: (_a = po.nopunto) !== null && _a !== void 0 ? _a : 'N/A',
                            punto: (_b = po.punto) !== null && _b !== void 0 ? _b : 'N/A',
                            fecha: ((_c = po.evento) === null || _c === void 0 ? void 0 : _c.fecha) ? new Date(po.evento.fecha).toLocaleDateString('es-MX') : 'N/A',
                            descripcion: (_e = (_d = po.evento) === null || _d === void 0 ? void 0 : _d.descripcion) !== null && _e !== void 0 ? _e : 'N/A',
                            tipo_evento: (_h = (_g = (_f = po.evento) === null || _f === void 0 ? void 0 : _f.tipoevento) === null || _g === void 0 ? void 0 : _g.nombre) !== null && _h !== void 0 ? _h : 'N/A'
                        });
                    });
                    const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
                        where: { id_punto: { [sequelize_1.Op.in]: puntosOrigenIds } },
                        attributes: ["id", "iniciativa", "expediente", "id_punto"]
                    });
                    const iniciativasPorPunto = new Map(iniciativas.map((ini) => [String(ini.id_punto), ini]));
                    iniciativasInfo = puntosOrigenIds.map((pid) => {
                        const ini = iniciativasPorPunto.get(String(pid));
                        return ini ? {
                            id: ini.id,
                            iniciativa: ini.iniciativa,
                            expediente: ini.expediente,
                            id_punto: ini.id_punto
                        } : null;
                    });
                    const todosLosExpedientes = yield expedientes_estudio_puntos_1.default.findAll({
                        where: { punto_origen_sesion_id: { [sequelize_1.Op.in]: puntosOrigenIds } },
                        attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
                    });
                    const todosExpedienteIds = [
                        ...new Set(todosLosExpedientes.map((e) => e.expediente_id).filter(Boolean))
                    ];
                    console.log("TODOS EXPEDIENTE IDS:", todosExpedienteIds);
                    if (todosExpedienteIds.length > 0) {
                        // ===== ESTUDIOS TYPE=2 =====
                        const estudiosDB = yield iniciativas_estudio_1.default.findAll({
                            where: { punto_origen_id: { [sequelize_1.Op.in]: todosExpedienteIds }, status: "1", type: "2" },
                            include: [{
                                    model: puntos_ordens_1.default, as: "iniciativa",
                                    attributes: ["id", "nopunto", "punto"],
                                    include: [{
                                            model: agendas_1.default, as: "evento",
                                            attributes: ["id", "fecha", "descripcion"],
                                            include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                                        }]
                                }]
                        });
                        estudiosInfo = yield Promise.all(estudiosDB.map((e) => __awaiter(void 0, void 0, void 0, function* () {
                            var _a, _b, _c, _d;
                            const pd = e.iniciativa;
                            const ev = pd === null || pd === void 0 ? void 0 : pd.evento;
                            // Comisiones de todos los puntos origen del expediente
                            const comisionesPromises = puntosOrigenIds.map((pid) => getComisionesTurnado(pid));
                            const comisionesResults = yield Promise.all(comisionesPromises);
                            const todasComisiones = [
                                ...new Set(comisionesResults
                                    .filter((r) => r === null || r === void 0 ? void 0 : r.comisiones_turnado)
                                    .flatMap((r) => r.comisiones_turnado.split(',').map((c) => c.trim()))
                                    .filter(Boolean))
                            ].join(', ');
                            return {
                                fecha: (ev === null || ev === void 0 ? void 0 : ev.fecha) ? new Date(ev.fecha).toLocaleDateString('es-MX') : 'N/A',
                                tipo_evento: (_b = (_a = ev === null || ev === void 0 ? void 0 : ev.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) !== null && _b !== void 0 ? _b : 'N/A',
                                numpunto: (_c = pd === null || pd === void 0 ? void 0 : pd.nopunto) !== null && _c !== void 0 ? _c : 'N/A',
                                punto: (_d = pd === null || pd === void 0 ? void 0 : pd.punto) !== null && _d !== void 0 ? _d : 'N/A',
                                comisiones: todasComisiones || 'N/A'
                            };
                        })));
                        // Dictamen type=2
                        const dictamen = yield iniciativas_estudio_1.default.findOne({
                            where: { punto_origen_id: { [sequelize_1.Op.in]: todosExpedienteIds }, status: "2", type: "2" },
                            include: [{
                                    model: puntos_ordens_1.default, as: "iniciativa",
                                    attributes: ["id", "nopunto", "punto"],
                                    include: [{
                                            model: agendas_1.default, as: "evento",
                                            attributes: ["id", "fecha", "descripcion"],
                                            include: [{ model: tipo_eventos_1.default, as: "tipoevento", attributes: ["nombre"] }]
                                        }]
                                }]
                        });
                        if (dictamen) {
                            const puntoDict = dictamen.iniciativa;
                            const eventoDict = puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.evento;
                            const comisionesPromises = puntosOrigenIds.map((pid) => getComisionesTurnado(pid));
                            const comisionesResults = yield Promise.all(comisionesPromises);
                            const todasComisiones = [
                                ...new Set(comisionesResults
                                    .filter((r) => r === null || r === void 0 ? void 0 : r.comisiones_turnado)
                                    .flatMap((r) => r.comisiones_turnado.split(',').map((c) => c.trim()))
                                    .filter(Boolean))
                            ].join(', ');
                            let autoresString = '';
                            if (puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.id) {
                                const iniciativaDictamen = yield inciativas_puntos_ordens_1.default.findOne({
                                    where: { id_punto: puntoDict.id },
                                    attributes: ["id"],
                                    include: [{
                                            model: iniciativaspresenta_1.default, as: "presentan",
                                            attributes: ["id_tipo_presenta", "id_presenta"],
                                            include: [{ model: proponentes_1.default, as: "tipo_presenta", attributes: ["id", "valor"] }]
                                        }]
                                });
                                if (((_o = iniciativaDictamen === null || iniciativaDictamen === void 0 ? void 0 : iniciativaDictamen.presentan) === null || _o === void 0 ? void 0 : _o.length) > 0) {
                                    const resultado = yield procesarPresentan(iniciativaDictamen.presentan);
                                    autoresString = resultado.proponentesString;
                                }
                            }
                            dictamenInfo = {
                                fecha: (eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.fecha) ? new Date(eventoDict.fecha).toLocaleDateString('es-MX') : 'N/A',
                                tipo_evento: (_q = (_p = eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.tipoevento) === null || _p === void 0 ? void 0 : _p.nombre) !== null && _q !== void 0 ? _q : 'N/A',
                                numpunto: (_r = puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.nopunto) !== null && _r !== void 0 ? _r : 'N/A',
                                punto: (_s = puntoDict === null || puntoDict === void 0 ? void 0 : puntoDict.punto) !== null && _s !== void 0 ? _s : 'N/A',
                                comisiones: todasComisiones || 'N/A',
                                autores: autoresString
                            };
                        }
                    }
                }
            }
        }
        // ===== VOTOS =====
        const votosRaw = yield votos_punto_1.default.findAll({ where: whereCondition, raw: true });
        if (votosRaw.length === 0)
            return res.status(404).json({ msg: "No hay votos registrados" });
        const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (!esSesion) {
            const comisionIds = votosRaw.map(v => v.id_comision_dip).filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = votosRaw.map(v => v.id_cargo_dip).filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const getSentidoTexto = (sentido) => {
            switch (sentido) {
                case 0: return "PENDIENTE";
                case 1: return "A FAVOR";
                case 2: return "ABSTENCIÓN";
                case 3: return "EN CONTRA";
                default: return "PENDIENTE";
            }
        };
        const getColorSentido = (sentido) => {
            switch (sentido) {
                case 1: return '#22c55e';
                case 3: return '#dc2626';
                case 2: return '#f59e0b';
                case 0: return '#6b7280';
                default: return '#6b7280';
            }
        };
        const votosConDetalles = votosRaw.map((voto) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(voto.id_diputado);
            const partido = partidosMap.get(voto.id_partido);
            const comision = comisionesMap.get(voto.id_comision_dip);
            const cargo = cargosMap.get(voto.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : "Sin nombre";
            return Object.assign(Object.assign({}, voto), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido", comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || null, comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999, sentidoTexto: getSentidoTexto(voto.sentido), sentidoNumerico: voto.sentido, mensaje: voto.mensaje });
        });
        const totales = {
            favor: votosConDetalles.filter(v => v.sentidoNumerico === 1).length,
            contra: votosConDetalles.filter(v => v.sentidoNumerico === 3).length,
            abstencion: votosConDetalles.filter(v => v.sentidoNumerico === 2).length,
            pendiente: votosConDetalles.filter(v => v.sentidoNumerico === 0).length,
        };
        const totalVotos = votosConDetalles.length;
        // ===== CREAR PDF =====
        const doc = new pdfkit_1.default({
            size: 'LETTER',
            margins: { top: 0, bottom: 30, left: 0, right: 0 },
            bufferPages: true
        });
        const fileName = `votacion-punto-${body.idPunto}-${Date.now()}.pdf`;
        const outputPath = path_1.default.join(__dirname, '../../storage/pdfs', fileName);
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        const writeStream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(writeStream);
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
        const drawBackground = () => {
            doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });
            doc.y = 106;
        };
        drawBackground();
        const checkPageBreak = (y, neededHeight = 40) => {
            if (y + neededHeight > doc.page.height - 80) {
                doc.addPage();
                drawBackground();
                return 106;
            }
            return y;
        };
        const drawSectionHeader = (label, x, y, w) => {
            y = checkPageBreak(y, 30);
            doc.rect(x, y, w, 22).fill('#96134b');
            doc.save();
            doc.translate(x - 8, y + 11).rotate(45);
            doc.rect(-7, -7, 14, 14).fill('#96134b');
            doc.restore();
            doc.save();
            doc.translate(x - 8, y + 11).rotate(45);
            doc.rect(-5, -5, 10, 10).fill('#c0395e');
            doc.restore();
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
                .text(label, x + 10, y + 6, { width: w - 20 });
            return y + 22;
        };
        const drawInfoRow = (label, value, x, y, w, isEven, minRowH = 18) => {
            const labelWidth = 70;
            const valueWidth = w - 110;
            const labelHeight = doc.heightOfString(label, { width: labelWidth, fontSize: 9 });
            const valueHeight = doc.heightOfString(value || '', { width: valueWidth, fontSize: 9 });
            const rowH = Math.max(minRowH, labelHeight + 10, valueHeight + 10);
            y = checkPageBreak(y, rowH);
            doc.rect(x, y, w, rowH).fill(isEven ? '#ffffff' : '#f5f5f5');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text(label, x + 10, y + 5, { width: labelWidth, align: 'right' });
            doc.fontSize(9).font('Helvetica').fillColor('#000')
                .text(value || '', x + 100, y + 5, { width: valueWidth });
            return y + rowH;
        };
        // ===== LAYOUT =====
        const vinoX = 30;
        const vinoY = 106;
        const vinoW = 150;
        const rightX = vinoX + vinoW + 20;
        const rightW = doc.page.width - rightX - 30;
        const fullX = 30;
        const fullW = doc.page.width - 60;
        let rightY = vinoY;
        // ===== BLOQUE DERECHO =====
        rightY = drawSectionHeader('INFORMACIÓN DEL EVENTO', rightX, rightY, rightW);
        [
            { label: 'Tipo:', value: ((_t = evento.tipoevento) === null || _t === void 0 ? void 0 : _t.nombre) || 'N/A' },
            { label: 'Sede:', value: ((_u = evento.sede) === null || _u === void 0 ? void 0 : _u.sede) || 'N/A' },
            { label: 'Fecha:', value: evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A' },
        ].forEach((row, i) => {
            rightY = drawInfoRow(row.label, row.value, rightX, rightY, rightW, i % 2 === 0);
        });
        if (!esExpediente && sesionInfo) {
            rightY = drawSectionHeader('SESIÓN DE ORIGEN', rightX, rightY, rightW);
            rightY = drawInfoRow('Fecha:', sesionInfo.fecha, rightX, rightY, rightW, true);
            rightY = drawInfoRow('Descripción:', sesionInfo.descripcion, rightX, rightY, rightW, false);
        }
        if (!esExpediente && puntoOrigenInfo) {
            rightY = drawSectionHeader('PUNTO DE ORIGEN', rightX, rightY, rightW);
            rightY = drawInfoRow('Número:', String(puntoOrigenInfo.nopunto), rightX, rightY, rightW, true);
            rightY = drawInfoRow('Punto:', puntoOrigenInfo.punto, rightX, rightY, rightW, false);
        }
        // ===== BLOQUE VINO =====
        const vinoH = rightY - vinoY;
        doc.rect(vinoX, vinoY, vinoW, vinoH).fill('#96134b');
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
            .text('REGISTRO DE', vinoX + 10, vinoY + 40, { width: vinoW - 20, align: 'left' });
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
            .text('VOTACIÓN', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica').fillColor('#fff')
            .text('Legislatura del Estado de México', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
        // ===== SECCIONES ANCHO COMPLETO =====
        doc.y = rightY + 10;
        // --- TYPE=1: iniciativa ---
        if (!esExpediente && iniciativaInfo) {
            let secY = doc.y;
            secY = drawSectionHeader('INICIATIVA', fullX, secY, fullW);
            secY = drawInfoRow('Descripción:', (_v = iniciativaInfo.iniciativa) !== null && _v !== void 0 ? _v : 'N/A', fullX, secY, fullW, true);
            doc.y = secY;
        }
        // --- TYPE=1: estudios en comisión ---
        if (!esExpediente && estudiosInfoNormal.length > 0) {
            estudiosInfoNormal.forEach((est, idx) => {
                let secY = doc.y;
                let ri = 0;
                secY = drawSectionHeader(estudiosInfoNormal.length > 1 ? `ESTUDIO EN COMISIÓN (${idx + 1})` : 'ESTUDIO EN COMISIÓN', fullX, secY, fullW);
                secY = drawInfoRow('Tipo evento:', est.tipo_evento, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Comisiones:', est.comisiones, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Fecha:', est.fecha, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Número:', est.numpunto, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Punto:', est.punto, fullX, secY, fullW, ri++ % 2 === 0);
                doc.y = secY;
            });
        }
        // --- TYPE=2: EXPEDIENTE ---
        if (esExpediente && sesionesOrigenInfo.length > 0) {
            let secY = doc.y;
            secY = drawSectionHeader('EXPEDIENTE', fullX, secY, fullW);
            sesionesOrigenInfo.forEach((sesion, idx) => {
                var _a;
                const iniciativa = iniciativasInfo[idx];
                secY = checkPageBreak(secY, 80);
                doc.rect(fullX, secY, fullW, 18).fill('#7a7a7a');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
                    .text(`${sesion.tipo_evento || ''}  ${sesion.fecha || ''}`, fullX + 10, secY + 4, { width: fullW - 20, align: 'center' });
                secY += 18;
                let ri = 0;
                secY = drawInfoRow('Sesión:', sesion.descripcion, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Número:', String(sesion.nopunto), fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Punto:', sesion.punto, fullX, secY, fullW, ri++ % 2 === 0);
                if (iniciativa) {
                    secY = drawInfoRow('Iniciativa:', (_a = iniciativa.iniciativa) !== null && _a !== void 0 ? _a : 'N/A', fullX, secY, fullW, ri++ % 2 === 0);
                }
                if (idx < sesionesOrigenInfo.length - 1) {
                    doc.moveTo(fullX + 10, secY + 4)
                        .lineTo(fullX + fullW - 10, secY + 4)
                        .stroke('#e0e0e0');
                    secY += 10;
                }
            });
            doc.y = secY + 8;
        }
        // --- TYPE=2: estudios en comisión ---
        if (esExpediente && estudiosInfo.length > 0) {
            estudiosInfo.forEach((est, idx) => {
                let secY = doc.y;
                let ri = 0;
                secY = drawSectionHeader(estudiosInfo.length > 1 ? `ESTUDIO EN COMISIÓN (${idx + 1})` : 'ESTUDIO EN COMISIÓN', fullX, secY, fullW);
                secY = drawInfoRow('Tipo evento:', est.tipo_evento, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Comisiones:', est.comisiones, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Fecha:', est.fecha, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Número:', est.numpunto, fullX, secY, fullW, ri++ % 2 === 0);
                secY = drawInfoRow('Punto:', est.punto, fullX, secY, fullW, ri++ % 2 === 0);
                doc.y = secY;
            });
        }
        // --- DICTAMEN (aplica type=1 y type=2) ---
        if (dictamenInfo) {
            let secY = doc.y;
            let ri = 0;
            secY = drawSectionHeader('DICTAMEN', fullX, secY, fullW);
            secY = drawInfoRow('Tipo evento:', dictamenInfo.tipo_evento, fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Comisiones:', dictamenInfo.comisiones, fullX, secY, fullW, ri++ % 2 === 0);
            if (dictamenInfo.autores) {
                secY = drawInfoRow('Autores:', dictamenInfo.autores, fullX, secY, fullW, ri++ % 2 === 0);
            }
            secY = drawInfoRow('Fecha:', dictamenInfo.fecha, fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Número:', String(dictamenInfo.numpunto), fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Punto:', dictamenInfo.punto, fullX, secY, fullW, ri++ % 2 === 0);
            doc.y = secY;
        }
        // --- INFORMACIÓN DEL PUNTO ---
        {
            let secY = doc.y;
            let ri = 0;
            secY = drawSectionHeader('INFORMACIÓN DEL PUNTO', fullX, secY, fullW);
            secY = drawInfoRow('Tipo:', ((_w = evento.tipoevento) === null || _w === void 0 ? void 0 : _w.nombre) || 'N/A', fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Sede:', ((_x = evento.sede) === null || _x === void 0 ? void 0 : _x.sede) || 'N/A', fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Fecha:', evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A', fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Número:', String(punto.nopunto || 'N/A'), fullX, secY, fullW, ri++ % 2 === 0);
            secY = drawInfoRow('Descripción:', punto.punto || 'N/A', fullX, secY, fullW, ri++ % 2 === 0);
            if (temaInfo) {
                secY = drawInfoRow('Reserva:', temaInfo.tema_votacion || 'N/A', fullX, secY, fullW, ri++ % 2 === 0);
            }
            doc.y = secY;
        }
        // --- RESUMEN DE VOTACIÓN ---
        {
            let secY = doc.y;
            secY = drawSectionHeader('RESUMEN DE VOTACIÓN', fullX, secY, fullW);
            const badges = [
                { label: 'A FAVOR', value: totales.favor, bg: '#22c55e' },
                { label: 'EN CONTRA', value: totales.contra, bg: '#dc2626' },
                { label: 'ABSTENCIÓN', value: totales.abstencion, bg: '#f59e0b' },
                { label: 'PENDIENTE', value: totales.pendiente, bg: '#6b7280' },
                { label: 'Total', value: totalVotos, bg: '#1e40af' },
            ];
            secY = checkPageBreak(secY, 40);
            doc.rect(fullX, secY, fullW, 28).fill('#ffffff');
            const badgeW = Math.floor(fullW / badges.length);
            badges.forEach((badge, i) => {
                const bx = fullX + i * badgeW;
                const by = secY + 4;
                doc.rect(bx + 4, by, badgeW - 8, 12).fill(badge.bg);
                doc.fontSize(7).font('Helvetica-Bold').fillColor('#fff')
                    .text(badge.label, bx + 4, by + 2, { width: badgeW - 8, align: 'center' });
                doc.rect(bx + 4, by + 12, badgeW - 8, 12).fill('#ffffff');
                doc.rect(bx + 4, by + 12, badgeW - 8, 12).stroke('#e0e0e0');
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#000')
                    .text(String(badge.value), bx + 4, by + 14, { width: badgeW - 8, align: 'center' });
            });
            doc.y = secY + 28 + 15;
        }
        if (esSesion) {
            generarDetalleSesion(doc, votosConDetalles, drawBackground, getColorSentido);
        }
        else {
            generarDetalleComision(doc, votosConDetalles, drawBackground, getColorSentido);
        }
        doc.end();
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('PDF generado exitosamente en:', outputPath);
        if (!fs_1.default.existsSync(outputPath)) {
            throw new Error('El archivo PDF no se generó correctamente');
        }
        let fechaFormateada = "";
        if (evento.fecha) {
            fechaFormateada = (0, date_fns_1.format)(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
        }
        let infoComisiones = "";
        if (!esSesion) {
            const comisionesUnicas = [...new Set(votosConDetalles.map(v => v.comision_nombre).filter(nombre => nombre && nombre !== 'Sin comisión'))].sort();
            if (comisionesUnicas.length > 0) {
                infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
            }
        }
        const cortarTexto = (texto, max) => texto && texto.length > max ? texto.substring(0, max - 3) + '...' : (texto || '');
        const mensajeTexto = (temaInfo
            ? `*VOTACION - RESERVA* ${punto.nopunto}\n\n`
            : `*VOTACION - PUNTO ${punto.nopunto}*\n\n`) +
            `*Punto:* ${cortarTexto(punto.punto || 'N/A', 300)}\n` +
            (temaInfo ? `*Reserva:* ${temaInfo.tema_votacion || 'N/A'}\n` : '') +
            `*Evento:* ${((_y = evento.tipoevento) === null || _y === void 0 ? void 0 : _y.nombre) || 'N/A'}\n` +
            `*Fecha:* ${fechaFormateada}${infoComisiones}\n` +
            `*Resultados:*\n` +
            `A favor: ${totales.favor}\n` +
            `En contra: ${totales.contra}\n` +
            `Abstencion: ${totales.abstencion}\n` +
            `Pendiente: ${totales.pendiente}\n\n` +
            `Total de votos: ${totalVotos}\n\n` +
            `Adjunto PDF con detalle completo`;
        const pdfBuffer = fs_1.default.readFileSync(outputPath);
        const base64PDF = pdfBuffer.toString('base64');
        console.log('Tamaño del PDF:', pdfBuffer.length, 'bytes');
        const formData = new URLSearchParams();
        formData.append('token', 'ml56a7d6tn7ha7cc');
        formData.append('to', '+527222035605, +527224986377, +527151605569, +527222285798, +527226303741');
        // formData.append('to', '+525561081154');
        formData.append('filename', fileName);
        formData.append('document', base64PDF);
        formData.append('caption', mensajeTexto);
        const whatsappResponse = yield axios_1.default.post('https://api.ultramsg.com/instance144598/messages/document', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('Respuesta WhatsApp:', whatsappResponse.data);
        return res.status(200).json({
            message: "PDF de votación generado y enviado por WhatsApp correctamente",
            enviado: true,
            archivo: fileName,
            totales,
            whatsappResponse: whatsappResponse.data
        });
    }
    catch (error) {
        console.error("Error completo:", error);
        if (axios_1.default.isAxiosError(error)) {
            console.error("Error de Axios:", {
                message: error.message,
                code: error.code,
                response: (_z = error.response) === null || _z === void 0 ? void 0 : _z.data
            });
        }
        return res.status(500).json({
            message: "Error al generar y enviar PDF de votación por WhatsApp",
            error: error.message,
            details: axios_1.default.isAxiosError(error) ? (_0 = error.response) === null || _0 === void 0 ? void 0 : _0.data : undefined
        });
    }
});
exports.enviarWhatsVotacionPDF = enviarWhatsVotacionPDF;
const generarPDFAsistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const asistenciasRaw = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            raw: true,
        });
        if (asistenciasRaw.length === 0) {
            return res.status(404).json({ msg: "No hay asistencias registradas para este evento" });
        }
        const diputadoIds = asistenciasRaw.map(a => a.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = asistenciasRaw.map(a => a.partido_dip).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (!esSesion) {
            const comisionIds = asistenciasRaw.map(a => a.comision_dip_id).filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = asistenciasRaw.map(a => a.id_cargo_dip).filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const getAsistenciaTexto = (sentido) => {
            switch (sentido) {
                case 1: return "ASISTENCIA";
                case 2: return "ASISTENCIA ZOOM";
                case 0: return "PENDIENTE";
                default: return "PENDIENTE";
            }
        };
        const asistenciasConDetalles = asistenciasRaw.map((asistencia) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(asistencia.id_diputado);
            const partido = partidosMap.get(asistencia.partido_dip);
            const comision = comisionesMap.get(asistencia.comision_dip_id);
            const cargo = cargosMap.get(asistencia.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : "Sin nombre";
            return Object.assign(Object.assign({}, asistencia), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido", comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || null, comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo_nombre: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999, asistenciaTexto: getAsistenciaTexto(asistencia.sentido_voto), asistenciaNumerico: asistencia.sentido_voto });
        });
        const totales = {
            asistencia: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 1).length,
            asistenciaZoom: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 2).length,
            pendiente: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 0).length,
        };
        const totalDiputados = asistenciasConDetalles.length;
        // ===== 👇 CÁLCULO DE QUÓRUM =====
        const tienetipoReunion = evento.tipo_reunion === 1;
        const asistentesGeneral = totales.asistencia + totales.asistenciaZoom;
        const quorumGeneralRequerido = Math.floor(totalDiputados / 2) + 1;
        const quorumPorComision = new Map();
        if (!esSesion && tienetipoReunion) {
            asistenciasConDetalles.forEach((a) => {
                if (!a.comision_nombre)
                    return;
                if (!quorumPorComision.has(a.comision_nombre)) {
                    quorumPorComision.set(a.comision_nombre, {
                        nombre: a.comision_nombre,
                        total: 0,
                        asistentes: 0,
                        requerido: 0,
                        tieneQuorum: false,
                        importancia: a.comision_importancia
                    });
                }
                const comData = quorumPorComision.get(a.comision_nombre);
                comData.total += 1;
                if (a.asistenciaNumerico === 1 || a.asistenciaNumerico === 2) {
                    comData.asistentes += 1;
                }
            });
            quorumPorComision.forEach((comData) => {
                comData.requerido = Math.floor(comData.total / 2) + 1;
                comData.tieneQuorum = comData.asistentes >= comData.requerido;
            });
        }
        // 👇 Quórum general = true solo si TODAS las comisiones tienen quórum
        const todasConQuorum = quorumPorComision.size > 0 &&
            Array.from(quorumPorComision.values()).every(c => c.tieneQuorum);
        const diputadosAsociadosRaw = yield diputados_asociados_1.default.findAll({
            where: { id_agenda: evento.id },
            raw: true,
        });
        let diputadosAsociadosConDetalles = [];
        if (diputadosAsociadosRaw.length > 0) {
            const asociadosIds = diputadosAsociadosRaw.map((d) => d.id_diputado).filter(Boolean);
            const asociadosPartidoIds = diputadosAsociadosRaw.map((d) => d.partido_dip).filter(Boolean);
            const diputadosAsoc = yield diputado_1.default.findAll({
                where: { id: asociadosIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const diputadosAsocMap = new Map(diputadosAsoc.map((d) => [d.id, d]));
            const partidosAsoc = yield partidos_1.default.findAll({
                where: { id: asociadosPartidoIds },
                attributes: ["id", "siglas"],
                raw: true,
            });
            const partidosAsocMap = new Map(partidosAsoc.map((p) => [p.id, p]));
            diputadosAsociadosConDetalles = diputadosAsociadosRaw.map((da) => {
                var _a, _b, _c;
                const dip = diputadosAsocMap.get(da.id_diputado);
                const partido = partidosAsocMap.get(da.partido_dip);
                return {
                    nombre: dip
                        ? `${(_a = dip.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = dip.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                        : "Sin nombre",
                    partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido",
                };
            });
        }
        // ===== CREAR PDF =====
        const doc = new pdfkit_1.default({
            size: 'LETTER',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            bufferPages: true
        });
        const fileName = `asistencia-evento-${id}-${Date.now()}.pdf`;
        const outputPath = path_1.default.join(__dirname, '../../storage/pdfs', fileName);
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const writeStream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(writeStream);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
        const drawBackground = () => {
            doc.image(bgPath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.y = 106;
        };
        drawBackground();
        // ===== ENCABEZADO =====
        doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
        doc.moveDown(1);
        // ===== INFORMACIÓN DEL EVENTO =====
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL EVENTO');
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text('Tipo: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(((_b = evento.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) || 'N/A');
        doc.fontSize(11).font('Helvetica-Bold').text('Sede: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(((_c = evento.sede) === null || _c === void 0 ? void 0 : _c.sede) || 'N/A');
        doc.fontSize(11).font('Helvetica-Bold').text('Fecha: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A');
        doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(evento.descripcion || 'N/A', { width: 500, align: "justify" });
        // ===== 👇 QUÓRUM GENERAL =====
        if (!esSesion && tienetipoReunion) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Quórum general: ', { continued: true });
            doc.fontSize(11).font('Helvetica')
                .text(`${asistentesGeneral}/${totalDiputados} — requerido: ${quorumGeneralRequerido}   `, { continued: true });
            doc.fontSize(11).font('Helvetica-Bold')
                .fillColor(todasConQuorum ? '#22c55e' : '#dc2626')
                .text(todasConQuorum ? 'CON QUÓRUM' : 'SIN QUÓRUM');
            doc.fillColor('#000');
        }
        doc.moveDown(1);
        // ===== RESUMEN DE ASISTENCIA =====
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE ASISTENCIA');
        doc.moveDown(0.3);
        const tableTop = doc.y;
        const colWidths = [120, 120, 120, 100];
        const rowHeight = 25;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
        doc.fillColor('#fff').text('ASISTENCIA', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });
        doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#3b82f6', '#000');
        doc.fillColor('#fff').text('ASISTENCIA ZOOM', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });
        doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
        doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
        doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });
        const valuesTop = tableTop + rowHeight;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.rect(50, valuesTop, colWidths[0], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.asistencia.toString(), 55, valuesTop + 7, { width: colWidths[0] - 10, align: 'center' });
        doc.rect(50 + colWidths[0], valuesTop, colWidths[1], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.asistenciaZoom.toString(), 50 + colWidths[0] + 5, valuesTop + 7, { width: colWidths[1] - 10, align: 'center' });
        doc.rect(50 + colWidths[0] + colWidths[1], valuesTop, colWidths[2], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totales.pendiente.toString(), 50 + colWidths[0] + colWidths[1] + 5, valuesTop + 7, { width: colWidths[2] - 10, align: 'center' });
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], valuesTop, colWidths[3], rowHeight).fillAndStroke('#fff', '#000');
        doc.fillColor('#000').text(totalDiputados.toString(), 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, valuesTop + 7, { width: colWidths[3] - 10, align: 'center' });
        doc.moveDown(2);
        doc.x = doc.page.margins.left;
        // ===== DETALLE =====
        if (esSesion) {
            generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        else {
            generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground, tienetipoReunion ? quorumPorComision : new Map(), diputadosAsociadosConDetalles);
        }
        doc.end();
        yield new Promise((resolve) => setTimeout(resolve, 100));
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).font('Helvetica').fillColor('#666');
            doc.text(`Página ${i + 1} de ${range.count} | Generado: ${new Date().toLocaleString('es-MX')}`, 50, doc.page.height - 30, { align: 'center', width: doc.page.width - 100 });
        }
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }
    catch (error) {
        console.error("Error al generar PDF de asistencia:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Error al generar PDF de asistencia",
                error: error.message
            });
        }
    }
});
exports.generarPDFAsistencia = generarPDFAsistencia;
function generarDetalleSesionAsistencia(doc, asistencias, drawBackground) {
    // Título principal - misma barra vino que comisión
    const titY = doc.y;
    doc.rect(30, titY, doc.page.width - 60, 22).fill('#96134b');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
        .text('DETALLE DE ASISTENCIA', 30, titY + 5, { width: doc.page.width - 60, align: 'center' });
    doc.y = titY + 30;
    // Ordenar alfabéticamente
    const asistenciasOrdenadas = [...asistencias].sort((a, b) => a.diputado.localeCompare(b.diputado, 'es'));
    // Encabezado de columnas - mismo estilo gris con texto vino
    const hY = doc.y;
    const colX = { no: 30, diputado: 58, partido: 390, asistencia: 455 };
    const tableW = doc.page.width - 60;
    doc.rect(30, hY, tableW, 18).fill('#d4d4d4');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
    doc.text('No.', colX.no + 2, hY + 5, { width: 25 });
    doc.text('DIPUTADO', colX.diputado + 2, hY + 5, { width: 325 });
    doc.text('PARTIDO', colX.partido + 2, hY + 5, { width: 60 });
    doc.text('ASISTENCIA', colX.asistencia + 2, hY + 5, { width: 90 });
    let currentY = hY + 18;
    asistenciasOrdenadas.forEach((asist, index) => {
        if (currentY > 700) {
            doc.addPage();
            drawBackground();
            currentY = 106;
            // Re-título en nueva página
            const rY = currentY;
            doc.rect(30, rY, doc.page.width - 60, 22).fill('#96134b');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
                .text('DETALLE DE ASISTENCIA', 30, rY + 5, { width: doc.page.width - 60, align: 'center' });
            currentY = rY + 30;
            // Re-encabezado columnas
            doc.rect(30, currentY, tableW, 18).fill('#d4d4d4');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
            doc.text('No.', colX.no + 2, currentY + 5, { width: 25 });
            doc.text('DIPUTADO', colX.diputado + 2, currentY + 5, { width: 325 });
            doc.text('PARTIDO', colX.partido + 2, currentY + 5, { width: 60 });
            doc.text('ASISTENCIA', colX.asistencia + 2, currentY + 5, { width: 90 });
            currentY += 18;
        }
        // Fila alternada blanco/gris muy claro
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
        doc.rect(30, currentY, tableW, 16).fill(bgColor);
        // Borde inferior suave
        doc.moveTo(30, currentY + 16).lineTo(30 + tableW, currentY + 16)
            .stroke('#e0e0e0');
        doc.fontSize(8).font('Helvetica').fillColor('#000');
        doc.text(`${index + 1}`, colX.no + 2, currentY + 4, { width: 25 });
        doc.text(asist.diputado, colX.diputado + 2, currentY + 4, { width: 325, ellipsis: true });
        doc.text(asist.partido, colX.partido + 2, currentY + 4, { width: 60, ellipsis: true });
        const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(colorAsistencia);
        doc.text(asist.asistenciaTexto, colX.asistencia + 2, currentY + 4, { width: 90, ellipsis: true });
        currentY += 16;
    });
    doc.y = currentY + 10;
}
// function generarDetalleComisionAsistencia(
//   doc: any, 
//   asistencias: any[], 
//   drawBackground: () => void,
//   quorumPorComision: Map<string, {
//     nombre: string;
//     total: number;
//     asistentes: number;
//     requerido: number;
//     tieneQuorum: boolean;
//     importancia: number;
//   }>
// ) {
//   // Título de sección igual al PDF
//   doc.rect(50, doc.y, 505, 18).fillAndStroke('#96134b', '#96134b');
//   doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
//     .text('DETALLE DE ASISTENCIA POR COMISIÓN', 55, doc.y - 14, { align: 'center', width: 495 });
//   doc.fillColor('#000');
//   doc.moveDown(0.8);
//   const asistenciasPorComision = asistencias.reduce((grupos, asist) => {
//     const comision = asist.comision_nombre || 'Sin comisión';
//     if (!grupos[comision]) {
//       grupos[comision] = {
//         nombre: comision,
//         importancia: asist.comision_importancia,
//         asistencias: []
//       };
//     }
//     grupos[comision].asistencias.push(asist);
//     return grupos;
//   }, {} as Record<string, any>);
//   const comisionesOrdenadas = Object.values(asistenciasPorComision).sort((a: any, b: any) => 
//     a.importancia - b.importancia
//   );
//   comisionesOrdenadas.forEach((comision: any) => {
//     if (doc.y > 650) {
//       doc.addPage();
//       drawBackground();
//       doc.y = 106;
//       // Re-dibujar título de sección en nueva página
//       doc.rect(50, doc.y, 505, 18).fillAndStroke('#96134b', '#96134b');
//       doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
//         .text('DETALLE DE ASISTENCIA POR COMISIÓN', 55, doc.y - 14, { align: 'center', width: 495 });
//       doc.fillColor('#000');
//       doc.moveDown(0.8);
//     }
//     // 👇 Nombre de la comisión como título de sección (estilo del PDF)
//     const quorum = quorumPorComision.get(comision.nombre);
//     const comisionTitleY = doc.y;
//     doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
//       .text(comision.nombre.toUpperCase(), 50, comisionTitleY, { continued: !!quorum });
//     if (quorum) {
//       doc.fontSize(8).font('Helvetica').fillColor('#000')
//         .text(`  (${quorum.asistentes}/${quorum.total} — req: ${quorum.requerido})  `, { continued: true });
//       doc.fontSize(8).font('Helvetica-Bold')
//         .fillColor(quorum.tieneQuorum ? '#22c55e' : '#dc2626')
//         .text(quorum.tieneQuorum ? 'CON QUÓRUM' : 'SIN QUÓRUM');
//       doc.fillColor('#000');
//     }
//     doc.moveDown(0.3);
//     const asistenciasOrdenadas = [...comision.asistencias].sort((a, b) => a.nivel_cargo - b.nivel_cargo);
//     const startY = doc.y;
//     // Columnas igual al PDF: No. | Diputado | Cargo | Partido | Asistencia
//     const colX = { no: 50, diputado: 75, cargo: 310, partido: 415, asistencia: 465 };
//     // Encabezado de tabla - color vino igual al PDF
//     doc.rect(colX.no, startY, 505, 18).fillAndStroke('#96134b', '#96134b');
//     doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
//     doc.text('No.', colX.no + 3, startY + 5, { width: 20 });
//     doc.text('DIPUTADO', colX.diputado + 3, startY + 5, { width: 225 });
//     doc.text('CARGO', colX.cargo + 3, startY + 5, { width: 95 });
//     doc.text('PARTIDO', colX.partido + 3, startY + 5, { width: 45 });
//     doc.text('ASISTENCIA', colX.asistencia + 3, startY + 5, { width: 85 });
//     let currentY = startY + 18;
//     asistenciasOrdenadas.forEach((asist, index) => {
//       if (currentY > 700) {
//         doc.addPage();
//         drawBackground();
//         currentY = 106;
//         // Nombre comisión continuación
//         doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
//           .text(`${comision.nombre.toUpperCase()} (continuación)`, 50, currentY);
//         currentY += 18;
//         // Re-encabezado
//         doc.rect(colX.no, currentY, 505, 18).fillAndStroke('#96134b', '#96134b');
//         doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
//         doc.text('No.', colX.no + 3, currentY + 5, { width: 20 });
//         doc.text('DIPUTADO', colX.diputado + 3, currentY + 5, { width: 225 });
//         doc.text('CARGO', colX.cargo + 3, currentY + 5, { width: 95 });
//         doc.text('PARTIDO', colX.partido + 3, currentY + 5, { width: 45 });
//         doc.text('ASISTENCIA', colX.asistencia + 3, currentY + 5, { width: 85 });
//         currentY += 18;
//       }
//       // Fondo alternado en filas (blanco / gris muy claro)
//       const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
//       doc.rect(colX.no, currentY, 505, 16).fillAndStroke(bgColor, '#e5e7eb');
//       doc.fontSize(8).font('Helvetica').fillColor('#000');
//       doc.text(`${index + 1}`, colX.no + 3, currentY + 4, { width: 20 });
//       doc.text(asist.diputado, colX.diputado + 3, currentY + 4, { width: 225, ellipsis: true });
//       doc.text(asist.cargo_nombre || 'Sin cargo', colX.cargo + 3, currentY + 4, { width: 95, ellipsis: true });
//       doc.text(asist.partido, colX.partido + 3, currentY + 4, { width: 45, ellipsis: true });
//       // Color según asistencia igual al PDF
//       const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
//       doc.fontSize(8).font('Helvetica-Bold').fillColor(colorAsistencia);
//       doc.text(asist.asistenciaTexto, colX.asistencia + 3, currentY + 4, { width: 85, ellipsis: true });
//       currentY += 16;
//     });
//     doc.y = currentY;
//     doc.moveDown(1);
//   });
// }
function getColorAsistencia(asistencia) {
    switch (asistencia) {
        case 1: return '#22c55e'; // Verde - ASISTENCIA
        case 2: return '#3b82f6'; // Azul - ASISTENCIA ZOOM
        case 0: return '#f59e0b'; // Amarillo - PENDIENTE
        default: return '#f59e0b';
    }
}
const enviarWhatsAsistenciaPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const asistenciasRaw = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            raw: true,
        });
        if (asistenciasRaw.length === 0) {
            return res.status(404).json({ msg: "No hay asistencias registradas para este evento" });
        }
        const diputadoIds = asistenciasRaw.map(a => a.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = asistenciasRaw.map(a => a.partido_dip).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (!esSesion) {
            const comisionIds = asistenciasRaw.map(a => a.comision_dip_id).filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = asistenciasRaw.map(a => a.id_cargo_dip).filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const getAsistenciaTexto = (sentido) => {
            switch (sentido) {
                case 1: return "ASISTENCIA";
                case 2: return "ASISTENCIA ZOOM";
                case 0: return "PENDIENTE";
                default: return "PENDIENTE";
            }
        };
        const asistenciasConDetalles = asistenciasRaw.map((asistencia) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(asistencia.id_diputado);
            const partido = partidosMap.get(asistencia.partido_dip);
            const comision = comisionesMap.get(asistencia.comision_dip_id);
            const cargo = cargosMap.get(asistencia.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : "Sin nombre";
            return Object.assign(Object.assign({}, asistencia), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido", comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || null, comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo_nombre: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999, asistenciaTexto: getAsistenciaTexto(asistencia.sentido_voto), asistenciaNumerico: asistencia.sentido_voto });
        });
        const totales = {
            asistencia: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 1).length,
            asistenciaZoom: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 2).length,
            pendiente: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 0).length,
        };
        const totalDiputados = asistenciasConDetalles.length;
        // ===== CÁLCULO DE QUÓRUM =====
        const tienetipoReunion = evento.tipo_reunion === 1;
        const asistentesGeneral = totales.asistencia + totales.asistenciaZoom;
        const quorumGeneralRequerido = Math.floor(totalDiputados / 2) + 1;
        const quorumPorComision = new Map();
        if (!esSesion && tienetipoReunion) {
            asistenciasConDetalles.forEach((a) => {
                if (!a.comision_nombre)
                    return;
                if (!quorumPorComision.has(a.comision_nombre)) {
                    quorumPorComision.set(a.comision_nombre, {
                        nombre: a.comision_nombre, total: 0, asistentes: 0,
                        requerido: 0, tieneQuorum: false, importancia: a.comision_importancia
                    });
                }
                const comData = quorumPorComision.get(a.comision_nombre);
                comData.total += 1;
                if (a.asistenciaNumerico === 1 || a.asistenciaNumerico === 2)
                    comData.asistentes += 1;
            });
            quorumPorComision.forEach((comData) => {
                comData.requerido = Math.floor(comData.total / 2) + 1;
                comData.tieneQuorum = comData.asistentes >= comData.requerido;
            });
        }
        const todasConQuorum = quorumPorComision.size > 0 &&
            Array.from(quorumPorComision.values()).every(c => c.tieneQuorum);
        // ===== DIPUTADOS ASOCIADOS =====
        const diputadosAsociadosRaw = yield diputados_asociados_1.default.findAll({
            where: { id_agenda: evento.id },
            raw: true,
        });
        let diputadosAsociadosConDetalles = [];
        if (diputadosAsociadosRaw.length > 0) {
            const asociadosIds = diputadosAsociadosRaw.map((d) => d.id_diputado).filter(Boolean);
            const asociadosPartidoIds = diputadosAsociadosRaw.map((d) => d.partido_dip).filter(Boolean);
            const diputadosAsoc = yield diputado_1.default.findAll({
                where: { id: asociadosIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const diputadosAsocMap = new Map(diputadosAsoc.map((d) => [d.id, d]));
            const partidosAsoc = yield partidos_1.default.findAll({
                where: { id: asociadosPartidoIds },
                attributes: ["id", "siglas"],
                raw: true,
            });
            const partidosAsocMap = new Map(partidosAsoc.map((p) => [p.id, p]));
            diputadosAsociadosConDetalles = diputadosAsociadosRaw.map((da) => {
                var _a, _b, _c;
                const dip = diputadosAsocMap.get(da.id_diputado);
                const partido = partidosAsocMap.get(da.partido_dip);
                return {
                    nombre: dip
                        ? `${(_a = dip.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = dip.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                        : "Sin nombre",
                    partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido",
                };
            });
        }
        // ===== CREAR PDF =====
        const doc = new pdfkit_1.default({
            size: 'LETTER',
            margins: { top: 0, bottom: 30, left: 0, right: 0 },
            bufferPages: true
        });
        const fileName = `asistencia-evento-${id}-${Date.now()}.pdf`;
        const outputPath = path_1.default.join(__dirname, '../../storage/pdfs', fileName);
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        const writeStream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(writeStream);
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
        const drawBackground = () => {
            doc.image(bgPath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.y = 106;
        };
        drawBackground();
        // ===== BLOQUE IZQUIERDO VINO - "REGISTRO DE ASISTENCIA" =====
        const vinoX = 30;
        const vinoY = 106;
        const vinoW = 150;
        const vinoH = 200;
        doc.rect(vinoX, vinoY, vinoW, vinoH).fill('#96134b');
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
            .text('REGISTRO DE', vinoX + 10, vinoY + 50, { width: vinoW - 20, align: 'left' });
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
            .text('ASISTENCIA', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica').fillColor('#fff')
            .text('Legislatura del Estado de México', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
        // ===== BLOQUE DERECHO - INFORMACIÓN DEL EVENTO =====
        const rightX = vinoX + vinoW + 20;
        const rightW = doc.page.width - rightX - 30;
        let rightY = vinoY;
        // -- Encabezado INFORMACIÓN DEL EVENTO con icono diamante --
        doc.rect(rightX, rightY, rightW, 22).fill('#96134b');
        // Icono diamante simulado con rectángulo rotado
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-7, -7, 14, 14).fill('#96134b');
        doc.restore();
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-5, -5, 10, 10).fill('#c0395e');
        doc.restore();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
            .text('INFORMACIÓN DEL EVENTO', rightX + 10, rightY + 6, { width: rightW - 20 });
        rightY += 22;
        // Filas de info del evento
        const infoRows = [
            { label: 'Tipo', value: ((_b = evento.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) || 'N/A' },
            { label: 'Sede', value: ((_c = evento.sede) === null || _c === void 0 ? void 0 : _c.sede) || 'N/A' },
            { label: 'Fecha', value: evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A' },
            { label: 'Desripción', value: evento.descripcion || 'N/A' },
        ];
        infoRows.forEach((row, i) => {
            const rowH = row.label === 'Desripción' ? 35 : 18;
            doc.rect(rightX, rightY, rightW, rowH).fill(i % 2 === 0 ? '#ffffff' : '#f5f5f5');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text(row.label, rightX + 10, rightY + 5, { width: 70, align: 'right' });
            doc.fontSize(9).font('Helvetica').fillColor('#000')
                .text(row.value, rightX + 90, rightY + 5, { width: rightW - 100 });
            rightY += rowH;
        });
        // -- Encabezado RESUMEN DE ASISTENCIA con icono diamante --
        doc.rect(rightX, rightY, rightW, 22).fill('#96134b');
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-7, -7, 14, 14).fill('#96134b');
        doc.restore();
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-5, -5, 10, 10).fill('#c0395e');
        doc.restore();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
            .text('RESUMEN DE ASISTENCIA', rightX + 10, rightY + 6, { width: rightW - 20 });
        rightY += 22;
        // Filas del resumen
        const resumenRows = [
            { label: 'Asistencia', value: totales.asistencia.toString(), color: '#22c55e' },
            { label: 'Asistencia Zoom', value: totales.asistenciaZoom.toString(), color: '#3b82f6' },
            { label: 'Pendiente', value: totales.pendiente.toString(), color: '#f59e0b' },
            { label: 'Total', value: totalDiputados.toString(), color: '#000000' },
        ];
        resumenRows.forEach((row, i) => {
            doc.rect(rightX, rightY, rightW, 18).fill(i % 2 === 0 ? '#ffffff' : '#f5f5f5');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text(row.label, rightX + 10, rightY + 4, { width: 100, align: 'right' });
            doc.fontSize(9).font('Helvetica-Bold').fillColor(row.color)
                .text(row.value, rightX + 120, rightY + 4, { width: rightW - 130 });
            rightY += 18;
        });
        // ===== QUÓRUM (si aplica) =====
        if (!esSesion && tienetipoReunion) {
            rightY += 5;
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text('Quórum: ', rightX, rightY, { continued: true });
            doc.fontSize(9).font('Helvetica-Bold')
                .fillColor(todasConQuorum ? '#22c55e' : '#dc2626')
                .text(todasConQuorum ? 'CON QUÓRUM' : 'SIN QUÓRUM');
            doc.fillColor('#000');
            rightY += 16;
        }
        // Avanzar Y después del bloque principal
        doc.y = Math.max(vinoY + vinoH, rightY) + 15;
        // ===== DETALLE =====
        if (esSesion) {
            generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        else {
            generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground, tienetipoReunion ? quorumPorComision : new Map(), diputadosAsociadosConDetalles);
        }
        doc.end();
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('PDF de asistencia generado exitosamente en:', outputPath);
        // ===== WHATSAPP =====
        let fechaFormateada = "";
        if (evento.fecha) {
            fechaFormateada = (0, date_fns_1.format)(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
        }
        let infoComisiones = "";
        if (!esSesion) {
            const comisionesUnicas = [...new Set(asistenciasConDetalles
                    .map(a => a.comision_nombre)
                    .filter(nombre => nombre && nombre !== 'Sin Comisión'))].sort();
            if (comisionesUnicas.length > 0) {
                infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
            }
        }
        const quorumMsg = (!esSesion && tienetipoReunion)
            ? `\n*Quórum:* ${asistentesGeneral}/${totalDiputados} — ${todasConQuorum ? '✅ CON QUÓRUM' : '❌ SIN QUÓRUM'}\n`
            : '';
        const mensajeTexto = `*ASISTENCIA - ${((_d = evento.tipoevento) === null || _d === void 0 ? void 0 : _d.nombre) || 'Evento'}*\n\n` +
            `*Descripcion:* ${evento.descripcion || 'N/A'}\n` +
            `*Sede:* ${((_e = evento.sede) === null || _e === void 0 ? void 0 : _e.sede) || 'N/A'}\n` +
            `*Fecha:* ${fechaFormateada}${infoComisiones}` +
            quorumMsg +
            `\n*Resumen:*\n` +
            `Asistencia: ${totales.asistencia}\n` +
            `Asistencia Zoom: ${totales.asistenciaZoom}\n` +
            `Pendiente: ${totales.pendiente}\n\n` +
            `Total de diputados: ${totalDiputados}\n\n` +
            `Adjunto PDF con detalle completo`;
        if (!fs_1.default.existsSync(outputPath)) {
            throw new Error('El archivo PDF no se generó correctamente');
        }
        const pdfBuffer = fs_1.default.readFileSync(outputPath);
        const base64PDF = pdfBuffer.toString('base64');
        const params = {
            token: 'ml56a7d6tn7ha7cc',
            // to: "+525561081154 ,",
            to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
            filename: fileName,
            document: base64PDF,
            caption: mensajeTexto
        };
        const whatsappResponse = yield axios_1.default.post('https://api.ultramsg.com/instance144598/messages/document', new URLSearchParams(params), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        return res.status(200).json({
            message: "PDF de asistencia generado y enviado por WhatsApp correctamente",
            enviado: true,
            archivo: fileName,
            totales,
            quorum: tienetipoReunion ? {
                general: { asistentes: asistentesGeneral, requerido: quorumGeneralRequerido, total: totalDiputados, todasConQuorum }
            } : null,
            whatsappResponse: whatsappResponse.data
        });
    }
    catch (error) {
        console.error("Error completo al generar y enviar PDF de asistencia:", error);
        if (axios_1.default.isAxiosError(error)) {
            console.error("Error de Axios:", { message: error.message, code: error.code, response: (_f = error.response) === null || _f === void 0 ? void 0 : _f.data });
        }
        return res.status(500).json({
            message: "Error al generar y enviar PDF de asistencia por WhatsApp",
            error: error.message,
            details: axios_1.default.isAxiosError(error) ? (_g = error.response) === null || _g === void 0 ? void 0 : _g.data : undefined
        });
    }
});
exports.enviarWhatsAsistenciaPDF = enviarWhatsAsistenciaPDF;
const enviarNotInicioEvento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const evento = yield agendas_1.default.findOne({
            where: { id },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }
        evento.update({ fecha_hora_inicio: Date.now() });
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const asistenciasRaw = yield asistencia_votos_1.default.findAll({
            where: { id_agenda: id },
            raw: true,
        });
        if (asistenciasRaw.length === 0) {
            return res.status(404).json({ msg: "No hay asistencias registradas para este evento" });
        }
        const diputadoIds = asistenciasRaw.map(a => a.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        const partidoIds = asistenciasRaw.map(a => a.partido_dip).filter(Boolean);
        const partidos = yield partidos_1.default.findAll({
            where: { id: partidoIds },
            attributes: ["id", "siglas"],
            raw: true,
        });
        const partidosMap = new Map(partidos.map(p => [p.id, p]));
        let comisionesMap = new Map();
        let cargosMap = new Map();
        if (!esSesion) {
            const comisionIds = asistenciasRaw.map(a => a.comision_dip_id).filter(Boolean);
            if (comisionIds.length > 0) {
                const comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre", "importancia"],
                    raw: true,
                });
                comisionesMap = new Map(comisiones.map(c => [c.id, c]));
            }
            const cargoIds = asistenciasRaw.map(a => a.id_cargo_dip).filter(Boolean);
            if (cargoIds.length > 0) {
                const cargos = yield tipo_cargo_comisions_1.default.findAll({
                    where: { id: cargoIds },
                    attributes: ["id", "valor", "nivel"],
                    raw: true,
                });
                cargosMap = new Map(cargos.map(c => [c.id, c]));
            }
        }
        const getAsistenciaTexto = (sentido) => {
            switch (sentido) {
                case 1: return "ASISTENCIA";
                case 2: return "ASISTENCIA ZOOM";
                case 0: return "PENDIENTE";
                default: return "PENDIENTE";
            }
        };
        const asistenciasConDetalles = asistenciasRaw.map((asistencia) => {
            var _a, _b, _c;
            const diputado = diputadosMap.get(asistencia.id_diputado);
            const partido = partidosMap.get(asistencia.partido_dip);
            const comision = comisionesMap.get(asistencia.comision_dip_id);
            const cargo = cargosMap.get(asistencia.id_cargo_dip);
            const nombreCompletoDiputado = diputado
                ? `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                : "Sin nombre";
            return Object.assign(Object.assign({}, asistencia), { diputado: nombreCompletoDiputado, partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido", comision_nombre: (comision === null || comision === void 0 ? void 0 : comision.nombre) || null, comision_importancia: (comision === null || comision === void 0 ? void 0 : comision.importancia) || 999, cargo_nombre: (cargo === null || cargo === void 0 ? void 0 : cargo.valor) || null, nivel_cargo: (cargo === null || cargo === void 0 ? void 0 : cargo.nivel) || 999, asistenciaTexto: getAsistenciaTexto(asistencia.sentido_voto), asistenciaNumerico: asistencia.sentido_voto });
        });
        const totales = {
            asistencia: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 1).length,
            asistenciaZoom: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 2).length,
            pendiente: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 0).length,
        };
        const totalDiputados = asistenciasConDetalles.length;
        // ===== CÁLCULO DE QUÓRUM =====
        const tienetipoReunion = evento.tipo_reunion === 1;
        const asistentesGeneral = totales.asistencia + totales.asistenciaZoom;
        const quorumGeneralRequerido = Math.floor(totalDiputados / 2) + 1;
        const quorumPorComision = new Map();
        if (!esSesion && tienetipoReunion) {
            asistenciasConDetalles.forEach((a) => {
                if (!a.comision_nombre)
                    return;
                if (!quorumPorComision.has(a.comision_nombre)) {
                    quorumPorComision.set(a.comision_nombre, {
                        nombre: a.comision_nombre, total: 0, asistentes: 0,
                        requerido: 0, tieneQuorum: false, importancia: a.comision_importancia
                    });
                }
                const comData = quorumPorComision.get(a.comision_nombre);
                comData.total += 1;
                if (a.asistenciaNumerico === 1 || a.asistenciaNumerico === 2)
                    comData.asistentes += 1;
            });
            quorumPorComision.forEach((comData) => {
                comData.requerido = Math.floor(comData.total / 2) + 1;
                comData.tieneQuorum = comData.asistentes >= comData.requerido;
            });
        }
        const todasConQuorum = quorumPorComision.size > 0 &&
            Array.from(quorumPorComision.values()).every(c => c.tieneQuorum);
        // ===== DIPUTADOS ASOCIADOS =====
        const diputadosAsociadosRaw = yield diputados_asociados_1.default.findAll({
            where: { id_agenda: evento.id },
            raw: true,
        });
        let diputadosAsociadosConDetalles = [];
        if (diputadosAsociadosRaw.length > 0) {
            const asociadosIds = diputadosAsociadosRaw.map((d) => d.id_diputado).filter(Boolean);
            const asociadosPartidoIds = diputadosAsociadosRaw.map((d) => d.partido_dip).filter(Boolean);
            const diputadosAsoc = yield diputado_1.default.findAll({
                where: { id: asociadosIds },
                attributes: ["id", "apaterno", "amaterno", "nombres"],
                raw: true,
            });
            const diputadosAsocMap = new Map(diputadosAsoc.map((d) => [d.id, d]));
            const partidosAsoc = yield partidos_1.default.findAll({
                where: { id: asociadosPartidoIds },
                attributes: ["id", "siglas"],
                raw: true,
            });
            const partidosAsocMap = new Map(partidosAsoc.map((p) => [p.id, p]));
            diputadosAsociadosConDetalles = diputadosAsociadosRaw.map((da) => {
                var _a, _b, _c;
                const dip = diputadosAsocMap.get(da.id_diputado);
                const partido = partidosAsocMap.get(da.partido_dip);
                return {
                    nombre: dip
                        ? `${(_a = dip.apaterno) !== null && _a !== void 0 ? _a : ""} ${(_b = dip.amaterno) !== null && _b !== void 0 ? _b : ""} ${(_c = dip.nombres) !== null && _c !== void 0 ? _c : ""}`.trim()
                        : "Sin nombre",
                    partido: (partido === null || partido === void 0 ? void 0 : partido.siglas) || "Sin partido",
                };
            });
        }
        // ===== CREAR PDF =====
        const doc = new pdfkit_1.default({
            size: 'LETTER',
            margins: { top: 0, bottom: 30, left: 0, right: 0 },
            bufferPages: true
        });
        const fileName = `asistencia-evento-${id}-${Date.now()}.pdf`;
        const outputPath = path_1.default.join(__dirname, '../../storage/pdfs', fileName);
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        const writeStream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(writeStream);
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
        const drawBackground = () => {
            doc.image(bgPath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.y = 106;
        };
        drawBackground();
        // ===== BLOQUE IZQUIERDO VINO - "REGISTRO DE ASISTENCIA" =====
        const vinoX = 30;
        const vinoY = 106;
        const vinoW = 150;
        const vinoH = 200;
        doc.rect(vinoX, vinoY, vinoW, vinoH).fill('#96134b');
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
            .text('REGISTRO DE', vinoX + 10, vinoY + 50, { width: vinoW - 20, align: 'left' });
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#fff')
            .text('ASISTENCIA', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica').fillColor('#fff')
            .text('Legislatura del Estado de México', vinoX + 10, doc.y, { width: vinoW - 20, align: 'left' });
        // ===== BLOQUE DERECHO - INFORMACIÓN DEL EVENTO =====
        const rightX = vinoX + vinoW + 20;
        const rightW = doc.page.width - rightX - 30;
        let rightY = vinoY;
        // -- Encabezado INFORMACIÓN DEL EVENTO con icono diamante --
        doc.rect(rightX, rightY, rightW, 22).fill('#96134b');
        // Icono diamante simulado con rectángulo rotado
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-7, -7, 14, 14).fill('#96134b');
        doc.restore();
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-5, -5, 10, 10).fill('#c0395e');
        doc.restore();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
            .text('INFORMACIÓN DEL EVENTO', rightX + 10, rightY + 6, { width: rightW - 20 });
        rightY += 22;
        // Filas de info del evento
        const infoRows = [
            { label: 'Tipo', value: ((_b = evento.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre) || 'N/A' },
            { label: 'Sede', value: ((_c = evento.sede) === null || _c === void 0 ? void 0 : _c.sede) || 'N/A' },
            { label: 'Fecha', value: evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX') : 'N/A' },
            { label: 'Desripción', value: evento.descripcion || 'N/A' },
        ];
        infoRows.forEach((row, i) => {
            const rowH = row.label === 'Desripción' ? 35 : 18;
            doc.rect(rightX, rightY, rightW, rowH).fill(i % 2 === 0 ? '#ffffff' : '#f5f5f5');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text(row.label, rightX + 10, rightY + 5, { width: 70, align: 'right' });
            doc.fontSize(9).font('Helvetica').fillColor('#000')
                .text(row.value, rightX + 90, rightY + 5, { width: rightW - 100 });
            rightY += rowH;
        });
        // -- Encabezado RESUMEN DE ASISTENCIA con icono diamante --
        doc.rect(rightX, rightY, rightW, 22).fill('#96134b');
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-7, -7, 14, 14).fill('#96134b');
        doc.restore();
        doc.save();
        doc.translate(rightX - 8, rightY + 11).rotate(45);
        doc.rect(-5, -5, 10, 10).fill('#c0395e');
        doc.restore();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
            .text('RESUMEN DE ASISTENCIA', rightX + 10, rightY + 6, { width: rightW - 20 });
        rightY += 22;
        // Filas del resumen
        const resumenRows = [
            { label: 'Asistencia', value: totales.asistencia.toString(), color: '#22c55e' },
            { label: 'Asistencia Zoom', value: totales.asistenciaZoom.toString(), color: '#3b82f6' },
            { label: 'Pendiente', value: totales.pendiente.toString(), color: '#f59e0b' },
            { label: 'Total', value: totalDiputados.toString(), color: '#000000' },
        ];
        resumenRows.forEach((row, i) => {
            doc.rect(rightX, rightY, rightW, 18).fill(i % 2 === 0 ? '#ffffff' : '#f5f5f5');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text(row.label, rightX + 10, rightY + 4, { width: 100, align: 'right' });
            doc.fontSize(9).font('Helvetica-Bold').fillColor(row.color)
                .text(row.value, rightX + 120, rightY + 4, { width: rightW - 130 });
            rightY += 18;
        });
        // ===== QUÓRUM (si aplica) =====
        if (!esSesion && tienetipoReunion) {
            rightY += 5;
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
                .text('Quórum: ', rightX, rightY, { continued: true });
            doc.fontSize(9).font('Helvetica-Bold')
                .fillColor(todasConQuorum ? '#22c55e' : '#dc2626')
                .text(todasConQuorum ? 'CON QUÓRUM' : 'SIN QUÓRUM');
            doc.fillColor('#000');
            rightY += 16;
        }
        // Avanzar Y después del bloque principal
        doc.y = Math.max(vinoY + vinoH, rightY) + 15;
        // ===== DETALLE =====
        if (esSesion) {
            generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        else {
            generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground, tienetipoReunion ? quorumPorComision : new Map(), diputadosAsociadosConDetalles);
        }
        doc.end();
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('PDF de asistencia generado exitosamente en:', outputPath);
        // ===== WHATSAPP =====
        let fechaFormateada = "";
        if (evento.fecha) {
            fechaFormateada = (0, date_fns_1.format)(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
        }
        let infoComisiones = "";
        if (!esSesion) {
            const comisionesUnicas = [...new Set(asistenciasConDetalles
                    .map(a => a.comision_nombre)
                    .filter(nombre => nombre && nombre !== 'Sin Comisión'))].sort();
            if (comisionesUnicas.length > 0) {
                infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
            }
        }
        const quorumMsg = (!esSesion && tienetipoReunion)
            ? `\n*Quórum:* ${asistentesGeneral}/${totalDiputados} — ${todasConQuorum ? '✅ CON QUÓRUM' : '❌ SIN QUÓRUM'}\n`
            : '';
        const mensajeTexto = `*ASISTENCIA - ${((_d = evento.tipoevento) === null || _d === void 0 ? void 0 : _d.nombre) || 'Evento'}*\n\n` +
            `*Descripcion:* ${evento.descripcion || 'N/A'}\n` +
            `*Sede:* ${((_e = evento.sede) === null || _e === void 0 ? void 0 : _e.sede) || 'N/A'}\n` +
            `*Fecha:* ${fechaFormateada}${infoComisiones}` +
            quorumMsg +
            `\n*Resumen:*\n` +
            `Asistencia: ${totales.asistencia}\n` +
            `Asistencia Zoom: ${totales.asistenciaZoom}\n` +
            `Pendiente: ${totales.pendiente}\n\n` +
            `Total de diputados: ${totalDiputados}\n\n` +
            `Adjunto PDF con detalle completo`;
        if (!fs_1.default.existsSync(outputPath)) {
            throw new Error('El archivo PDF no se generó correctamente');
        }
        const pdfBuffer = fs_1.default.readFileSync(outputPath);
        const base64PDF = pdfBuffer.toString('base64');
        const params = {
            token: 'ml56a7d6tn7ha7cc',
            to: "+527222035605,",
            // to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
            filename: fileName,
            document: base64PDF,
            caption: mensajeTexto
        };
        const whatsappResponse = yield axios_1.default.post('https://api.ultramsg.com/instance144598/messages/document', new URLSearchParams(params), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        return res.status(200).json({
            message: "PDF de asistencia generado y enviado por WhatsApp correctamente",
            enviado: true,
            archivo: fileName,
            totales,
            quorum: tienetipoReunion ? {
                general: { asistentes: asistentesGeneral, requerido: quorumGeneralRequerido, total: totalDiputados, todasConQuorum }
            } : null,
            whatsappResponse: whatsappResponse.data
        });
    }
    catch (error) {
        console.error("Error completo al generar y enviar PDF de asistencia:", error);
        if (axios_1.default.isAxiosError(error)) {
            console.error("Error de Axios:", { message: error.message, code: error.code, response: (_f = error.response) === null || _f === void 0 ? void 0 : _f.data });
        }
        return res.status(500).json({
            message: "Error al generar y enviar PDF de asistencia por WhatsApp",
            error: error.message,
            details: axios_1.default.isAxiosError(error) ? (_g = error.response) === null || _g === void 0 ? void 0 : _g.data : undefined
        });
    }
});
exports.enviarNotInicioEvento = enviarNotInicioEvento;
function generarDetalleComisionAsistencia(doc, asistencias, drawBackground, quorumPorComision, diputadosAsociados = []) {
    const titY = doc.y;
    doc.rect(30, titY, doc.page.width - 60, 22).fill('#96134b');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
        .text('DETALLE DE ASISTENCIA POR COMISIÓN', 30, titY + 5, { width: doc.page.width - 60, align: 'center' });
    doc.y = titY + 30;
    const asistenciasPorComision = asistencias.reduce((grupos, asist) => {
        const comision = asist.comision_nombre || 'Sin comisión';
        if (!grupos[comision]) {
            grupos[comision] = { nombre: comision, importancia: asist.comision_importancia, asistencias: [] };
        }
        grupos[comision].asistencias.push(asist);
        return grupos;
    }, {});
    const comisionesOrdenadas = Object.values(asistenciasPorComision)
        .sort((a, b) => a.importancia - b.importancia);
    comisionesOrdenadas.forEach((comision) => {
        if (doc.y > 650) {
            doc.addPage();
            drawBackground();
            doc.y = 106;
            const rY = doc.y;
            doc.rect(30, rY, doc.page.width - 60, 22).fill('#96134b');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
                .text('DETALLE DE ASISTENCIA POR COMISIÓN', 30, rY + 5, { width: doc.page.width - 60, align: 'center' });
            doc.y = rY + 30;
        }
        const quorum = quorumPorComision.get(comision.nombre);
        const subY = doc.y;
        doc.rect(30, subY, doc.page.width - 60, 20).fill('#7a7a7a');
        let subtitulo = comision.nombre.toUpperCase();
        if (quorum) {
            const qLabel = quorum.tieneQuorum ? '✓ CON QUÓRUM' : '✗ SIN QUÓRUM';
            subtitulo += `  (${quorum.asistentes}/${quorum.total} — req: ${quorum.requerido})  ${qLabel}`;
        }
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
            .text(subtitulo, 35, subY + 5, { width: doc.page.width - 70, align: 'center' });
        doc.y = subY + 20;
        const asistenciasOrdenadas = [...comision.asistencias]
            .sort((a, b) => a.nivel_cargo - b.nivel_cargo);
        const hY = doc.y;
        const colX = { no: 30, diputado: 58, cargo: 290, partido: 400, asistencia: 455 };
        const tableW = doc.page.width - 60;
        doc.rect(30, hY, tableW, 18).fill('#d4d4d4');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
        doc.text('No.', colX.no + 2, hY + 5, { width: 25 });
        doc.text('DIPUTADO', colX.diputado + 2, hY + 5, { width: 225 });
        doc.text('CARGO', colX.cargo + 2, hY + 5, { width: 105 });
        doc.text('PARTIDO', colX.partido + 2, hY + 5, { width: 50 });
        doc.text('ASISTENCIA', colX.asistencia + 2, hY + 5, { width: 90 });
        let currentY = hY + 18;
        asistenciasOrdenadas.forEach((asist, index) => {
            if (currentY > 700) {
                doc.addPage();
                drawBackground();
                currentY = 106;
                doc.rect(30, currentY, doc.page.width - 60, 20).fill('#7a7a7a');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
                    .text(`${comision.nombre.toUpperCase()} (continuación)`, 35, currentY + 5, { width: doc.page.width - 70, align: 'center' });
                currentY += 20;
                doc.rect(30, currentY, tableW, 18).fill('#d4d4d4');
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
                doc.text('No.', colX.no + 2, currentY + 5, { width: 25 });
                doc.text('DIPUTADO', colX.diputado + 2, currentY + 5, { width: 225 });
                doc.text('CARGO', colX.cargo + 2, currentY + 5, { width: 105 });
                doc.text('PARTIDO', colX.partido + 2, currentY + 5, { width: 50 });
                doc.text('ASISTENCIA', colX.asistencia + 2, currentY + 5, { width: 90 });
                currentY += 18;
            }
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
            doc.rect(30, currentY, tableW, 16).fill(bgColor);
            doc.moveTo(30, currentY + 16).lineTo(30 + tableW, currentY + 16)
                .stroke('#e0e0e0');
            doc.fontSize(8).font('Helvetica').fillColor('#000');
            doc.text(`${index + 1}`, colX.no + 2, currentY + 4, { width: 25 });
            doc.text(asist.diputado, colX.diputado + 2, currentY + 4, { width: 225, ellipsis: true });
            doc.text(asist.cargo_nombre || '', colX.cargo + 2, currentY + 4, { width: 105, ellipsis: true });
            doc.text(asist.partido, colX.partido + 2, currentY + 4, { width: 50, ellipsis: true });
            const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
            doc.fontSize(8).font('Helvetica-Bold').fillColor(colorAsistencia);
            doc.text(asist.asistenciaTexto, colX.asistencia + 2, currentY + 4, { width: 90, ellipsis: true });
            currentY += 16;
        });
        doc.y = currentY + 10;
    });
    // ===== DIPUTADOS ASOCIADOS AL FINAL =====
    if (diputadosAsociados.length > 0) {
        if (doc.y > 600) {
            doc.addPage();
            drawBackground();
            doc.y = 106;
            const rY = doc.y;
            doc.rect(30, rY, doc.page.width - 60, 22).fill('#96134b');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
                .text('DETALLE DE ASISTENCIA POR COMISIÓN', 30, rY + 5, { width: doc.page.width - 60, align: 'center' });
            doc.y = rY + 30;
        }
        doc.y += 10;
        const titAsocY = doc.y;
        doc.rect(30, titAsocY, doc.page.width - 60, 20).fill('#7a7a7a');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
            .text('DIPUTADOS ASOCIADOS', 35, titAsocY + 5, { width: doc.page.width - 70, align: 'center' });
        doc.y = titAsocY + 20;
        const tableW = doc.page.width - 60;
        const colXAsoc = { no: 30, diputado: 58, partido: 430 };
        const hY = doc.y;
        doc.rect(30, hY, tableW, 18).fill('#d4d4d4');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
        doc.text('No.', colXAsoc.no + 2, hY + 5, { width: 25 });
        doc.text('DIPUTADO', colXAsoc.diputado + 2, hY + 5, { width: 365 });
        doc.text('PARTIDO', colXAsoc.partido + 2, hY + 5, { width: 80 });
        let currentY = hY + 18;
        diputadosAsociados.forEach((da, index) => {
            if (currentY > 700) {
                doc.addPage();
                drawBackground();
                currentY = 106;
                doc.rect(30, currentY, doc.page.width - 60, 20).fill('#7a7a7a');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
                    .text('DIPUTADOS ASOCIADOS (continuación)', 35, currentY + 5, { width: doc.page.width - 70, align: 'center' });
                currentY += 20;
                doc.rect(30, currentY, tableW, 18).fill('#d4d4d4');
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#96134b');
                doc.text('No.', colXAsoc.no + 2, currentY + 5, { width: 25 });
                doc.text('DIPUTADO', colXAsoc.diputado + 2, currentY + 5, { width: 365 });
                doc.text('PARTIDO', colXAsoc.partido + 2, currentY + 5, { width: 80 });
                currentY += 18;
            }
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
            doc.rect(30, currentY, tableW, 16).fill(bgColor);
            doc.moveTo(30, currentY + 16).lineTo(30 + tableW, currentY + 16).stroke('#e0e0e0');
            doc.fontSize(8).font('Helvetica').fillColor('#000');
            doc.text(`${index + 1}`, colXAsoc.no + 2, currentY + 4, { width: 25 });
            doc.text(da.nombre, colXAsoc.diputado + 2, currentY + 4, { width: 365, ellipsis: true });
            doc.text(da.partido, colXAsoc.partido + 2, currentY + 4, { width: 80, ellipsis: true });
            currentY += 16;
        });
        doc.y = currentY + 10;
    }
}
const exportdatos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // 1. Obtener los datos de la base de datos con las relaciones necesarias
        const agendas = yield agendas_1.default.findAll({
            order: [['fecha', 'DESC']],
            include: [
                {
                    model: sedes_1.default,
                    as: 'sede', // Verifica que este sea el alias correcto en tu modelo
                    attributes: ['sede']
                },
                {
                    model: tipo_eventos_1.default,
                    as: 'tipoevento', // ⬅️ Cambiado a 'tipoevento' según el error
                    attributes: ['nombre']
                },
                {
                    model: anfitrion_agendas_1.default,
                    as: 'anfitrion_agendas',
                    include: [
                        {
                            model: tipo_autors_1.default,
                            as: 'tipo_autor',
                            attributes: ['valor']
                        }
                    ]
                }
            ]
        });
        // 2. Crear un nuevo libro de Excel
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Agendas');
        // 3. Definir todas las columnas
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Hora', key: 'hora', width: 12 },
            { header: 'Fecha Hora', key: 'fecha_hora', width: 20 },
            { header: 'Fecha Hora Inicio', key: 'fecha_hora_inicio', width: 20 },
            { header: 'Fecha Hora Fin', key: 'fecha_hora_fin', width: 20 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Sede', key: 'sede', width: 30 },
            { header: 'Tipo Evento', key: 'tipo_evento', width: 25 },
            { header: 'Transmisión', key: 'transmision', width: 15 },
            { header: 'Estatus Transmisión', key: 'estatus_transmision', width: 20 },
            { header: 'Inicio Programado', key: 'inicio_programado', width: 20 },
            { header: 'Fin Programado', key: 'fin_programado', width: 20 },
            { header: 'Liga', key: 'liga', width: 30 },
            { header: 'Documentación ID', key: 'documentacion_id', width: 18 },
            { header: 'Tipo Sesión', key: 'tipo_sesion', width: 15 },
            { header: 'Tipo Autor', key: 'tipo_autor', width: 20 },
            { header: 'Autor', key: 'autor', width: 30 },
        ];
        // 4. Estilizar el encabezado
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        // 5. Procesar y agregar los datos
        for (const agenda of agendas) {
            // Obtener tipo autor y autor
            let tipoAutorValor = '';
            let autorNombre = '';
            if (agenda.anfitrion_agendas && agenda.anfitrion_agendas.length > 0) {
                const anfitrion = agenda.anfitrion_agendas[0];
                tipoAutorValor = ((_a = anfitrion.tipo_autor) === null || _a === void 0 ? void 0 : _a.valor) || '';
                // Obtener nombre del autor según el tipo
                if (anfitrion.autor_id) {
                    // Verificar si es una comisión
                    const comision = yield comisions_1.default.findOne({
                        where: { id: anfitrion.autor_id },
                        attributes: ["id", "nombre"]
                    });
                    if (comision) {
                        autorNombre = comision.nombre;
                    }
                    else {
                        // Si no es comisión, es sesión
                        autorNombre = 'Sesion';
                    }
                }
            }
            worksheet.addRow({
                id: agenda.id,
                fecha: agenda.fecha,
                hora: agenda.hora,
                fecha_hora: agenda.fecha_hora,
                fecha_hora_inicio: agenda.fecha_hora_inicio,
                fecha_hora_fin: agenda.fecha_hora_fin,
                descripcion: agenda.descripcion,
                status: agenda.status,
                sede: ((_b = agenda.sede) === null || _b === void 0 ? void 0 : _b.sede) || '',
                tipo_evento: ((_c = agenda.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre) || '', // ⬅️ Cambiado a 'tipoevento'
                transmision: agenda.transmision,
                estatus_transmision: agenda.estatus_transmision,
                inicio_programado: agenda.inicio_programado,
                fin_programado: agenda.fin_programado,
                liga: agenda.liga,
                documentacion_id: agenda.documentacion_id,
                tipo_sesion: agenda.tipo_sesion,
                tipo_autor: tipoAutorValor,
                autor: autorNombre,
            });
        }
        // 6. Aplicar bordes a todas las celdas
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        // 7. Generar el buffer
        const buffer = yield workbook.xlsx.writeBuffer();
        // 8. Generar el nombre del archivo con fecha
        const fecha = new Date().toISOString().split('T')[0];
        const filename = `agendas_${fecha}.xlsx`;
        // 9. Configurar headers y enviar
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    }
    catch (error) {
        console.error("Error al exportar agendas:", error);
        return res.status(500).json({
            msg: "Error al generar el archivo Excel",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.exportdatos = exportdatos;
const getComisionesTurnado = (puntoId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!puntoId)
        return { turnado: false, comisiones_turnado: null };
    const puntosComisiones = yield puntos_comisiones_1.default.findAll({
        where: { id_punto: puntoId },
        attributes: ["id_comision"],
        raw: true
    });
    if (puntosComisiones.length === 0)
        return { turnado: false, comisiones_turnado: null };
    const idsRaw = puntosComisiones[0].id_comision || '';
    const comisionIds = idsRaw
        .replace(/[\[\]]/g, '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    if (comisionIds.length === 0)
        return { turnado: false, comisiones_turnado: null };
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIds },
        attributes: ['nombre'],
        raw: true,
    });
    return {
        turnado: true,
        comisiones_turnado: comisiones.map((c) => c.nombre).join(', ')
    };
});
