import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, signal, inject, computed } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment'; 

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject( HttpClient );
  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl ='api/eventos';
  }


  getEventos(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/geteventos/`)
  }

  getEvento(id: String): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getevento/${id}`)
  }


  actualizaAsistencia(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/actasistencia/`,data)
  }

  getCatalogos(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/catalogos/`)
  }

  getTipo(id: any): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/gettipos/${id}`)
  }

  saveRegistro(data: FormData, id: String): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/savepunto/${id}`,data)
  }

  getPuntos(id: any): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getpuntos/${id}`)
  }

}
