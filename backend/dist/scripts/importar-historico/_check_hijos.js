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
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const json = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const conMatch = json.filter((r) => r.matchPresentacion);
        let conAutor = 0, sinAutor = 0, conComision = 0, sinComision = 0, conFolioTag = 0;
        for (const r of conMatch) {
            const puntoId = r.matchPresentacion.puntoId;
            const existente = yield inciativas_puntos_ordens_1.default.findOne({ where: { id_punto: puntoId } });
            if (!existente)
                continue;
            if (existente.folio_historico)
                conFolioTag++;
            const presenta = yield iniciativaspresenta_1.default.findOne({ where: { id_iniciativa: existente.id } });
            if (presenta)
                conAutor++;
            else
                sinAutor++;
            const comision = yield puntos_comisiones_1.default.findOne({ where: { id_punto: puntoId } });
            if (comision)
                conComision++;
            else
                sinComision++;
        }
        console.log('De las existentes:');
        console.log('  ya con folio_historico:', conFolioTag);
        console.log('  con autor (iniciativas_presenta):', conAutor, '| sin autor:', sinAutor);
        console.log('  con comision (puntos_comisiones):', conComision, '| sin comision:', sinComision);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
