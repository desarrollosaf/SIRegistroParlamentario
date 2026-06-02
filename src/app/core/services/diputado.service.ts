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

  getEstadoPanel(): Observable<any> {
    return this.http.get(`${this.base}/estado-panel`, { withCredentials: true });
  }

  getSesionActiva(idComision: string): Observable<any> {
    return this.http.get(`${this.base}/sesion-activa/${idComision}`, { withCredentials: true });
  }

  registrarAsistencia(body: {
    id_agenda: string;
    id_comision: string;
    partido_dip?: string;
    id_cargo_dip?: string;
    orden?: number;
  }): Observable<any> {
    return this.http.post(`${this.base}/registrar-asistencia`, body, { withCredentials: true });
  }

  registrarVoto(body: {
    sentido_voto: number;
    id_voto_punto: string;
    id_comision: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/registrar-voto`, body, { withCredentials: true });
  }
}
