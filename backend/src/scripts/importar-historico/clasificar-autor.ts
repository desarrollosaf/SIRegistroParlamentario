/**
 * Clasifica el texto libre de la columna "Autor" del Excel contra el catálogo
 * fijo de 19 proponentes (seeder 20251104212213-seed-proponentes.js).
 *
 * No intenta descomponer autores conjuntos (ej. "Dip. X y Dip. Y, integrantes
 * del Grupo Parlamentario del PAN") en varias personas — se guarda el texto
 * completo como id_presenta y solo se clasifica el id_tipo_presenta con la
 * mejor coincidencia. Es una simplificación deliberada: iniciativas_presenta
 * admite múltiples filas por iniciativa, pero separar autores de una lista en
 * texto libre de forma confiable requeriría NLP, no vale la pena para un
 * import histórico donde lo importante es no perder el dato original.
 */
import { Catalogos, normalizarNombre } from './catalogos';

interface Regla {
  test: RegExp;
  proponente: string; // debe existir (normalizado) en la tabla proponentes
}

// Orden importa: la primera regla que matchee gana.
const REGLAS: Regla[] = [
  { test: /^h\.?\s*ayuntamiento|^ayuntamiento/i, proponente: 'Ayuntamientos' },
  { test: /^municipio de/i, proponente: 'Municipios' },
  { test: /^comisi[oó]n legislativa/i, proponente: 'Comisiones Legislativas' },
  { test: /^comisi[oó]n instaladora/i, proponente: 'Comisión instaladora' },
  { test: /^mesa directiva/i, proponente: 'Mesa Directiva en turno' },
  { test: /^diputaci[oó]n permanente/i, proponente: 'Diputación Permanente' },
  { test: /^(junta de coordinaci[oó]n pol[ií]tica|coordinadores)/i, proponente: 'Junta de Coordinación Política' },
  // Dip./Diputado/Diputada/Diputade/Diputados/Diputadas presentando (a título personal o "a nombre de" un GP)
  { test: /^(dip\.?\s|diputad[ao]s?\b|diputade\b)/i, proponente: 'Diputadas y Diputados' },
  // Grupo(s) Parlamentario(s) como autor directo (sin diputado nombrado adelante)
  { test: /^grupos? parlamentario/i, proponente: 'Grupo Parlamentario' },
  { test: /coordinadores de los grupos parlamentarios/i, proponente: 'Grupo Parlamentario' },
  { test: /^(ejecutivo estatal|gobernador|gobernadora)/i, proponente: 'Gobernadora o Gobernador del Estado' },
  { test: /fiscal[ií]a general de justicia/i, proponente: 'Fiscalía General de Justicia del Estado de México' },
  { test: /tribunal superior de justicia/i, proponente: 'Tribunal Superior de Justicia' },
  { test: /^secretar[ií]a/i, proponente: 'Secretarías del GEM' },
  { test: /comisi[oó]n de derechos humanos del estado de m[eé]xico/i, proponente: 'Comición de Derechos Humanos del Estado de México' },
  { test: /c[aá]mara de diputados del h\. congreso de la uni[oó]n/i, proponente: 'Cámara de Diputados del H. Congreso de la Unión' },
  { test: /c[aá]mara de senadores del h\. congreso de la uni[oó]n/i, proponente: 'Cámara de Senadores del H. Congreso de la Unión' },
  { test: /^(personas? integrantes|integrantes de|ciudadan)/i, proponente: 'Ciudadanas y ciudadanos del Estado' },
  // Fallbacks: nombres propios seguidos de "... Diputados integrantes del Grupo Parlamentario ..."
  // que no arrancan con "Dip." ni "Diputado(s)".
  { test: /diputad[ao]s?\s+integrantes\s+del\s+grupo\s+parlamentario/i, proponente: 'Diputadas y Diputados' },
  { test: /grupo parlamentario/i, proponente: 'Grupo Parlamentario' },
];

export interface ResultadoClasificacion {
  autorOriginal: string;
  tipoPresentaId: number | null;
  tipoPresentaValor: string | null;
}

export function clasificarAutor(autorOriginal: string, catalogo: Catalogos): ResultadoClasificacion {
  const texto = autorOriginal.trim();
  for (const regla of REGLAS) {
    if (regla.test.test(texto)) {
      const encontrado = catalogo.proponentesPorNombre.get(normalizarNombre(regla.proponente));
      if (encontrado) {
        return { autorOriginal, tipoPresentaId: encontrado.id, tipoPresentaValor: encontrado.valor };
      }
      // La regla matcheó pero el catálogo real no tiene ese valor (BD distinta al seeder de referencia)
      return { autorOriginal, tipoPresentaId: null, tipoPresentaValor: null };
    }
  }
  return { autorOriginal, tipoPresentaId: null, tipoPresentaValor: null };
}
