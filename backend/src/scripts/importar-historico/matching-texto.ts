/**
 * Puntuación de coincidencia entre el texto de una iniciativa (Excel) y el
 * texto real de un `puntos_ordens.punto`. Se usa SIEMPRE acotado por fecha
 * exacta (candidatos ya vienen filtrados por evento real del mismo día) —
 * esto no es una búsqueda difusa libre, es un desempate entre pocos
 * candidatos del mismo día.
 */

const STOPWORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'que', 'por', 'se', 'del', 'con', 'al',
  'en', 'para', 'y', 'a', 'un', 'una', 'unos', 'unas', 'su', 'sus', 'lo',
  'como', 'o', 'e', 'ni', 'es', 'son', 'este', 'esta', 'estos', 'estas',
  'sobre', 'entre', 'sin', 'mas', 'muy', 'ya', 'le', 'les', 'les', 'cual',
  'cuales', 'the', 'of',
]);

export function normalizarTexto(valor: string): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizarSignificativo(valor: string): Set<string> {
  const normalizado = normalizarTexto(valor);
  const tokens = normalizado.split(' ').filter((t) => t.length > 2 && !STOPWORDS.has(t));
  return new Set(tokens);
}

/**
 * Coeficiente de Dice sobre tokens significativos: 2*|A∩B| / (|A|+|B|).
 * 1.0 = mismos tokens significativos: 0.0 = nada en común.
 *
 * OJO: esto trata todas las palabras igual. En un mismo día puede haber
 * decenas de puntos que empiezan todos con "Iniciativa con Proyecto de
 * Decreto por el que se reforman diversas disposiciones..." — ese boilerplate
 * infla el score de candidatos incorrectos por encima del correcto. Para
 * desempatar entre varios candidatos del mismo día, usar `elegirMejorCandidato`
 * (pondera por IDF dentro del propio grupo de candidatos), no esta función a secas.
 */
export function puntuarCoincidencia(textoExcel: string, textoPunto: string): number {
  const a = tokenizarSignificativo(textoExcel);
  const b = tokenizarSignificativo(textoPunto);
  if (a.size === 0 || b.size === 0) return 0;

  let interseccion = 0;
  for (const tok of a) if (b.has(tok)) interseccion++;

  return (2 * interseccion) / (a.size + b.size);
}

/**
 * Bigramas (pares de palabras consecutivas) sobre el texto normalizado SIN
 * quitar stopwords — para capturar frases exactas ("por que el se reforman")
 * que distinguen entre varias iniciativas del mismo tema, algo que el
 * conteo de palabras sueltas no puede ver.
 */
export function tokenizarBigramas(valor: string): Set<string> {
  const tokens = normalizarTexto(valor).split(' ').filter(Boolean);
  const bigramas = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) bigramas.add(`${tokens[i]}_${tokens[i + 1]}`);
  return bigramas;
}

export function puntuarBigramas(textoExcel: string, textoPunto: string): number {
  const a = tokenizarBigramas(textoExcel);
  const b = tokenizarBigramas(textoPunto);
  if (a.size === 0 || b.size === 0) return 0;
  let interseccion = 0;
  for (const bg of a) if (b.has(bg)) interseccion++;
  return (2 * interseccion) / (a.size + b.size);
}

export interface Candidato {
  id: number;
  texto: string;
}

/**
 * IDF de cada token dentro de un grupo de candidatos (ej. todos los puntos
 * de una misma agenda/fecha): palabras que aparecen en casi todos los
 * candidatos (boilerplate legislativo: "iniciativa", "decreto", "diversas",
 * "disposiciones"...) pesan poco; palabras que aparecen en pocos candidatos
 * (el nombre específico de la ley, el tema puntual) pesan mucho.
 */
export function calcularIDF(candidatos: Candidato[]): Map<string, number> {
  const N = candidatos.length;
  const df = new Map<string, number>();
  for (const c of candidatos) {
    for (const t of tokenizarSignificativo(c.texto)) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [t, d] of df) idf.set(t, Math.log((N + 1) / (d + 1)) + 1);
  return idf;
}

/**
 * Igual que puntuarCoincidencia pero ponderando cada token por su IDF dentro
 * del grupo de candidatos — así el boilerplate compartido por todos pesa
 * poco y las palabras distintivas deciden el match.
 */
export function puntuarConIDF(textoExcel: string, textoPunto: string, idf: Map<string, number>): number {
  const a = tokenizarSignificativo(textoExcel);
  const b = tokenizarSignificativo(textoPunto);
  if (a.size === 0 || b.size === 0) return 0;

  const peso = (t: string) => idf.get(t) ?? 1;
  let pesoA = 0;
  for (const t of a) pesoA += peso(t);
  let pesoB = 0;
  for (const t of b) pesoB += peso(t);
  let interseccion = 0;
  for (const t of a) if (b.has(t)) interseccion += peso(t);

  return (2 * interseccion) / (pesoA + pesoB);
}

/**
 * Score combinado (usar SIEMPRE para desempatar entre candidatos del mismo
 * día): 40% tokens ponderados por IDF + 60% bigramas — los bigramas
 * distinguen entre iniciativas del mismo tema con vocabulario parecido pero
 * redacción distinta.
 */
export function puntuarCombinado(textoExcel: string, textoPunto: string, idf: Map<string, number>): number {
  const scoreTokens = puntuarConIDF(textoExcel, textoPunto, idf);
  const scoreBigramas = puntuarBigramas(textoExcel, textoPunto);
  return 0.4 * scoreTokens + 0.6 * scoreBigramas;
}

export interface ResultadoMatch {
  puntoId: number;
  score: number;
  margen: number; // score del mejor - score del segundo mejor
}

/**
 * Elige el mejor candidato entre varios puntos_ordens del mismo día. Exige
 * un score mínimo Y un margen claro sobre el segundo lugar para evitar
 * matches ambiguos (mejor no matchear que matchear mal).
 */
export function elegirMejorCandidato(
  textoExcel: string,
  candidatos: Candidato[],
  umbralScore = 0.35,
  umbralMargen = 0.08
): ResultadoMatch | null {
  if (candidatos.length === 0) return null;

  const idf = calcularIDF(candidatos);
  const puntuados = candidatos
    .map((c) => ({ id: c.id, score: puntuarCombinado(textoExcel, c.texto, idf) }))
    .sort((x, y) => y.score - x.score);

  const mejor = puntuados[0];
  const segundo = puntuados[1];
  const margen = segundo ? mejor.score - segundo.score : mejor.score;

  if (mejor.score < umbralScore) return null;
  if (puntuados.length > 1 && margen < umbralMargen) return null;

  return { puntoId: mejor.id, score: mejor.score, margen };
}
