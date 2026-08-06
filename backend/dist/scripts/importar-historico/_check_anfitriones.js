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
const agendas_1 = __importDefault(require("../../models/agendas"));
const anfitrion_agendas_1 = __importDefault(require("../../models/anfitrion_agendas"));
const tipo_autors_1 = __importDefault(require("../../models/tipo_autors"));
const comisions_1 = __importDefault(require("../../models/comisions"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const comisionId = '0e772516-bbc2-402f-afa0-022489752d33';
        const check = yield agendas_1.default.findByPk('d90cf967-21f5-4775-a550-f4d568f999b3');
        console.log('directo:', check === null || check === void 0 ? void 0 : check.get());
        const agendas = yield agendas_1.default.findAll({ where: { fecha: '2026-04-08', tipo_evento_id: comisionId } });
        console.log(`Agendas de Comisión el 2026-04-08: ${agendas.length}`);
        for (const ag of agendas) {
            const anfitriones = yield anfitrion_agendas_1.default.findAll({ where: { agenda_id: ag.id } });
            const nombres = [];
            for (const a of anfitriones) {
                const tipo = yield tipo_autors_1.default.findByPk(a.tipo_autor_id);
                let nombre = a.autor_id;
                if ((tipo === null || tipo === void 0 ? void 0 : tipo.model) === 'Comision' || ((_a = tipo === null || tipo === void 0 ? void 0 : tipo.valor) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('comision'))) {
                    const com = yield comisions_1.default.findByPk(a.autor_id);
                    nombre = (com === null || com === void 0 ? void 0 : com.nombre) || a.autor_id;
                }
                nombres.push({ tipo: tipo === null || tipo === void 0 ? void 0 : tipo.valor, modelo: tipo === null || tipo === void 0 ? void 0 : tipo.model, nombre });
            }
            console.log(` - Agenda ${ag.id} | descripcion: ${ag.descripcion} | anfitriones:`, nombres);
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
