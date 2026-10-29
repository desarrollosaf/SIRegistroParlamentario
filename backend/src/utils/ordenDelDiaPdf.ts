// lib/pdf-parse.js directo: el index.js de pdf-parse 1.x intenta leer un PDF de
// prueba al importarse (modo debug) y truena fuera de su carpeta.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (data: Buffer) => Promise<{ text: string; numpages: number }> = require('pdf-parse/lib/pdf-parse.js');

export interface PuntoExtraido {
    nopunto: number;
    punto: string;
}

// "1.- Acta…", "1.– …", "1. …", "1) …", "1 - …"
const INICIO_PUNTO = /^(\d{1,3})\s*(?:\.\s*[-–—]|\.|\)|[-–—])\s*(.*)$/;
// Encabezado que se repite en cada hoja: “2026. Año del Humanismo Mexicano…”
const LEMA_ANIO = /^[“"']?\s*\d{4}\.\s*A[ñn]o\b/i;
const FIN_DOCUMENTO = /^A\s*T\s*E\s*N\s*T\s*A\s*M\s*E\s*N\s*T\s*E\b/i;

/**
 * Saca los puntos numerados del PDF del orden del día (1.-, 2.-, … N.-).
 *
 * Solo acepta como inicio de punto el número que sigue en la secuencia: así
 * una línea de texto corrido que empieza con número ("33 de la Ley…",
 * "5 de la Constitución…") nunca se confunde con un punto nuevo.
 */
export async function extraerPuntosOrdenDelDia(pdf: Buffer): Promise<PuntoExtraido[]> {
    const { text } = await pdfParse(pdf);
    const lineas = text.split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim());

    const puntos: { nopunto: number; lineas: string[] }[] = [];
    let actual: { nopunto: number; lineas: string[] } | null = null;

    for (const linea of lineas) {
        if (!linea) continue;
        if (FIN_DOCUMENTO.test(linea)) break;
        if (LEMA_ANIO.test(linea)) continue;

        const m = linea.match(INICIO_PUNTO);
        const esperado: number = (actual?.nopunto ?? 0) + 1;
        if (m && Number(m[1]) === esperado) {
            actual = { nopunto: esperado, lineas: m[2] ? [m[2]] : [] };
            puntos.push(actual);
            continue;
        }
        // Antes del punto 1 va el encabezado (Congreso, legislatura, fecha…).
        if (actual) actual.lineas.push(linea);
    }

    return puntos
        .map(p => ({ nopunto: p.nopunto, punto: unirLineas(p.lineas) }))
        .filter(p => p.punto.length > 0);
}

/** Une las líneas de un punto: si una termina en guion ("WBC-" / "Muay") se pega sin espacio. */
function unirLineas(lineas: string[]): string {
    let texto = '';
    for (const l of lineas) {
        if (!texto) texto = l;
        else if (/[-–]$/.test(texto)) texto += l;
        else texto += ' ' + l;
    }
    return texto.trim();
}
