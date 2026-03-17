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
exports.getiniciativas = void 0;
const inciativas_puntos_ordens_1 = __importDefault(require("../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../models/iniciativaspresenta"));
const proponentes_1 = __importDefault(require("../models/proponentes"));
const diputado_1 = __importDefault(require("../models/diputado"));
const comisions_1 = __importDefault(require("../models/comisions"));
const municipiosag_1 = __importDefault(require("../models/municipiosag"));
const partidos_1 = __importDefault(require("../models/partidos"));
const legislaturas_1 = __importDefault(require("../models/legislaturas"));
const secretarias_1 = __importDefault(require("../models/secretarias"));
const cat_fun_dep_1 = __importDefault(require("../models/cat_fun_dep"));
const getiniciativas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iniciativasRaw = yield inciativas_puntos_ordens_1.default.findAll({
            attributes: ["id", "iniciativa", "tipo", "path_doc", "precluida"],
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
                tipo: data.tipo,
                path: data.path_doc,
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
