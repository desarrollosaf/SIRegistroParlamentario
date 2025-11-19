import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, signal, inject, computed } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment'; 

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject( HttpClient );
  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl ='api/eventos';
  }


  getCatalogos(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/catalogossave/`)
  }

  saveAgenda(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/saveagenda/`,data)
  }

  getAgendaRegistrada(id: any): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getagenda/${id}`)
  }

  updateAgenda(data: any, id: String){
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/editagenda/${id}`,data)  
  }

  
}
