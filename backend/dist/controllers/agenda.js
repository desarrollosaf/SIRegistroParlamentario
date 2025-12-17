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
exports.enviarWhatsAsistenciaPDF = exports.generarPDFAsistencia = exports.enviarWhatsVotacionPDF = exports.generarPDFVotacion = exports.Eliminarlista = exports.addDipLista = exports.gestionIntegrantes = exports.enviarWhatsPunto = exports.updateAgenda = exports.getAgenda = exports.saveagenda = exports.catalogossave = exports.reiniciarvoto = exports.actualizarvoto = exports.getvotacionpunto = exports.eliminarinter = exports.getintervenciones = exports.saveintervencion = exports.eliminarpunto = exports.actualizarPunto = exports.getpuntos = exports.guardarpunto = exports.getTiposPuntos = exports.catalogos = exports.actualizar = exports.getevento = exports.geteventos = void 0;
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
                    where: {
                        id_comision: anfitriones.map(a => a.autor_id),
                    }
                });
                if (puntosturnados.length > 0) { // ✅ Validar antes de buscar puntos
                    puntos = yield puntos_ordens_1.default.findAll({
                        where: {
                            id: puntosturnados.map(p => p.id_punto)
                        },
                        attributes: ["id", "punto"],
                        raw: true
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
        // 5. Si NO existen asistencias, crearlas
        if (asistenciasExistentes.length === 0) {
            yield crearAsistencias(evento, esSesion);
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
                puntos
            });
        }
        // 6. Si SÍ existen asistencias, procesarlas
        const integrantes = yield procesarAsistencias(asistenciasExistentes, esSesion);
        return res.status(200).json({
            msg: "Evento con asistencias existentes",
            evento,
            integrantes,
            titulo,
            tipoEvento, // ✅ Faltaba la coma aquí
            puntos
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
            // Para sesiones: todos los diputados de la legislatura actual
            const legislatura = yield legislaturas_1.default.findOne({
                order: [["fecha_inicio", "DESC"]],
            });
            if (legislatura) {
                const diputados = yield integrante_legislaturas_1.default.findAll({
                    where: { legislatura_id: legislatura.id },
                    include: [{ model: diputado_1.default, as: "diputado" }],
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
                raw: true
            }),
            partidos_1.default.findAll({
                where: { id: partidoIds },
                attributes: ["id", "siglas"],
                raw: true
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
            partidos: partidos
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
            else if (proponente.valor === 'Gobernadora o Gobernador del Estado') {
                const gobernadora = yield cat_fun_dep_1.default.findOne({
                    where: {
                        nombre_dependencia: { [sequelize_1.Op.like]: '%Gobernadora o Gobernador del Estado%' },
                        vigente: 1
                    },
                });
                if (gobernadora) {
                    dtSlctTemp = [{
                            id: `${proponente.id}/${gobernadora.id}`,
                            id_original: gobernadora.id,
                            valor: gobernadora.nombre_titular,
                            proponente_id: proponente.id,
                            proponente_valor: proponente.valor,
                            tipo: 'funcionario'
                        }];
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
            else if (proponente.valor === 'Comición de Derechos Humanos del Estado de México') {
                const derechoshumanos = yield comisions_1.default.findOne({
                    where: {
                        nombre: { [sequelize_1.Op.like]: '%Derechos Humanos%' },
                    },
                    order: [['created_at', 'DESC']],
                });
                if (derechoshumanos) {
                    dtSlctTemp = [{
                            id: `${proponente.id}/${derechoshumanos.id}`,
                            id_original: derechoshumanos.id,
                            valor: derechoshumanos.nombre,
                            proponente_id: proponente.id,
                            proponente_valor: proponente.valor,
                            tipo: 'comision'
                        }];
                }
            }
            else if (proponente.valor === 'Tribunal Superior de Justicia') {
                const tribunal = yield cat_fun_dep_1.default.findOne({
                    where: {
                        nombre_dependencia: { [sequelize_1.Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
                        vigente: 1
                    },
                });
                if (tribunal) {
                    dtSlctTemp = [{
                            id: `${proponente.id}/${tribunal.id}`,
                            id_original: tribunal.id,
                            valor: tribunal.nombre_titular,
                            proponente_id: proponente.id,
                            proponente_valor: proponente.valor,
                            tipo: 'funcionario'
                        }];
                }
            }
            else if (proponente.valor === 'Ciudadanas y ciudadanos del Estado' ||
                proponente.valor === 'Fiscalía General de Justicia del Estado de México') {
                const fiscalia = yield cat_fun_dep_1.default.findOne({
                    where: {
                        nombre_dependencia: { [sequelize_1.Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
                        vigente: 1
                    },
                });
                if (fiscalia) {
                    dtSlctTemp = [{
                            id: `${proponente.id}/${fiscalia.id}`,
                            id_original: fiscalia.id,
                            valor: fiscalia.nombre_titular,
                            proponente_id: proponente.id,
                            proponente_valor: proponente.valor,
                            tipo: 'funcionario'
                        }];
                }
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
        console.log(body);
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
        const idPuntoTurnado = body.id_punto_turnado;
        let punto;
        if (idPuntoTurnado != 'null') {
            const data = yield puntos_ordens_1.default.findOne({
                where: { id: idPuntoTurnado },
            });
            if (!data) {
                throw new Error('Punto turnado no encontrado');
            }
            punto = data.punto;
        }
        else {
            punto = body.punto;
        }
        const puntonuevo = yield puntos_ordens_1.default.create({
            id_evento: evento.id,
            nopunto: body.numpunto,
            id_tipo: body.tipo,
            tribuna: body.tribuna,
            path_doc: file ? `storage/puntos/${file.filename}` : null,
            punto,
            observaciones: body.observaciones,
            se_turna_comision: body.tipo_evento == 0 ? body.se_turna_comision : 0,
        });
        if (idPuntoTurnado != 'null') {
            const puntoTurnado = yield puntos_comisiones_1.default.findOne({
                where: { id_punto: idPuntoTurnado },
            });
            if (!puntoTurnado) {
                throw new Error('Relación de punto-comisión no encontrada');
            }
            yield puntoTurnado.update({
                id_punto_turno: puntonuevo.id,
            });
        }
        for (const item of presentaArray) {
            yield puntos_presenta_1.default.create({
                id_punto: puntonuevo.id,
                id_tipo_presenta: item.proponenteId,
                id_presenta: item.autorId
            });
        }
        if (body.tipo_evento == 0) {
            for (const item of turnocomision) {
                yield puntos_comisiones_1.default.create({
                    id_punto: puntonuevo.id,
                    id_comision: item,
                });
            }
        }
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
const getpuntos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const puntos = yield puntos_ordens_1.default.findAll({
            where: { id_evento: id },
            order: [['nopunto', 'DESC']],
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
                { model: puntos_comisiones_1.default, as: "turnocomision", attributes: ["id", "id_punto", "id_comision", "id_punto_turno"] },
            ]
        });
        if (!puntos) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        console.log(puntos);
        return res.status(201).json({
            message: "Se encontraron registros",
            data: puntos,
        });
    }
    catch (error) {
        console.error("Error al guardar el punto:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.getpuntos = getpuntos;
const actualizarPunto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const { body } = req;
        const file = req.file;
        console.log(body);
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
        console.log(turnocomision);
        const punto = yield puntos_ordens_1.default.findOne({ where: { id } });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const nuevoPath = file ? `storage/puntos/${file.filename}` : punto.path_doc;
        const idPuntoTurnado = body.id_punto_turnado;
        let puntoDesc;
        if (idPuntoTurnado != 'null') {
            const puntoTurnado = yield puntos_comisiones_1.default.findOne({
                where: { id_punto_turno: punto.id },
            });
            if (puntoTurnado) {
                puntoTurnado.update({
                    id_punto_turno: null
                });
            }
            const puntoTurnadoCreate = yield puntos_ordens_1.default.findOne({
                where: { id: idPuntoTurnado },
            });
            if (!puntoTurnadoCreate || !puntoTurnadoCreate.punto) {
                throw new Error('No se encontró la descripción del punto turnado');
            }
            puntoDesc = puntoTurnadoCreate.punto;
        }
        else {
            const puntoTurnado = yield puntos_comisiones_1.default.findOne({
                where: { id_punto_turno: punto.id },
            });
            if (puntoTurnado) {
                puntoTurnado.update({
                    id_punto_turno: null
                });
            }
            puntoDesc = body.punto;
        }
        yield punto.update({
            nopunto: (_a = body.numpunto) !== null && _a !== void 0 ? _a : punto.nopunto,
            id_tipo: (_b = body.tipo) !== null && _b !== void 0 ? _b : punto.id_tipo,
            tribuna: (_c = body.tribuna) !== null && _c !== void 0 ? _c : punto.tribuna,
            path_doc: nuevoPath,
            punto: puntoDesc,
            observaciones: (_d = body.observaciones) !== null && _d !== void 0 ? _d : punto.observaciones,
            editado: 1,
            se_turna_comision: body.tipo_evento == 0 ? body.se_turna_comision : 0,
        });
        if (idPuntoTurnado != 'null') {
            const puntoTurnado = yield puntos_comisiones_1.default.findOne({
                where: { id_punto: idPuntoTurnado },
            });
            if (!puntoTurnado) {
                throw new Error('Relación de punto-comisión no encontrada');
            }
            yield puntoTurnado.update({
                id_punto_turno: punto.id,
            });
        }
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
        if (body.tipo_evento == 0) {
            yield puntos_comisiones_1.default.destroy({
                where: { id_punto: punto.id }
            });
            for (const item of turnocomision) {
                yield puntos_comisiones_1.default.create({
                    id_punto: punto.id,
                    id_comision: item,
                });
            }
        }
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
        const registros = body.id_diputado.map((diputadoId) => ({
            id_punto: body.id_punto,
            id_evento: body.id_evento,
            id_diputado: diputadoId,
            id_tipo_intervencion: body.id_tipo_intervencion,
            mensaje: body.comentario,
            tipo: body.tipo,
            destacado: body.destacada,
        }));
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
        const { id } = req.params;
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
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        const tipoEvento = esSesion ? 'sesion' : 'comision';
        const tipovento = esSesion ? 1 : 2; // 1 = Sesión, 2 = Comisiones
        let temavotos = yield temas_puntos_votos_1.default.findOne({ where: { id_punto: id } });
        let mensajeRespuesta = "Punto con votos existentes";
        if (!temavotos) {
            const listadoDiputados = yield obtenerListadoDiputados(evento);
            temavotos = yield temas_puntos_votos_1.default.create({
                id_punto: punto.id,
                id_evento: punto.id_evento,
                tema_votacion: null,
                fecha_votacion: sequelize_2.Sequelize.literal('CURRENT_TIMESTAMP'),
            });
            const votospunto = listadoDiputados.map((dip) => ({
                sentido: 0,
                mensaje: "PENDIENTE",
                id_tema_punto_voto: temavotos.id,
                id_diputado: dip.id_diputado,
                id_partido: dip.id_partido,
                id_comision_dip: dip.comision_dip_id,
                id_cargo_dip: dip.id_cargo_dip,
            }));
            yield votos_punto_1.default.bulkCreate(votospunto);
            mensajeRespuesta = "Votacion creada correctamente";
        }
        const integrantes = yield obtenerResultadosVotacionOptimizado(temavotos.id, tipoEvento);
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
function obtenerResultadosVotacionOptimizado(idTemaPuntoVoto, tipoEvento) {
    return __awaiter(this, void 0, void 0, function* () {
        const dipasociados = yield tipo_cargo_comisions_1.default.findOne({
            where: { valor: "Diputado Asociado" }
        });
        const votosRaw = yield votos_punto_1.default.findAll({
            where: {
                id_tema_punto_voto: idTemaPuntoVoto,
            },
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
        const temavotos = yield temas_puntos_votos_1.default.findOne({
            where: { id_punto: body.idpunto }
        });
        if (!temavotos) {
            return res.status(404).json({
                msg: "No se encontró el tema de votación para este punto",
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
        if (!body.idpunto) {
            return res.status(400).json({
                msg: "Falta el parámetro requerido: idpunto",
            });
        }
        const temavotos = yield temas_puntos_votos_1.default.findOne({
            where: { id_punto: body.idpunto }
        });
        if (!temavotos) {
            return res.status(404).json({
                msg: "No se encontró el tema de votación para este punto",
            });
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: 0,
            mensaje: "PENDIENTE",
        }, {
            where: {
                id_tema_punto_voto: temavotos.id,
            }
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
    try {
        const agendaBody = req.body;
        const anfitriones = req.body.autores || [];
        const agenda = yield agendas_1.default.create({
            descripcion: agendaBody.descripcion,
            fecha: agendaBody.fecha,
            sede_id: agendaBody.sede_id,
            tipo_evento_id: agendaBody.tipo_evento_id,
            transmision: agendaBody.transmite,
            liga: agendaBody.liga || null,
            fecha_hora_inicio: agendaBody.hora_inicio || null,
            fecha_hora_fin: agendaBody.hora_fin || null,
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
const updateAgenda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agendaId = req.params.id;
        const body = req.body;
        const anfitriones = req.body.autores || [];
        const agenda = yield agendas_1.default.findByPk(agendaId);
        if (!agenda) {
            return res.status(404).json({ msg: "Agenda no encontrada" });
        }
        yield agenda.update({
            descripcion: body.descripcion,
            fecha: body.fecha,
            sede_id: body.sede_id,
            tipo_evento_id: body.tipo_evento_id,
            transmision: body.transmite,
            liga: body.liga || null,
            fecha_hora_inicio: body.hora_inicio || null,
            fecha_hora_fin: body.hora_fin || null,
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
        return res.json({ response: "success", id: agendaId });
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
/////////////////////////////////
const generarPDFVotacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
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
        let temavotos = yield temas_puntos_votos_1.default.findOne({ where: { id_punto: id } });
        if (!temavotos) {
            return res.status(404).json({ msg: "No hay votaciones para este punto" });
        }
        const votosRaw = yield votos_punto_1.default.findAll({
            where: { id_tema_punto_voto: temavotos.id },
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
    // TÍTULO CENTRADO
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE VOTACIÓN', { align: 'center' });
    doc.moveDown(0.5);
    // Ordenar alfabéticamente
    const votosOrdenados = [...votos].sort((a, b) => a.diputado.localeCompare(b.diputado, 'es'));
    const startY = doc.y;
    const colX = { no: 50, diputado: 75, partido: 390, sentido: 455 };
    // Encabezado guinda #96134b
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b', '#000');
    doc.fillColor('#fff');
    doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
    doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 305 });
    doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 60 });
    doc.text('SENTIDO', colX.sentido + 3, startY + 6, { width: 85 });
    let currentY = startY + 20;
    votosOrdenados.forEach((voto, index) => {
        if (currentY > 700) {
            doc.addPage();
            drawBackground();
            currentY = 106;
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
            doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b', '#000');
            doc.fillColor('#fff');
            doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
            doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 305 });
            doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 60 });
            doc.text('SENTIDO', colX.sentido + 3, currentY + 6, { width: 85 });
            currentY += 20;
        }
        doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');
        doc.fontSize(8).font('Helvetica').fillColor('#000');
        doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
        doc.text(voto.diputado, colX.diputado + 3, currentY + 5, { width: 305, ellipsis: true });
        doc.text(voto.partido, colX.partido + 3, currentY + 5, { width: 60 });
        // Sentido con color
        doc.fillColor(getColorSentido(voto.sentidoNumerico));
        doc.text(voto.sentidoTexto, colX.sentido + 3, currentY + 5, { width: 85 });
        currentY += 18;
    });
    doc.moveDown(1.5);
}
function generarDetalleComision(doc, votos, drawBackground, getColorSentido) {
    // TÍTULO CENTRADO
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE VOTACIÓN POR COMISIÓN', { align: 'center' });
    doc.moveDown(0.5);
    // Agrupar por comisión
    const votosPorComision = votos.reduce((grupos, voto) => {
        const comision = voto.comision_nombre || 'Sin comisión';
        if (!grupos[comision]) {
            grupos[comision] = {
                nombre: comision,
                importancia: voto.comision_importancia,
                votos: []
            };
        }
        grupos[comision].votos.push(voto);
        return grupos;
    }, {});
    // Ordenar comisiones por importancia
    const comisionesOrdenadas = Object.values(votosPorComision).sort((a, b) => a.importancia - b.importancia);
    comisionesOrdenadas.forEach((comision) => {
        if (doc.y > 650) {
            doc.addPage();
            drawBackground();
            doc.y = 106;
        }
        // Título de la comisión en NEGRO
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
        doc.text(`${comision.nombre.toUpperCase()}`, 50, doc.y, { align: 'left' });
        doc.moveDown(0.5);
        // Ordenar votos por nivel de cargo
        const votosOrdenados = [...comision.votos].sort((a, b) => a.nivel_cargo - b.nivel_cargo);
        const startY = doc.y;
        const colX = { no: 50, diputado: 75, cargo: 310, partido: 410, sentido: 465 };
        // Encabezado guinda #96134b
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b', '#000');
        doc.fillColor('#fff');
        doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
        doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 225 });
        doc.text('CARGO', colX.cargo + 3, startY + 6, { width: 90 });
        doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 50 });
        doc.text('SENTIDO', colX.sentido + 3, startY + 6, { width: 75 });
        let currentY = startY + 20;
        votosOrdenados.forEach((voto, index) => {
            if (currentY > 700) {
                doc.addPage();
                drawBackground();
                currentY = 106;
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
                doc.text(`${comision.nombre.toUpperCase()}`, 50, currentY);
                currentY += 25;
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
                doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b', '#000');
                doc.fillColor('#fff');
                doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
                doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 225 });
                doc.text('CARGO', colX.cargo + 3, currentY + 6, { width: 90 });
                doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 50 });
                doc.text('SENTIDO', colX.sentido + 3, currentY + 6, { width: 75 });
                currentY += 20;
            }
            doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');
            doc.fontSize(8).font('Helvetica').fillColor('#000');
            doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
            doc.text(voto.diputado, colX.diputado + 3, currentY + 5, { width: 225, ellipsis: true });
            doc.text(voto.cargo || 'Sin cargo', colX.cargo + 3, currentY + 5, { width: 90, ellipsis: true });
            doc.text(voto.partido, colX.partido + 3, currentY + 5, { width: 50 });
            // Sentido con color
            doc.fillColor(getColorSentido(voto.sentidoNumerico));
            doc.text(voto.sentidoTexto, colX.sentido + 3, currentY + 5, { width: 75 });
            currentY += 18;
        });
        doc.moveDown(1.5);
    });
}
const enviarWhatsVotacionPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { id } = req.params;
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
        const esSesion = ((_a = evento.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === "Sesión";
        let temavotos = yield temas_puntos_votos_1.default.findOne({ where: { id_punto: id } });
        if (!temavotos) {
            return res.status(404).json({ msg: "No hay votaciones para este punto" });
        }
        const dipasociados = yield tipo_cargo_comisions_1.default.findOne({
            where: { valor: "Diputado Asociado" }
        });
        const votosRaw = yield votos_punto_1.default.findAll({
            where: { id_tema_punto_voto: temavotos.id,
            },
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
        // Ruta de la imagen de fondo
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
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
        // Detalle de votación según tipo
        if (esSesion) {
            generarDetalleSesion(doc, votosConDetalles, drawBackground, getColorSentido);
        }
        else {
            generarDetalleComision(doc, votosConDetalles, drawBackground, getColorSentido);
        }
        doc.end();
        // Esperar a que el PDF se genere completamente
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('PDF generado exitosamente en:', outputPath);
        // ===== ENVIAR POR WHATSAPP CON BASE64 =====
        // Preparar mensaje de texto
        let fechaFormateada = "";
        if (evento.fecha) {
            fechaFormateada = (0, date_fns_1.format)(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: locale_1.es });
        }
        // Obtener listado de comisiones únicas si NO es sesión
        let infoComisiones = "";
        if (!esSesion) {
            const comisionesUnicas = [...new Set(votosConDetalles
                    .map(v => v.comision_nombre)
                    .filter(nombre => nombre && nombre !== 'Sin comisión'))].sort();
            if (comisionesUnicas.length > 0) {
                infoComisiones = `\n*Comisiones:*\n${comisionesUnicas.map(c => `- ${c}`).join('\n')}\n`;
            }
        }
        const mensajeTexto = `*VOTACION - Punto ${punto.nopunto}*\n\n` +
            `*Punto:* ${punto.punto || 'N/A'}\n` +
            `*Evento:* ${((_d = evento.tipoevento) === null || _d === void 0 ? void 0 : _d.nombre) || 'N/A'}\n` +
            `*Fecha:* ${fechaFormateada}${infoComisiones}\n` +
            `*Resultados:*\n` +
            `A favor: ${totales.favor}\n` +
            `En contra: ${totales.contra}\n` +
            `Abstencion: ${totales.abstencion}\n` +
            `Pendiente: ${totales.pendiente}\n\n` +
            `Total de votos: ${totalVotos}\n\n` +
            `Adjunto PDF con detalle completo`;
        // Verificar que el archivo existe
        if (!fs_1.default.existsSync(outputPath)) {
            throw new Error('El archivo PDF no se generó correctamente');
        }
        // Leer el archivo y convertirlo a base64
        const pdfBuffer = fs_1.default.readFileSync(outputPath);
        const base64PDF = pdfBuffer.toString('base64');
        console.log('Tamaño del PDF:', pdfBuffer.length, 'bytes');
        console.log('Enviando PDF por WhatsApp...');
        // Enviar documento usando base64
        const params = {
            token: 'ml56a7d6tn7ha7cc',
            to: "+527222035605, +527224986377, +527151605569, +527222285798, +527226303741",
            // to: "+527222035605,",
            filename: fileName,
            document: base64PDF,
            caption: mensajeTexto
        };
        const whatsappResponse = yield axios_1.default.post('https://api.ultramsg.com/instance144598/messages/document', new URLSearchParams(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('Respuesta de WhatsApp API:', whatsappResponse.data);
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
                response: (_e = error.response) === null || _e === void 0 ? void 0 : _e.data
            });
        }
        return res.status(500).json({
            message: "Error al generar y enviar PDF de votación por WhatsApp",
            error: error.message,
            details: axios_1.default.isAxiosError(error) ? (_f = error.response) === null || _f === void 0 ? void 0 : _f.data : undefined
        });
    }
});
exports.enviarWhatsVotacionPDF = enviarWhatsVotacionPDF;
//////////////////////////////////
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
        // Obtener diputados
        const diputadoIds = asistenciasRaw.map(a => a.id_diputado).filter(Boolean);
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ["id", "apaterno", "amaterno", "nombres"],
            raw: true,
        });
        const diputadosMap = new Map(diputados.map(d => [d.id, d]));
        // Obtener partidos
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
        // Mapear asistencias con detalles
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
        // Calcular totales
        const totales = {
            asistencia: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 1).length,
            asistenciaZoom: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 2).length,
            pendiente: asistenciasConDetalles.filter(a => a.asistenciaNumerico === 0).length,
        };
        const totalDiputados = asistenciasConDetalles.length;
        // Crear PDF
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
        // Ruta de la imagen de fondo
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
        // Función para dibujar fondo de página
        const drawBackground = () => {
            doc.image(bgPath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.y = 106; // Fijar posición inicial después del fondo
        };
        // Dibujar fondo en la primera página
        drawBackground();
        // ===== DISEÑO DEL PDF =====
        // Encabezado
        doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
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
        // Descripción (justificada)
        doc.fontSize(11).font('Helvetica-Bold').text('Descripción: ', { continued: true });
        doc.fontSize(11).font('Helvetica').text(evento.descripcion || 'N/A', { width: 500, align: "justify" });
        doc.moveDown(1);
        // Resumen de Asistencia
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RESUMEN DE ASISTENCIA');
        doc.moveDown(0.3);
        const tableTop = doc.y;
        const colWidths = [120, 120, 120, 100];
        const rowHeight = 25;
        // Encabezados de tabla
        doc.fontSize(11).font('Helvetica-Bold');
        // ASISTENCIA - Verde
        doc.rect(50, tableTop, colWidths[0], rowHeight).fillAndStroke('#22c55e', '#000');
        doc.fillColor('#fff').text('ASISTENCIA', 55, tableTop + 7, { width: colWidths[0] - 10, align: 'center' });
        // ASISTENCIA ZOOM - Azul
        doc.rect(50 + colWidths[0], tableTop, colWidths[1], rowHeight).fillAndStroke('#3b82f6', '#000');
        doc.fillColor('#fff').text('ASISTENCIA ZOOM', 50 + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] - 10, align: 'center' });
        // PENDIENTE - Amarillo
        doc.rect(50 + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).fillAndStroke('#f59e0b', '#000');
        doc.fillColor('#fff').text('PENDIENTE', 50 + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });
        // TOTAL - Gris
        doc.rect(50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).fillAndStroke('#6b7280', '#000');
        doc.fillColor('#fff').text('TOTAL', 50 + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });
        // Valores
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
        // ===== DETALLE DE ASISTENCIA SEGÚN TIPO DE EVENTO =====
        if (esSesion) {
            generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        else {
            generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        doc.end();
        // Esperar a que se generen todas las páginas
        yield new Promise((resolve) => setTimeout(resolve, 100));
        // DESPUÉS agregar pie de página a TODAS las páginas ya generadas
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
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE ASISTENCIA', { align: 'center' });
    doc.moveDown(0.5);
    // Ordenar alfabéticamente
    const asistenciasOrdenadas = [...asistencias].sort((a, b) => a.diputado.localeCompare(b.diputado, 'es'));
    const startY = doc.y;
    const colX = { no: 50, diputado: 75, partido: 390, asistencia: 455 };
    // Encabezado con estilo de votaciones
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b');
    doc.fillColor('#fff');
    doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
    doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 305 });
    doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 60 });
    doc.text('ASISTENCIA', colX.asistencia + 3, startY + 6, { width: 85 });
    let currentY = startY + 20;
    asistenciasOrdenadas.forEach((asist, index) => {
        if (currentY > 700) {
            doc.addPage();
            drawBackground(); // Dibujar fondo en nueva página
            currentY = 106; // Posición inicial después del fondo
            // Re-dibujar encabezado
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
            doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b');
            doc.fillColor('#fff');
            doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
            doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 305 });
            doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 60 });
            doc.text('ASISTENCIA', colX.asistencia + 3, currentY + 6, { width: 85 });
            currentY += 20;
        }
        // Borde de fila
        doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');
        doc.fontSize(8).font('Helvetica').fillColor('#000');
        doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
        doc.text(asist.diputado, colX.diputado + 3, currentY + 5, { width: 305, ellipsis: true });
        doc.text(asist.partido, colX.partido + 3, currentY + 5, { width: 60 });
        // Asistencia con color
        const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
        doc.fillColor(colorAsistencia);
        doc.text(asist.asistenciaTexto, colX.asistencia + 3, currentY + 5, { width: 85 });
        currentY += 18;
    });
    doc.moveDown(1.5);
}
function generarDetalleComisionAsistencia(doc, asistencias, drawBackground) {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('DETALLE DE ASISTENCIA POR COMISIÓN', { align: 'center' });
    doc.moveDown(0.5);
    // Agrupar por comisión
    const asistenciasPorComision = asistencias.reduce((grupos, asist) => {
        const comision = asist.comision_nombre || 'Sin comisión';
        if (!grupos[comision]) {
            grupos[comision] = {
                nombre: comision,
                importancia: asist.comision_importancia,
                asistencias: []
            };
        }
        grupos[comision].asistencias.push(asist);
        return grupos;
    }, {});
    // Ordenar comisiones por importancia
    const comisionesOrdenadas = Object.values(asistenciasPorComision).sort((a, b) => a.importancia - b.importancia);
    comisionesOrdenadas.forEach((comision) => {
        // Verificar espacio para título + tabla (necesita al menos 100px)
        if (doc.y > 650) {
            doc.addPage();
            drawBackground(); // Dibujar fondo en nueva página
            doc.y = 106; // Posición inicial después del fondo
        }
        // Título de la comisión
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
        doc.text(comision.nombre.toUpperCase(), 50, doc.y, { align: 'left' });
        doc.moveDown(0.5);
        // Ordenar asistencias por nivel de cargo
        const asistenciasOrdenadas = [...comision.asistencias].sort((a, b) => a.nivel_cargo - b.nivel_cargo);
        const startY = doc.y;
        const colX = { no: 50, diputado: 75, cargo: 310, partido: 410, asistencia: 465 };
        // Encabezado con estilo de votaciones
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.rect(colX.no, startY, 495, 20).fillAndStroke('#96134b');
        doc.fillColor('#fff');
        doc.text('No.', colX.no + 3, startY + 6, { width: 18 });
        doc.text('DIPUTADO', colX.diputado + 3, startY + 6, { width: 225 });
        doc.text('CARGO', colX.cargo + 3, startY + 6, { width: 90 });
        doc.text('PARTIDO', colX.partido + 3, startY + 6, { width: 50 });
        doc.text('ASISTENCIA', colX.asistencia + 3, startY + 6, { width: 75 });
        let currentY = startY + 20;
        asistenciasOrdenadas.forEach((asist, index) => {
            // Verificar espacio para nueva fila
            if (currentY > 700) {
                doc.addPage();
                drawBackground(); // Dibujar fondo en nueva página
                currentY = 106; // Empezar después del fondo
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
                doc.text(`${comision.nombre.toUpperCase()}`, 50, currentY);
                currentY += 25;
                // Re-dibujar encabezado
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
                doc.rect(colX.no, currentY, 495, 20).fillAndStroke('#96134b');
                doc.fillColor('#fff');
                doc.text('No.', colX.no + 3, currentY + 6, { width: 18 });
                doc.text('DIPUTADO', colX.diputado + 3, currentY + 6, { width: 225 });
                doc.text('CARGO', colX.cargo + 3, currentY + 6, { width: 90 });
                doc.text('PARTIDO', colX.partido + 3, currentY + 6, { width: 50 });
                doc.text('ASISTENCIA', colX.asistencia + 3, currentY + 6, { width: 75 });
                currentY += 20;
            }
            // Borde de fila
            doc.rect(colX.no, currentY, 495, 18).stroke('#d1d5db');
            doc.fontSize(8).font('Helvetica').fillColor('#000');
            doc.text(`${index + 1}`, colX.no + 3, currentY + 5, { width: 18 });
            doc.text(asist.diputado, colX.diputado + 3, currentY + 5, { width: 225, ellipsis: true });
            doc.text(asist.cargo_nombre || 'Sin cargo', colX.cargo + 3, currentY + 5, { width: 90, ellipsis: true });
            doc.text(asist.partido, colX.partido + 3, currentY + 5, { width: 50 });
            // Asistencia con color
            const colorAsistencia = getColorAsistencia(asist.asistenciaNumerico);
            doc.fillColor(colorAsistencia);
            doc.text(asist.asistenciaTexto, colX.asistencia + 3, currentY + 5, { width: 75 });
            currentY += 18;
        });
        doc.moveDown(1.5);
    });
}
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
        // Ruta de la imagen de fondo
        const bgPath = path_1.default.join(__dirname, "../assets/membretesecretariaejecutiva4.jpg");
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
        doc.fontSize(12).font('Helvetica-Bold').text('REGISTRO DE ASISTENCIA', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text('Legislatura del Estado de México', { align: 'center' });
        doc.moveDown(1);
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
        doc.moveDown(1);
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
        if (esSesion) {
            generarDetalleSesionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        else {
            generarDetalleComisionAsistencia(doc, asistenciasConDetalles, drawBackground);
        }
        // FINALIZAR PDF
        doc.end();
        // ESPERAR A QUE EL ARCHIVO SE ESCRIBA COMPLETAMENTE
        yield new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('PDF de asistencia generado exitosamente en:', outputPath);
        // ===== ENVIAR POR WHATSAPP =====
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
        const mensajeTexto = `*ASISTENCIA - ${((_d = evento.tipoevento) === null || _d === void 0 ? void 0 : _d.nombre) || 'Evento'}*\n\n` +
            `*Descripcion:* ${evento.descripcion || 'N/A'}\n` +
            `*Sede:* ${((_e = evento.sede) === null || _e === void 0 ? void 0 : _e.sede) || 'N/A'}\n` +
            `*Fecha:* ${fechaFormateada}${infoComisiones}\n` +
            `*Resumen:*\n` +
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
        console.log('Tamaño del PDF:', pdfBuffer.length, 'bytes');
        console.log('Enviando PDF por WhatsApp...');
        const params = {
            token: 'ml56a7d6tn7ha7cc',
            to: "+527222035605, +527224986377, +527151605569, +527222285798",
            filename: fileName,
            document: base64PDF,
            caption: mensajeTexto
        };
        const whatsappResponse = yield axios_1.default.post('https://api.ultramsg.com/instance144598/messages/document', new URLSearchParams(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('Respuesta de WhatsApp API:', whatsappResponse.data);
        return res.status(200).json({
            message: "PDF de asistencia generado y enviado por WhatsApp correctamente",
            enviado: true,
            archivo: fileName,
            totales,
            whatsappResponse: whatsappResponse.data
        });
    }
    catch (error) {
        console.error("Error completo al generar y enviar PDF de asistencia:", error);
        if (axios_1.default.isAxiosError(error)) {
            console.error("Error de Axios:", {
                message: error.message,
                code: error.code,
                response: (_f = error.response) === null || _f === void 0 ? void 0 : _f.data
            });
        }
        return res.status(500).json({
            message: "Error al generar y enviar PDF de asistencia por WhatsApp",
            error: error.message,
            details: axios_1.default.isAxiosError(error) ? (_g = error.response) === null || _g === void 0 ? void 0 : _g.data : undefined
        });
    }
});
exports.enviarWhatsAsistenciaPDF = enviarWhatsAsistenciaPDF;
