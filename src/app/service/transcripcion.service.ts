import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TranscripcionService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl = 'api/transcripcion';
  }

  /** Arranca la transcripción de la sesión (usa la liga de YouTube guardada). */
  iniciar(idAgenda: string, opciones?: { modelo?: string; voz?: boolean }): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/iniciar`, {
      idAgenda, ...(opciones || {}),
    });
  }

  /** Detiene la transcripción de la sesión. */
  detener(idAgenda: string): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/detener`, { idAgenda });
  }

  /** Consulta si la sesión está transcribiendo ahora mismo. */
  estado(idAgenda: string): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/estado/${idAgenda}`);
  }

  // ── Revisión y resúmenes de una sesión ya transcrita ──────────────────

  /** Intervenciones (planas) + resúmenes guardados de la sesión. */
  sesion(idAgenda: string): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}`);
  }

  /** Borra toda la transcripción guardada de la sesión (empezar de nuevo). */
  borrarSesion(idAgenda: string): Observable<any> {
    return this.http.delete<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}`);
  }

  /** Catálogo de diputados para sugerir nombres. */
  catalogo(idAgenda: string): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}/catalogo`);
  }

  /** Corrige el orador de un turno (una o varias intervenciones). */
  actualizarOrador(idAgenda: string, ids: string[], orador: string): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}/actualizar`, { ids, orador });
  }

  /** Renombra un orador en toda la sesión. */
  renombrar(idAgenda: string, de: string, a: string): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}/renombrar`, { de, a });
  }

  /** Edita el texto de un turno (una o varias intervenciones). */
  editarTexto(idAgenda: string, ids: string[], texto: string): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}/texto`, { ids, texto });
  }

  /** Genera y guarda el resumen de una intervención. */
  resumen(idAgenda: string, anclaId: string, orador: string, texto: string): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}/resumen`, { anclaId, orador, texto });
  }

  /** Borra el resumen guardado de una intervención. */
  borrarResumen(idAgenda: string, anclaId: string): Observable<any> {
    return this.http.delete<any>(`${this.myAppUrl}${this.myAPIUrl}/sesion/${idAgenda}/resumen/${anclaId}`);
  }
}
