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
exports.exporpuntos = exports.deleteEvento = exports.terminarvotacion = exports.getifnini = exports.selectiniciativas = exports.crariniidits = exports.getiniciativas = exports.eliminariniciativa = exports.creariniciativa = exports.actvototodos = exports.actualizartodos = exports.cargoDiputados = void 0;
const agendas_1 = __importDefault(require("../models/agendas"));
const sedes_1 = __importDefault(require("../models/sedes"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const sequelize_1 = require("sequelize");
const temas_puntos_votos_1 = __importDefault(require("../models/temas_puntos_votos"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../models/iniciativas_estudio"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const comisions_1 = __importDefault(require("../models/comisions"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const puntos_comisiones_1 = __importDefault(require("../models/puntos_comisiones"));
const puntos_presenta_1 = __importDefault(require("../models/puntos_presenta"));
const proponentes_1 = __importDefault(require("../models/proponentes"));
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const secretarias_1 = __importDefault(require("../models/secretarias"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const partidos_1 = __importDefault(require("../models/partidos"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const diputado_1 = __importDefault(require("../models/diputado"));
const expedientes_estudio_puntos_1 = __importDefault(require("../models/expedientes_estudio_puntos"));
const iniciativaspresenta_1 = __importDefault(require("../models/iniciativaspresenta"));
const cargoDiputados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('holi');
        const diputados = yield votos_punto_1.default.findAll({
            where: {
                id_comision_dip: {
                    [sequelize_1.Op.ne]: null
                }
            }
        });
        for (const dips of diputados) {
            const integrante = yield integrante_legislaturas_1.default.findOne({
                where: {
                    diputado_id: dips.id_diputado
                }
            });
            const comision = yield integrante_comisions_1.default.findOne({
                where: {
                    comision_id: dips.id_comision_dip,
                    integrante_legislatura_id: integrante === null || integrante === void 0 ? void 0 : integrante.id
                }
            });
            if (comision) {
                yield dips.update({ id_cargo_dip: comision.tipo_cargo_comision_id });
                console.log('entre comision');
            }
        }
        return res.status(200).json({
            msg: "Exito",
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
exports.cargoDiputados = cargoDiputados;
const actualizartodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const voto = yield asistencia_votos_1.default.findAll({
            where: {
                id_agenda: body.id,
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
                id_agenda: body.id,
            },
        });
        return res.status(200).json({
            msg: "Actualizados correctamente",
            estatus: 200,
        });
    }
    catch (error) {
        console.error('Error al actualizar toda la asistencia:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            estatus: 500,
            error: error.message
        });
    }
});
exports.actualizartodos = actualizartodos;
const actvototodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!body.idpunto || body.sentido === undefined) {
            return res.status(400).json({
                msg: "Faltan datos requeridos: idpunto y sentido",
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
                where: { id: body.idpunto }
            });
            if (!punto) {
                return res.status(404).json({
                    msg: "No se encontró el punto",
                });
            }
            whereCondition = { id_punto: punto.id };
        }
        let nuevoSentido;
        let nuevoMensaje;
        switch (body.sentido) {
            case 0:
                nuevoSentido = 0;
                nuevoMensaje = "PENDIENTE";
                break;
            case 1:
                nuevoSentido = 1;
                nuevoMensaje = "A FAVOR";
                break;
            case 2:
                nuevoSentido = 2;
                nuevoMensaje = "ABSTENCIÓN";
                break;
            case 3:
                nuevoSentido = 3;
                nuevoMensaje = "EN CONTRA";
                break;
            default:
                return res.status(400).json({
                    msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (A FAVOR), 2 (ABSTENCIÓN) o 3 (EN CONTRA)",
                });
        }
        const [cantidadActualizada] = yield votos_punto_1.default.update({
            sentido: nuevoSentido,
            mensaje: nuevoMensaje,
        }, {
            where: whereCondition
        });
        if (cantidadActualizada === 0) {
            return res.status(404).json({
                msg: "No se encontraron votos para actualizar",
            });
        }
        return res.status(200).json({
            msg: "Voto(s) actualizado(s) correctamente",
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
exports.actvototodos = actvototodos;
const creariniciativa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: body.punto },
        });
        const presentaArray = (Array.isArray(body.id_presenta)
            ? body.id_presenta
            : (body.id_presenta || "").split(","))
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .map((item) => {
            const [proponenteId, autorId] = item.split('/');
            return {
                proponenteId: parseInt(proponenteId),
                autorId: autorId
            };
        });
        // console.log(presentaArray)
        // return 500
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const iniciativa = yield inciativas_puntos_ordens_1.default.create({
            id_punto: punto.id,
            id_evento: punto.id_evento,
            iniciativa: body.descripcion,
            fecha_votacion: null,
            status: 1,
        });
        for (const item of presentaArray) {
            yield iniciativaspresenta_1.default.create({
                id_iniciativa: iniciativa.id,
                id_tipo_presenta: item.proponenteId,
                id_presenta: item.autorId
            });
        }
        return res.status(200).json({
            message: "Iniciativa creada exitosamente",
        });
    }
    catch (error) {
        console.error("Error al crear la iniciativa:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.creariniciativa = creariniciativa;
const eliminariniciativa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
            where: { id }
        });
        if (!iniciativa) {
            return res.status(404).json({ message: "Iniciativa no encontrada" });
        }
        // await VotosPunto.destroy({
        //   where: { id_tema_punto_voto: id }
        // });
        yield iniciativa.destroy();
        return res.status(200).json({
            message: "Iniciativa eliminada correctamente",
        });
    }
    catch (error) {
        console.error("Error al eliminar la iniciativa:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.eliminariniciativa = eliminariniciativa;
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
            const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta } });
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
const getiniciativas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const iniciativasRaw = yield inciativas_puntos_ordens_1.default.findAll({
            where: { id_punto: id },
            attributes: ["id", "iniciativa"],
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
        });
        if (!iniciativasRaw) {
            return res.status(404).json({ message: "No tiene iniciativas" });
        }
        // 👇 Procesar cada iniciativa con sus presentan
        const iniciativas = yield Promise.all(iniciativasRaw.map((ini) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const data = ini.toJSON();
            const { proponentesString, presentaString } = ((_a = data.presentan) === null || _a === void 0 ? void 0 : _a.length)
                ? yield procesarPresentan(data.presentan)
                : { proponentesString: '', presentaString: '' };
            return {
                id: data.id,
                iniciativa: data.iniciativa,
                proponente: proponentesString,
                presenta: presentaString
            };
        })));
        return res.status(200).json({
            data: iniciativas,
        });
    }
    catch (error) {
        console.error("Error al obtener las iniciativas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getiniciativas = getiniciativas;
const crariniidits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: body.punto },
        });
        if (!punto) {
            return res.status(404).json({ message: "Punto no encontrado" });
        }
        const iniciativa = yield inciativas_puntos_ordens_1.default.findOne({
            where: { id: body.iniciativa },
        });
        if (iniciativa) {
            yield iniciativa.update({ id_punto: punto.id });
        }
        const presentaArray = (Array.isArray(body.id_presenta)
            ? body.id_presenta
            : (body.id_presenta || "").split(","))
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .map((item) => {
            const [proponenteId, autorId] = item.split('/');
            return {
                proponenteId: parseInt(proponenteId),
                autorId: autorId
            };
        });
        for (const item of presentaArray) {
            yield iniciativaspresenta_1.default.create({
                id_iniciativa: iniciativa.id,
                id_tipo_presenta: item.proponenteId,
                id_presenta: item.autorId
            });
        }
        return res.status(200).json({
            message: "Iniciativa actualizada correctamente",
        });
    }
    catch (error) {
        console.error("Error al actualizar la iniciativa:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.crariniidits = crariniidits;
const selectiniciativas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iniciativa = yield inciativas_puntos_ordens_1.default.findAll({
            // where: { 
            //   id: {
            //     [Op.in]: ['1072', '792','']
            //   }
            // },
            attributes: ["id", "iniciativa"]
        });
        return res.status(200).json({
            data: iniciativa,
        });
    }
    catch (error) {
        console.error("Error al obtener las iniciativas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.selectiniciativas = selectiniciativas;
const formatearFecha = (fecha) => {
    if (!fecha)
        return '';
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const date = new Date(fecha);
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const anio = date.getUTCFullYear();
    return `${dia} de ${mes} de ${anio}`;
};
const getAnfitriones = (eventoId, tipoEventoNombre) => __awaiter(void 0, void 0, void 0, function* () {
    if (!eventoId || tipoEventoNombre === 'Sesión')
        return {};
    const anfitriones = yield anfitrion_agendas_1.default.findAll({
        where: { agenda_id: eventoId },
        attributes: ["autor_id"],
        raw: true
    });
    const comisionIds = anfitriones.map((a) => a.autor_id).filter(Boolean);
    if (comisionIds.length === 0)
        return { comisiones: null };
    const comisiones = yield comisions_1.default.findAll({
        where: { id: comisionIds },
        attributes: ['nombre'],
        raw: true,
    });
    return {
        comisiones: comisiones.map((c) => c.nombre).join(', ')
    };
});
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
const getifnini = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { id } = req.params;
        const iniciativas = yield inciativas_puntos_ordens_1.default.findAll({
            where: { id: id },
            attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente"],
            include: [
                {
                    model: puntos_ordens_1.default,
                    as: 'punto',
                    attributes: ["id", "punto", "nopunto", "tribuna"],
                    include: [
                        {
                            model: iniciativas_estudio_1.default,
                            as: 'estudio',
                            attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"], // 👈 cambió de id_punto_evento
                            required: false,
                            where: {
                                type: 1
                            },
                            include: [
                                {
                                    model: puntos_ordens_1.default,
                                    as: 'iniciativa', // 👈 cambió de 'puntoEvento'
                                    attributes: ["id", "punto", "nopunto", "tribuna"],
                                    include: [
                                        {
                                            model: agendas_1.default,
                                            as: 'evento',
                                            attributes: ["id", "fecha", "descripcion", "liga"],
                                            include: [
                                                {
                                                    model: tipo_eventos_1.default,
                                                    as: 'tipoevento',
                                                    attributes: ["nombre"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: expedientes_estudio_puntos_1.default,
                    as: 'expedienteturno',
                    attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
                    include: [
                        {
                            model: iniciativas_estudio_1.default,
                            as: 'estudio',
                            attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"], // 👈 cambió de id_punto_evento
                            required: false,
                            include: [
                                {
                                    model: puntos_ordens_1.default,
                                    as: 'iniciativa', // 👈 cambió de 'puntoEvento'
                                    attributes: ["id", "punto", "nopunto", "tribuna"],
                                    include: [
                                        {
                                            model: agendas_1.default,
                                            as: 'evento',
                                            attributes: ["id", "fecha", "descripcion", "liga"],
                                            include: [
                                                {
                                                    model: tipo_eventos_1.default,
                                                    as: 'tipoevento',
                                                    attributes: ["nombre"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: agendas_1.default,
                    as: 'evento',
                    attributes: ["id", "fecha", "descripcion", "liga"],
                    include: [
                        {
                            model: tipo_eventos_1.default,
                            as: 'tipoevento',
                            attributes: ["nombre"]
                        }
                    ]
                }
            ]
        });
        let presentan = null;
        let proponentesString = '';
        let presentaString = '';
        if (((_a = iniciativas[0]) === null || _a === void 0 ? void 0 : _a.id_punto) != null) {
            presentan = yield puntos_presenta_1.default.findAll({
                where: { id_punto: iniciativas[0].id_punto },
                include: [{
                        model: proponentes_1.default,
                        as: 'tipo_presenta',
                        attributes: ["valor"]
                    }]
            });
        }
        if (presentan) {
            const proponentesUnicos = new Map(); // para no repetir
            const presentanData = [];
            for (const p of presentan) {
                const tipoValor = p.tipo_presenta.valor;
                let valor = '';
                if (tipoValor === 'Diputadas y Diputados') {
                    const dip = yield diputado_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = `${(_b = dip === null || dip === void 0 ? void 0 : dip.apaterno) !== null && _b !== void 0 ? _b : ''} ${(_c = dip === null || dip === void 0 ? void 0 : dip.amaterno) !== null && _c !== void 0 ? _c : ''} ${(_d = dip === null || dip === void 0 ? void 0 : dip.nombres) !== null && _d !== void 0 ? _d : ''}`.trim();
                }
                else if (['Mesa Directiva en turno', 'Junta de Coordinación Politica', 'Comisiones Legislativas', 'Diputación Permanente'].includes(tipoValor)) {
                    const comi = yield comisions_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = (_e = comi === null || comi === void 0 ? void 0 : comi.nombre) !== null && _e !== void 0 ? _e : '';
                }
                else if (['Ayuntamientos', 'Municipios'].includes(tipoValor)) {
                    const muni = yield municipiosag_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = (_f = muni === null || muni === void 0 ? void 0 : muni.nombre) !== null && _f !== void 0 ? _f : '';
                }
                else if (tipoValor === 'Grupo Parlamentario') {
                    const partido = yield partidos_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = (_g = partido === null || partido === void 0 ? void 0 : partido.nombre) !== null && _g !== void 0 ? _g : '';
                }
                else if (tipoValor === 'Legislatura') {
                    const leg = yield legislaturas_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = (_h = leg === null || leg === void 0 ? void 0 : leg.numero) !== null && _h !== void 0 ? _h : '';
                }
                else if (tipoValor === 'Secretarías del GEM') {
                    const sec = yield secretarias_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = `${(_j = sec === null || sec === void 0 ? void 0 : sec.nombre) !== null && _j !== void 0 ? _j : ''} / ${(_k = sec === null || sec === void 0 ? void 0 : sec.titular) !== null && _k !== void 0 ? _k : ''}`;
                }
                else {
                    const cat = yield cat_fun_dep_1.default.findOne({ where: { id: p.id_presenta } });
                    valor = (_l = cat === null || cat === void 0 ? void 0 : cat.nombre_titular) !== null && _l !== void 0 ? _l : '';
                }
                // Proponente único (sin repetir)
                if (!proponentesUnicos.has(tipoValor)) {
                    proponentesUnicos.set(tipoValor, tipoValor);
                }
                presentanData.push({
                    proponente: tipoValor,
                    valor,
                    id_presenta: p.id_presenta,
                });
            }
            proponentesString = Array.from(proponentesUnicos.keys()).join(", ");
            presentaString = presentanData.map(p => p.valor).join(', ');
        }
        const trazaIniciativas = yield Promise.all(iniciativas.map((iniciativa) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const data = iniciativa.toJSON();
            console.log("DATA INICIATIVA:");
            console.log(data);
            const todosEstudios = [
                ...(Array.isArray((_a = data.punto) === null || _a === void 0 ? void 0 : _a.estudio) ? data.punto.estudio : []),
                ...(Array.isArray(data.expedienteturno)
                    ? data.expedienteturno.flatMap((exp) => Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : [])
                    : [])
            ];
            console.log("TODOS ESTUDIOS:");
            console.log(todosEstudios);
            const fuenteEstudios = todosEstudios.filter((e, index, self) => index === self.findIndex((x) => x.id === e.id));
            const estudios = fuenteEstudios.filter((e) => e.status === "1");
            const dictamenes = fuenteEstudios.filter((e) => e.status === "2");
            const rechazadocomi = fuenteEstudios.filter((e) => e.status === "4");
            const rechazosesion = fuenteEstudios.filter((e) => e.status === "5");
            // -----------------------------
            // NUEVO: buscar cierres por varios puntos
            // -----------------------------
            const posiblesPuntosIds = [
                (_b = data.punto) === null || _b === void 0 ? void 0 : _b.id,
                ...fuenteEstudios.map((e) => e.punto_destino_id).filter(Boolean)
            ];
            const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds)];
            console.log("POSIBLES PUNTOS PARA CIERRE:");
            console.log(posiblesPuntosUnicos);
            // 1. Buscar si alguno de esos puntos está en expedientes_estudio_puntos
            const expedientesRelacionados = yield expedientes_estudio_puntos_1.default.findAll({
                where: {
                    punto_origen_sesion_id: {
                        [sequelize_1.Op.in]: posiblesPuntosUnicos
                    }
                },
                attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
            });
            console.log("EXPEDIENTES RELACIONADOS:");
            console.log(expedientesRelacionados.map((e) => e.toJSON()));
            // 2. Sacar los expediente_id encontrados
            const expedienteIds = [
                ...new Set(expedientesRelacionados
                    .map((e) => e.expediente_id)
                    .filter(Boolean))
            ];
            console.log("EXPEDIENTE IDS:");
            console.log(expedienteIds);
            // 3. Buscar cierres:
            //    a) directos por punto_origen_id = 201, etc.
            //    b) o por expediente_id encontrado = 49, etc.
            const cierresDB = yield iniciativas_estudio_1.default.findAll({
                where: {
                    status: "3",
                    [sequelize_1.Op.or]: [
                        {
                            punto_origen_id: {
                                [sequelize_1.Op.in]: posiblesPuntosUnicos
                            }
                        },
                        {
                            punto_origen_id: {
                                [sequelize_1.Op.in]: expedienteIds
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: puntos_ordens_1.default,
                        as: "iniciativa",
                        attributes: ["id", "punto", "nopunto", "tribuna"],
                        include: [
                            {
                                model: agendas_1.default,
                                as: "evento",
                                attributes: ["id", "fecha", "descripcion", "liga"],
                                include: [
                                    {
                                        model: tipo_eventos_1.default,
                                        as: "tipoevento",
                                        attributes: ["nombre"]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            console.log("CIERRES DB:");
            console.log(cierresDB.map((c) => c.toJSON()));
            // 4. Unir con los que ya venían en fuenteEstudios
            const cierresMerge = [
                ...fuenteEstudios.filter((e) => e.status === "3"),
                ...cierresDB.map((c) => c.toJSON())
            ];
            // 5. Quitar duplicados por id
            const cierres = cierresMerge.filter((e, index, self) => index === self.findIndex((x) => x.id === e.id));
            console.log("CIERRES FINALES:");
            console.log(cierres);
            // -----------------------------
            // resto de tu lógica
            // -----------------------------
            const anfitrionesNacio = yield getAnfitriones((_c = data.evento) === null || _c === void 0 ? void 0 : _c.id, (_e = (_d = data.evento) === null || _d === void 0 ? void 0 : _d.tipoevento) === null || _e === void 0 ? void 0 : _e.nombre);
            const tribunainicio = yield diputado_1.default.findOne({
                where: { id: (_f = data.punto) === null || _f === void 0 ? void 0 : _f.tribuna },
            });
            const tribuna = tribunainicio
                ? [tribunainicio.nombres, tribunainicio.apaterno, tribunainicio.amaterno]
                    .filter(Boolean)
                    .join(" ")
                : null;
            const turnadoInfo = yield getComisionesTurnado((_g = data.punto) === null || _g === void 0 ? void 0 : _g.id);
            const estudiosConInfo = yield Promise.all(estudios.map((e) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const eventoEstudio = (_a = e.iniciativa) === null || _a === void 0 ? void 0 : _a.evento;
                const anfitriones = yield getAnfitriones(eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.id, (_b = eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre);
                return Object.assign({ id: e.id, evento: eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.id, fecha: formatearFecha(e.createdAt), tipo_evento: (_c = eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre, fecha_evento: formatearFecha(eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.fecha), liga: eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.liga, descripcion_evento: eventoEstudio === null || eventoEstudio === void 0 ? void 0 : eventoEstudio.descripcion, numpunto: (_d = e.iniciativa) === null || _d === void 0 ? void 0 : _d.nopunto, punto: (_e = e.iniciativa) === null || _e === void 0 ? void 0 : _e.punto }, anfitriones);
            })));
            const dictamenesConInfo = yield Promise.all(dictamenes.map((d) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const eventoDict = (_a = d.iniciativa) === null || _a === void 0 ? void 0 : _a.evento;
                const anfitriones = yield getAnfitriones(eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.id, (_b = eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.tipoevento) === null || _b === void 0 ? void 0 : _b.nombre);
                return Object.assign({ id: d.id, evento: eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.id, fecha: formatearFecha(d.createdAt), tipo_evento: (_c = eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre, fecha_evento: formatearFecha(eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.fecha), liga: eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.liga, votacionid: (_d = d.iniciativa) === null || _d === void 0 ? void 0 : _d.id, descripcion_evento: eventoDict === null || eventoDict === void 0 ? void 0 : eventoDict.descripcion, numpunto: (_e = d.iniciativa) === null || _e === void 0 ? void 0 : _e.nopunto, punto: (_f = d.iniciativa) === null || _f === void 0 ? void 0 : _f.punto }, anfitriones);
            })));
            const cierresConInfo = yield Promise.all(cierres.map((c) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const eventoCierre = (_a = c.iniciativa) === null || _a === void 0 ? void 0 : _a.evento;
                const tribuna1 = ((_b = c.iniciativa) === null || _b === void 0 ? void 0 : _b.tribuna)
                    ? yield diputado_1.default.findOne({
                        where: { id: c.iniciativa.tribuna },
                    })
                    : null;
                const tribuna = tribuna1
                    ? [tribuna1.nombres, tribuna1.apaterno, tribuna1.amaterno]
                        .filter(Boolean)
                        .join(" ")
                    : null;
                return {
                    id: c.id,
                    punto_origen_id: c.punto_origen_id,
                    punto_destino_id: c.punto_destino_id,
                    evento: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.id,
                    tipo_evento: (_c = eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre,
                    fecha: formatearFecha(eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.fecha),
                    descripcion_evento: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.descripcion,
                    liga: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.liga,
                    votacionid: (_d = c.iniciativa) === null || _d === void 0 ? void 0 : _d.id,
                    numpunto: (_e = c.iniciativa) === null || _e === void 0 ? void 0 : _e.nopunto,
                    punto: (_f = c.iniciativa) === null || _f === void 0 ? void 0 : _f.punto,
                    tribuna,
                };
            })));
            console.log("CIERRE INFO:");
            console.log(cierresConInfo);
            const ReSesion = yield Promise.all(rechazosesion.map((s) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const eventoCierre = (_a = s.iniciativa) === null || _a === void 0 ? void 0 : _a.evento;
                const tribuna1 = yield diputado_1.default.findOne({
                    where: { id: (_b = s.iniciativa) === null || _b === void 0 ? void 0 : _b.tribuna },
                });
                const tribuna = tribuna1
                    ? [tribuna1.nombres, tribuna1.apaterno, tribuna1.amaterno]
                        .filter(Boolean)
                        .join(" ")
                    : null;
                return {
                    evento: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.id,
                    tipo_evento: (_c = eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.tipoevento) === null || _c === void 0 ? void 0 : _c.nombre,
                    fecha: formatearFecha(eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.fecha),
                    descripcion_evento: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.descripcion,
                    liga: eventoCierre === null || eventoCierre === void 0 ? void 0 : eventoCierre.liga,
                    votacionid: (_d = s.iniciativa) === null || _d === void 0 ? void 0 : _d.id,
                    numpunto: (_e = s.iniciativa) === null || _e === void 0 ? void 0 : _e.nopunto,
                    punto: (_f = s.iniciativa) === null || _f === void 0 ? void 0 : _f.punto,
                    tribuna,
                };
            })));
            return {
                nacio: Object.assign(Object.assign({ evento: (_h = data.evento) === null || _h === void 0 ? void 0 : _h.id, tipo_evento: (_k = (_j = data.evento) === null || _j === void 0 ? void 0 : _j.tipoevento) === null || _k === void 0 ? void 0 : _k.nombre, fecha: formatearFecha((_l = data.evento) === null || _l === void 0 ? void 0 : _l.fecha), descripcion_evento: (_m = data.evento) === null || _m === void 0 ? void 0 : _m.descripcion, numpunto: (_o = data.punto) === null || _o === void 0 ? void 0 : _o.nopunto, punto: (_p = data.punto) === null || _p === void 0 ? void 0 : _p.punto, liga: (_q = data.evento) === null || _q === void 0 ? void 0 : _q.liga, tribuna }, turnadoInfo), anfitrionesNacio),
                estudio: estudiosConInfo,
                dictamen: dictamenesConInfo,
                cierre: cierresConInfo.length > 0 ? cierresConInfo[0] : null,
                rechazadose: ReSesion,
            };
        })));
        // console.log(trazaIniciativas);
        // return 500;
        return res.status(200).json({
            proponentesString,
            presentaString,
            data: trazaIniciativas,
        });
    }
    catch (error) {
        console.error("Error al obtener las iniciativas:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
});
exports.getifnini = getifnini;
const terminarvotacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const iniestudio = yield iniciativas_estudio_1.default.findOne({
            where: { punto_destino_id: id },
        });
        console.log("Lo encontreeeeeeeeeeeeeeeeeeeeeeeee:", iniestudio);
        if (!iniestudio) {
            return res.status(404).json({ message: "No tiene ninguna iniciativa" });
        }
        const punto = yield puntos_ordens_1.default.findOne({
            where: { id: id },
            include: [
                {
                    model: agendas_1.default,
                    as: 'evento',
                    include: [
                        {
                            model: tipo_eventos_1.default,
                            as: 'tipoevento',
                            attributes: ['nombre']
                        }
                    ]
                }
            ]
        });
        const votos = yield votos_punto_1.default.findAll({
            where: {
                id_punto: id,
                id_tema_punto_voto: null
            }
        });
        if (votos.length > 0 && punto) {
            let condicion;
            const totalVotos = votos.length;
            const votosAFavor = votos.filter((v) => v.sentido === 1).length;
            const mayoria = Math.floor(totalVotos / 2) + 1;
            const aprobado = votosAFavor >= mayoria;
            if (punto.evento.tipoevento.nombre == "Comisión") {
                condicion = aprobado ? 2 : 4;
            }
            else {
                condicion = aprobado ? 3 : 5;
            }
            yield iniestudio.update({ status: condicion });
            return res.status(200).json("actualizado");
        }
        return res.status(404).json({ message: "Sin votos" });
    }
    catch (error) {
        console.error('Error al terminar la votacion:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.terminarvotacion = terminarvotacion;
const deleteEvento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const puntos = yield puntos_ordens_1.default.findAll({
            where: { id_evento: id },
            attributes: ['id']
        });
        const puntoIds = puntos.map((p) => p.id);
        if (puntoIds.length > 0) {
            yield inciativas_puntos_ordens_1.default.destroy({ where: { id_punto: puntoIds } });
            yield iniciativas_estudio_1.default.destroy({ where: { punto_origen_id: puntoIds } });
            yield iniciativas_estudio_1.default.destroy({ where: { punto_destino_id: puntoIds } });
            yield puntos_presenta_1.default.destroy({ where: { id_punto: puntoIds } });
            yield puntos_comisiones_1.default.destroy({ where: { id_punto: puntoIds } });
            yield puntos_ordens_1.default.destroy({ where: { id_evento: id } });
        }
        yield anfitrion_agendas_1.default.destroy({ where: { agenda_id: id } });
        const deleted = yield agendas_1.default.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        return res.status(200).json({ message: "Evento eliminado correctamente" });
    }
    catch (error) {
        console.error("Error al eliminar el evento:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.deleteEvento = deleteEvento;
const exporpuntos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventos = yield agendas_1.default.findAll({
            where: { tipo_evento_id: "0e772516-bbc2-402f-afa0-022489752d33" },
            include: [
                { model: sedes_1.default, as: "sede", attributes: ["id", "sede"] },
                { model: tipo_eventos_1.default, as: "tipoevento", attributes: ["id", "nombre"] },
            ],
        });
        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ msg: "Eventos no encontrados" });
        }
        const filas = [];
        for (const evento of eventos) {
            // Obtener comisiones del evento
            const anfitriones = yield anfitrion_agendas_1.default.findAll({
                where: { agenda_id: evento.id },
                attributes: ["autor_id"],
                raw: true
            });
            const comisionIds = anfitriones.map((a) => a.autor_id).filter(Boolean);
            let comisiones = [];
            if (comisionIds.length > 0) {
                comisiones = yield comisions_1.default.findAll({
                    where: { id: comisionIds },
                    attributes: ["id", "nombre"],
                    raw: true
                });
            }
            const comisionesTexto = comisiones.map((c) => c.nombre).join(", ");
            // Obtener puntos del evento
            const puntosRaw = yield puntos_ordens_1.default.findAll({
                where: { id_evento: evento.id }, // 👈 ahora sí está en scope
                order: [['nopunto', 'ASC']],
            });
            // Una fila por cada punto
            for (const punto of puntosRaw) {
                filas.push({
                    id_evento: evento.id,
                    fecha_evento: evento.fecha,
                    id_punto: punto.id,
                    no_punto: punto.nopunto,
                    texto: punto.punto,
                    comisiones: comisionesTexto
                });
            }
        }
        // Generar Excel con ExcelJS
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Puntos');
        // Encabezados
        sheet.columns = [
            { header: 'ID Evento', key: 'id_evento', width: 40 },
            { header: 'Fecha Evento', key: 'fecha_evento', width: 20 },
            { header: 'ID Punto', key: 'id_punto', width: 40 },
            { header: 'No. Punto', key: 'no_punto', width: 12 },
            { header: 'Texto', key: 'texto', width: 60 },
            { header: 'Comisiones', key: 'comisiones', width: 50 },
        ];
        // Estilo encabezados
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        // Agregar filas
        filas.forEach(fila => sheet.addRow(fila));
        // Responder con el archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=puntos.xlsx');
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error("Error al exportar puntos:", error);
        return res.status(500).json({
            msg: "Error al generar el archivo Excel",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.exporpuntos = exporpuntos;
