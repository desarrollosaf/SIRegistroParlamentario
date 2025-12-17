import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, signal, inject, computed } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment'; 

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private myAPIUrl1: string;
  private http = inject( HttpClient );
  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl ='api/catalogos';
  }


  getCatalogos(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getcatalogos/`)
  }

  getCatalogo(id: string): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getcatalogo/${id}`)
  }

  agregarCategoriaProponente(data: any): Observable<any> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/categoriaproponente/save/`,data)
  }

  eliminarCategoriaProponente(data: any): Observable<any> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/categoriaproponente/delete/`,data)
  }

  agregarTitular(data: any): Observable<any> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/proponentetitular/save/`,data)
  }

  saveProponente(data: any): Observable<any> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/proponentes/save/`,data)
  }

  saveCategorias(data: any): Observable<any> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/categoriainicitiva/save/`,data)
  }

  
  

}
