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
        const cadena = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/cadena-reconstruida.json'), 'utf8'));
        const conAlgo = cadena.filter((c) => c.eslabones.length > 0);
        const sinNada = cadena.filter((c) => c.eslabones.length === 0);
        console.log('Folios con al menos 1 eslabón reconstruido:', conAlgo.length, '/', cadena.length);
        console.log('Folios sin ningún eslabón:', sinNada.length);
        process.exit(0);
    });
}
main();
