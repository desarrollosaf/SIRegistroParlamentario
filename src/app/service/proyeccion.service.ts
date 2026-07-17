import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ProyeccionService {

  private appUrl = enviroment.endpoint;
  private apiUrl = 'api/proyeccion';
  private http = inject(HttpClient);

  /** Sube una imagen o video; devuelve { path, tipo }. */
  subirArchivo(archivo: File): Observable<any> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.post<any>(`${this.appUrl}${this.apiUrl}/upload`, form, { withCredentials: true });
  }

  /** URL absoluta a partir de la ruta relativa devuelta por el backend. */
  urlAbsoluta(path: string): string {
    return `${this.appUrl}${path}`;
  }

  listarGuardadas(comisionId: string): Observable<any> {
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/guardadas/${comisionId}`, { withCredentials: true });
  }

  guardar(payload: { comision_id: string | null; titulo: string; contenido: any }): Observable<any> {
    return this.http.post<any>(`${this.appUrl}${this.apiUrl}/guardadas`, payload, { withCredentials: true });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.appUrl}${this.apiUrl}/guardadas/${id}`, { withCredentials: true });
  }
}
