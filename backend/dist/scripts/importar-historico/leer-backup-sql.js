"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leerTablaDeDump = leerTablaDeDump;
/**
 * Parser mínimo de un dump mysqldump: extrae las tuplas VALUES(...) de un
 * INSERT INTO `tabla` de una sola tabla. No es un parser SQL completo — solo
 * soporta lo que mysqldump genera (comillas simples, escapes con \, NULL,
 * números, un solo INSERT masivo por tabla).
 */
const fs_1 = __importDefault(require("fs"));
function parseTuplas(bloque) {
    const tuplas = [];
    let i = 0;
    const n = bloque.length;
    while (i < n) {
        if (bloque[i] === '(') {
            let depth = 1;
            let j = i + 1;
            const campos = [];
            let cur = '';
            let enString = false;
            while (j < n && depth > 0) {
                const c = bloque[j];
                if (enString) {
                    if (c === '\\') {
                        cur += c + bloque[j + 1];
                        j += 2;
                        continue;
                    }
                    else if (c === "'") {
                        enString = false;
                        cur += c;
                    }
                    else {
                        cur += c;
                    }
                }
                else {
                    if (c === "'") {
                        enString = true;
                        cur += c;
                    }
                    else if (c === '(') {
                        depth++;
                        cur += c;
                    }
                    else if (c === ')') {
                        depth--;
                        if (depth === 0) {
                            campos.push(cur);
                            break;
                        }
                        cur += c;
                    }
                    else if (c === ',' && depth === 1) {
                        campos.push(cur);
                        cur = '';
                    }
                    else {
                        cur += c;
                    }
                }
                j++;
            }
            tuplas.push(campos);
            i = j + 1;
        }
        else {
            i++;
        }
    }
    return tuplas;
}
function unquote(valor) {
    const v = valor.trim();
    if (v === 'NULL')
        return null;
    if (v.startsWith("'") && v.endsWith("'")) {
        return v
            .slice(1, -1)
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r');
    }
    return v;
}
/**
 * Lee un dump y devuelve las filas de una tabla como objetos, usando el
 * orden de columnas que le pases (mysqldump con --complete-insert trae los
 * nombres en el INSERT; el dump del usuario no los trae, así que hay que
 * conocer el orden de antemano — ver CREATE TABLE en el propio dump).
 */
function leerTablaDeDump(rutaDump, tabla, columnas) {
    const contenido = fs_1.default.readFileSync(rutaDump, 'utf8');
    const regex = new RegExp('INSERT INTO `' + tabla + '` VALUES\\s*([\\s\\S]*?);\\n');
    const m = contenido.match(regex);
    if (!m)
        return [];
    const tuplas = parseTuplas(m[1]);
    return tuplas.map((campos) => {
        const fila = {};
        columnas.forEach((col, idx) => {
            var _a;
            fila[col] = unquote((_a = campos[idx]) !== null && _a !== void 0 ? _a : 'NULL');
        });
        return fila;
    });
}
