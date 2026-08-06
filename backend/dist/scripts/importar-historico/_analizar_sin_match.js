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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const sinAgenda = data.filter((r) => r.estado === 'sin_agenda_presentacion');
        const sinTexto = data.filter((r) => r.estado === 'sin_match_texto');
        console.log('sin_agenda_presentacion:', sinAgenda.length);
        console.log('sin_match_texto:', sinTexto.length);
        console.log('\n--- 10 ejemplos sin agenda ---');
        sinAgenda.slice(0, 10).forEach((r) => { var _a; return console.log(r.folio, '|', (_a = r.texto) === null || _a === void 0 ? void 0 : _a.slice(0, 70)); });
        console.log('\n--- 10 ejemplos sin match de texto (con # candidatos) ---');
        sinTexto.slice(0, 10).forEach((r) => { var _a; return console.log(r.folio, '| candidatos:', r.candidatos, '|', (_a = r.texto) === null || _a === void 0 ? void 0 : _a.slice(0, 70)); });
        process.exit(0);
    });
}
main();
