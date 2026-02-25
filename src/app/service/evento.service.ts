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
  private myAPIUrl1: string;
  private http = inject( HttpClient );
  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl ='api/eventos';
    this.myAPIUrl1 ='api/diputados';
  }


  getEventos(tipo: String): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/geteventos/${tipo}`)
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

  getTipo(data: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/gettipos/`,data)
  }

  saveRegistro(data: FormData, id: String): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/savepunto/${id}`,data)
  }

  getPuntos(id: any): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getpuntos/${id}`)
  }

  updatePunto(data: FormData, id: String): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/actualizarPunto/${id}`,data)
  }

  saveIntervencion(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/saveintervencion/`,data)
  }

  getIntervenciones(data: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myAPIUrl}/getintervenciones/`,data)
  }


  deletePunto(id: String, sesion:boolean): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/eliminarpunto/${id}/${sesion}`)
  }

  // getIntegrantesVotosPunto(id: String): Observable<string> {
  //   return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/getvotospunto/${id}`)
  // }
  getIntegrantesVotosPunto(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/getvotospunto/`,data)
  }
  saveVotacion(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/actvoto/`,data)
  }
  
  reinicioVotacion(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/reiniciavoto/`,data)
  }


  getIntegrantesEvento(id: String): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/gestionintegrantes/${id}`)
  }

  addDiputadoComisionSesion(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/agregardipasistencia/`,data)
  }

   deleteDiputadoComisionSesion(id: any): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/deleteintlista/${id}`)
  }
  
  ActualizarTodosAsistencia(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl1}/acttodosasistencia/`,data)
  }

   ActualizarTodosVotos(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl1}/acttodosvotos/`,data)
  }

  // notificarWhatsVotacion(id:any): Observable<string> {
  //   return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/enviarvotacionpunto/${id}`)
  // }
  notificarWhatsVotacion(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/enviarvotacionpunto/`,data)
  }

  notificarWhatsAsistencia(id:any): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/notasintenciapdf/${id}`)
  }

  
  saveReserva(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/savereserva/`,data)
  }

  saveIniciativa(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl1}/saveiniciativa/`,data)
  }

   deleteReserva(id: String): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/eliminarreserva/${id}`)
  }

  deleteIniciativa(id: String): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl1}/eliminariniciativa/${id}`)
  }
  
  getReservas(id: String): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/getreservas/${id}`)
  }
  
  saveIniciativasCargadas(data: any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl1}/crariniidits/`,data)
  }


  getIniciativasList(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl1}/selectiniciativas/`)
  }


  getInfinIciativa(id: String): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl1}/getinfiniciativa/${id}`)
  }

  generarPDFAsistenciaPunto(id: string): Observable<Blob> {
    return this.http.get(`${this.myAppUrl}${this.myAPIUrl}/asintenciapdf/${id}`, {
      responseType: 'blob'
    });
  }

  generarPDFVotacion(id: string): Observable<Blob> {
    return this.http.get(`${this.myAppUrl}${this.myAPIUrl}/votacionpunto/${id}`, {
      responseType: 'blob'
    });
  }

  terminarVotacion(id: String): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl1}/terminarvotacion/${id}`)
  }



}
