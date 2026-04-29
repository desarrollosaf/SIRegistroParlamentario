import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-proyeccion-votacion',
  imports: [CommonModule],
  templateUrl: './proyeccion-votacion.component.html',
  styleUrl: './proyeccion-votacion.component.scss'
})
export class ProyeccionVotacionComponent implements OnInit, OnDestroy {

  private _eventoService = inject(EventoService);
  private cdr = inject(ChangeDetectorRef);
  private aRouter = inject(ActivatedRoute);
  private pollInterval: any = null;

  idComision: string = '';
  idPunto: string = '';
  idReserva: string = '';
  modo: 'votacion' | 'asistencia' = 'votacion';

  tituloEvento: string = '';
  fechaEvento: string = '';
  textoPunto: string = '';

  // Lista unificada: cada elemento tiene { diputado, partido, sentido }
  participantes: any[] = [];
  listaComisiones: any[] = [];
  esComision: boolean = false;

  columna1: any[] = [];
  columna2: any[] = [];
  columna3: any[] = [];

  cargando: boolean = true;

  ngOnInit(): void {
    this.aRouter.queryParams.subscribe(params => {
      this.idComision = params['id'] || '';
      this.idPunto = params['idPunto'] || '';
      this.idReserva = params['idReserva'] || '';
      this.modo = params['modo'] === 'asistencia' ? 'asistencia' : 'votacion';

      if (this.idComision) {
        this.cargarDatos();
        this.iniciarPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  private iniciarPolling(): void {
    this.pollInterval = setInterval(() => this.cargarDatos(), 3000);
  }

  private detenerPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private cargarDatos(): void {
    if (this.modo === 'asistencia') {
      this.cargarAsistencia();
    } else {
      this.cargarVotacion();
    }
  }

  private cargarAsistencia(): void {
    this._eventoService.getEvento(this.idComision).subscribe({
      next: (response: any) => {
        this.tituloEvento = response.titulo || '';
        this.fechaEvento = response.evento?.fecha || '';

        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primero = response.integrantes[0];

          if (primero.comision_id && primero.integrantes && Array.isArray(primero.integrantes)) {
            this.esComision = true;
            this.listaComisiones = response.integrantes.map((c: any) => ({
              id: c.comision_id,
              nombre: c.comision_nombre,
              integrantes: (c.integrantes || []).map((i: any) => ({
                ...i,
                sentido: i.sentido_voto ?? i.sentido ?? 0
              }))
            }));
            this.participantes = [];
          } else {
            this.esComision = false;
            this.participantes = response.integrantes.map((i: any) => ({
              ...i,
              sentido: i.sentido_voto ?? i.sentido ?? 0
            }));
            this.distribuirColumnas(this.participantes);
          }
        } else {
          this.participantes = [];
          this.listaComisiones = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error asistencia:', e);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarVotacion(): void {
    if (!this.idPunto) { this.cargando = false; return; }

    // Carga el título del evento solo la primera vez
    if (!this.tituloEvento) {
      this._eventoService.getEvento(this.idComision).subscribe({
        next: (response: any) => {
          this.tituloEvento = response.titulo || '';
          this.fechaEvento = response.evento?.fecha || '';
        },
        error: () => {}
      });

      this._eventoService.getPuntos(this.idComision).subscribe({
        next: (response: any) => {
          const puntos: any[] = response.data || [];
          const p = puntos.find((x: any) => String(x.id) === String(this.idPunto));
          if (p) this.textoPunto = `${p.nopunto ? 'Punto ' + p.nopunto : 'Punto'}: ${p.punto}`;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }

    const datos = {
      idPunto: Number(this.idPunto),
      idReserva: this.idReserva || null
    };

    this._eventoService.getIntegrantesVotosPunto(datos).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primero = response.integrantes[0];

          if (primero.comision_id && primero.integrantes && Array.isArray(primero.integrantes)) {
            this.esComision = true;
            this.listaComisiones = response.integrantes.map((c: any) => ({
              id: c.comision_id,
              nombre: c.comision_nombre,
              integrantes: (c.integrantes || []).map((i: any) => ({ ...i, sentido: i.sentido ?? 0 }))
            }));
            this.participantes = [];
          } else {
            this.esComision = false;
            this.participantes = response.integrantes.map((i: any) => ({ ...i, sentido: i.sentido ?? 0 }));
            this.distribuirColumnas(this.participantes);
          }
        } else {
          this.participantes = [];
          this.listaComisiones = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error votación:', e);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private distribuirColumnas(lista: any[]): void {
    const por = Math.ceil(lista.length / 3);
    this.columna1 = lista.slice(0, por);
    this.columna2 = lista.slice(por, por * 2);
    this.columna3 = lista.slice(por * 2);
  }

  distribuirColumnasComision(integrantes: any[]): { col1: any[], col2: any[], col3: any[] } {
    const por = Math.ceil(integrantes.length / 3);
    return {
      col1: integrantes.slice(0, por),
      col2: integrantes.slice(por, por * 2),
      col3: integrantes.slice(por * 2)
    };
  }

  getEscalaClase(): string {
    const total = this.totalParticipantes();
    if (total <= 10)  return 'escala-xl';
    if (total <= 20)  return 'escala-lg';
    if (total <= 35)  return 'escala-md';
    if (total <= 55)  return 'escala-sm';
    return 'escala-xs';
  }

  getColorSentido(sentido: number): string {
    if (this.modo === 'asistencia') {
      switch (sentido) {
        case 1: return 'presente';
        case 2: return 'remota';
        case 3: return 'justificada';
        default: return 'pendiente';
      }
    }
    switch (sentido) {
      case 1: return 'favor';
      case 2: return 'abstencion';
      case 3: return 'contra';
      default: return 'pendiente';
    }
  }

  contarPorTipo(tipo: number): number {
    if (this.esComision) {
      return this.listaComisiones.reduce((acc, c) => acc + c.integrantes.filter((i: any) => i.sentido === tipo).length, 0);
    }
    return this.participantes.filter(v => v.sentido === tipo).length;
  }

  totalParticipantes(): number {
    if (this.esComision) {
      return this.listaComisiones.reduce((acc, c) => acc + c.integrantes.length, 0);
    }
    return this.participantes.length;
  }

  get etiquetaHeader(): string {
    return this.modo === 'asistencia' ? 'Registro de Asistencia' : 'Registro de Votación';
  }
}
