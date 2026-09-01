import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment';

/**
 * Pantallas físicas del Pleno (sin login — el reconocimiento facial, un
 * programa aparte en Python, identifica al diputado y llama a /identidad).
 */
@Injectable({ providedIn: 'root' })
export class PlenoService {

  private appUrl = enviroment.endpoint;
  private apiUrl = 'api/pleno';
  private http = inject(HttpClient);

  /** Estado actual (asistencia/votación abiertas y si ya registró) de un diputado. */
  getEstado(diputadoId: string, idAgenda?: string): Observable<any> {
    const query = idAgenda ? `?idAgenda=${encodeURIComponent(idAgenda)}` : '';
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/estado/${diputadoId}${query}`);
  }

  registrarVoto(data: { diputado_id: string; sentido_voto: number; id_voto_punto?: string; id_comision?: string }): Observable<any> {
    return this.http.post<any>(`${this.appUrl}${this.apiUrl}/voto`, data);
  }

  registrarAsistencia(data: { diputado_id: string; id_agenda: string; id_comision?: string }): Observable<any> {
    return this.http.post<any>(`${this.appUrl}${this.apiUrl}/asistencia`, data);
  }

  getOrdenDelDia(idAgenda: string): Observable<{ puntos: any[] }> {
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/orden-del-dia/${idAgenda}`);
  }

  getMisVotos(diputadoId: string, idAgenda: string): Observable<{ votos: any[] }> {
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/mis-votos/${diputadoId}/${idAgenda}`);
  }
}
