import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class DiputadoService {
  private base = enviroment.endpoint + 'api/diputado';
  private http = inject(HttpClient);

  getMiPerfil(): Observable<any> {
    return this.http.get(`${this.base}/mi-perfil`, { withCredentials: true });
  }

  getEstadoPanel(idAgenda?: string): Observable<any> {
    const url = idAgenda
      ? `${this.base}/estado-panel?idAgenda=${encodeURIComponent(idAgenda)}`
      : `${this.base}/estado-panel`;
    return this.http.get(url, { withCredentials: true });
  }

  getSesionActiva(idComision: string): Observable<any> {
    return this.http.get(`${this.base}/sesion-activa/${idComision}`, { withCredentials: true });
  }

  getOrdenDelDia(idAgenda: string): Observable<any> {
    return this.http.get(`${this.base}/orden-del-dia/${idAgenda}`, { withCredentials: true });
  }

  getMiAsistencia(idAgenda: string): Observable<any> {
    return this.http.get(`${this.base}/mi-asistencia/${idAgenda}`, { withCredentials: true });
  }

  getMisVotos(idAgenda: string): Observable<any> {
    return this.http.get(`${this.base}/mis-votos/${idAgenda}`, { withCredentials: true });
  }

  registrarAsistencia(body: {
    id_agenda: string;
    id_comision?: string;
    partido_dip?: string;
    id_cargo_dip?: string;
    orden?: number;
  }): Observable<any> {
    return this.http.post(`${this.base}/registrar-asistencia`, body, { withCredentials: true });
  }

  registrarVoto(body: {
    sentido_voto: number;
    id_voto_punto?: string;
    id_comision?: string;
    idPunto?: any;
    idReserva?: string | null;
    idIniciativa?: string | null;
  }): Observable<any> {
    return this.http.post(`${this.base}/registrar-voto`, body, { withCredentials: true });
  }
}
