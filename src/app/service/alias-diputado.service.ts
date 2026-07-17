import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AliasDiputadoService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl = 'api/alias-diputado';
  }

  listarDiputados(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/listar`, { withCredentials: true });
  }

  actualizarAlias(id: string, alias: string | null): Observable<any> {
    return this.http.put<any>(`${this.myAppUrl}${this.myAPIUrl}/${id}`, { alias }, { withCredentials: true });
  }

  actualizarUsuario(integranteLegislaturaId: string, data: { name?: string; email?: string | null }): Observable<any> {
    return this.http.put<any>(
      `${this.myAppUrl}${this.myAPIUrl}/usuario/${integranteLegislaturaId}`,
      data,
      { withCredentials: true }
    );
  }

  resetearPassword(integranteLegislaturaId: string): Observable<any> {
    return this.http.post<any>(
      `${this.myAppUrl}${this.myAPIUrl}/usuario/${integranteLegislaturaId}/reset-password`,
      {},
      { withCredentials: true }
    );
  }
}
