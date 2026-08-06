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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const agendas_1 = __importDefault(require("../../models/agendas"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const json = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const sinAgenda = json.filter((r) => r.estado === 'sin_agenda_presentacion');
        console.log('sin_agenda_presentacion:', sinAgenda.length);
        const fechasUnicas = [...new Set(sinAgenda.map((r) => r.texto ? undefined : undefined))]; // noop
        // revisemos 5 fechas de ejemplo contra TODOS los tipo_evento
        const muestraFechas = [...new Set(sinAgenda.slice(0, 50).map((r) => r))].slice(0, 8);
        for (const r of sinAgenda.slice(0, 8)) {
            // no guardé la fecha en el objeto "sin_agenda_presentacion", así que busco en el CSV crudo no. Solo tengo folio/texto ahí.
            console.log(r.folio, (_a = r.texto) === null || _a === void 0 ? void 0 : _a.slice(0, 60));
        }
        const DIPUTACION_PERMANENTE_ID = 'a413e44b-550b-47ab-b004-a6f28c73a750';
        const todasFechasDiputacion = yield agendas_1.default.findAll({ where: { tipo_evento_id: DIPUTACION_PERMANENTE_ID }, attributes: ['fecha'] });
        console.log('\nTotal agendas tipo Diputación Permanente:', todasFechasDiputacion.length);
        console.log('fechas:', todasFechasDiputacion.slice(0, 15).map((a) => String(a.fecha).slice(0, 15)));
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
