import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Votante {
  id: number;
  id_diputado: string;
  diputado: string;
  partido: string;
  cargo?: string;
  sentido: number;
}

@Component({
  selector: 'app-votacion-iniciativa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './votacion-iniciativa.component.html',
  styleUrl: './votacion-iniciativa.component.scss'
})
export class VotacionIniciativaComponent implements OnInit, OnDestroy {
  private _eventoService = inject(EventoService);
  private destroy$ = new Subject<void>();
  private pollInterval: any = null;
  private readonly POLL_MS = 5000;

  idIniciativa = '';
  cargando = true;
  esComision = false;
  isUpdating = false;
  evento: any = null;
  punto: any = null;
  // Sesión simple
  votantes: Votante[] = [];
  columna1: Votante[] = [];
  columna2: Votante[] = [];

  // Comisiones múltiples
  listaComisiones: any[] = [];
  sinVotantes = false;
  constructor(
    private aRouter: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.idIniciativa = this.aRouter.snapshot.paramMap.get('id') || '';
    if (this.idIniciativa) {
      this.cargarVotantes(true);
      this.pollInterval = setInterval(() => this.cargarVotantes(false), this.POLL_MS);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarVotantes(inicial: boolean): void {
    this._eventoService.getVotantesIniciativa(this.idIniciativa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const integrantes = response.integrantes || response.data || [];

          if (!integrantes.length) {
            this.cargando = false;
            clearInterval(this.pollInterval);
            this.mostrarMensajeYCerrar();
            return;
          }

          this.sinVotantes = false;
          this.procesarRespuesta(response, inicial);

          if (inicial) {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        },
        error: (e: HttpErrorResponse) => {
          if (inicial) {
            this.cargando = false;
            clearInterval(this.pollInterval);
            this.mostrarMensajeYCerrar();
            this.cdr.detectChanges();
          }
        }
      });
  }

  mostrarMensajeYCerrar(): void {
    Swal.fire({
      icon: 'info',
      title: 'Sin votaciones',
      text: 'No hay votantes registrados para esta iniciativa.',
      confirmButtonColor: '#800048',
      confirmButtonText: 'Cerrar',
      timer: 3000,
      timerProgressBar: true,
      allowOutsideClick: false,
    }).then(() => {
      window.close();
    });
  }

  private procesarRespuesta(response: any, forzar: boolean): void {
    this.evento = response.evento || null;
    this.punto = response.punto || null;

    const integrantes = response.integrantes || response.data || [];

    if (!integrantes.length) {
      this.esComision = false;
      this.votantes = [];
      this.listaComisiones = [];
      this.cdr.detectChanges();
      return;
    }

    const primero = integrantes[0];
    const esComisionResp = !!(primero.comision_id && primero.integrantes);

    if (esComisionResp) {
      this.esComision = true;
      if (forzar || this.hayaCambiosComision(integrantes)) {
        this.listaComisiones = integrantes.map((c: any) => {
          const lista = c.integrantes || [];
          const mitad = Math.ceil(lista.length / 2);
          return {
            id: c.comision_id,
            nombre: c.comision_nombre,
            importancia: c.importancia,
            integrantes: lista,
            columna1: lista.slice(0, mitad),
            columna2: lista.slice(mitad)
          };
        });
        this.cdr.detectChanges();
      }
    } else {
      this.esComision = false;
      if (forzar || this.hayaCambios(integrantes)) {
        this.votantes = integrantes;
        const mitad = Math.ceil(this.votantes.length / 2);
        this.columna1 = this.votantes.slice(0, mitad);
        this.columna2 = this.votantes.slice(mitad);
        this.cdr.detectChanges();
      }
    }
  }

  private hayaCambios(nuevos: Votante[]): boolean {
    if (nuevos.length !== this.votantes.length) return true;
    return nuevos.some(n => {
      const a = this.votantes.find(v => v.id_diputado === n.id_diputado);
      return !a || a.sentido !== n.sentido;
    });
  }

  private hayaCambiosComision(nuevas: any[]): boolean {
    if (nuevas.length !== this.listaComisiones.length) return true;
    return nuevas.some(nc => {
      const ac = this.listaComisiones.find(c => c.id === nc.comision_id);
      if (!ac || nc.integrantes.length !== ac.integrantes.length) return true;
      return nc.integrantes.some((ni: any) => {
        const ai = ac.integrantes.find((i: any) => i.id_diputado === ni.id_diputado);
        return !ai || ai.sentido !== ni.sentido;
      });
    });
  }

  // ─── Votar ────────────────────────────────────────────────────────────────

  marcarVoto(votante: any, sentido: number): void {
    votante.sentido = sentido;
    this._eventoService.saveVotacion({
      idpunto: this.idIniciativa,
      id: votante.id,
      sentido
    }).pipe(takeUntil(this.destroy$)).subscribe({
      error: (e) => console.error('Error al votar:', e)
    });
  }

  async marcarTodos(sentido: number): Promise<void> {
    this.isUpdating = true;
    this.cdr.detectChanges();
    await new Promise(r => setTimeout(r, 80));

    try {
      await this._eventoService.ActualizarTodosVotos({
        idpunto: this.punto?.id ?? this.idIniciativa, // usa punto.id
        idReserva: null,
        sentido
      }).toPromise();

      if (this.esComision) {
        this.listaComisiones.forEach(c => {
          c.integrantes.forEach((i: any) => i.sentido = sentido);
          const mitad = Math.ceil(c.integrantes.length / 2);
          c.columna1 = c.integrantes.slice(0, mitad);
          c.columna2 = c.integrantes.slice(mitad);
        });
      } else {
        this.votantes.forEach(v => v.sentido = sentido);
        const mitad = Math.ceil(this.votantes.length / 2);
        this.columna1 = this.votantes.slice(0, mitad);
        this.columna2 = this.votantes.slice(mitad);
      }

      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true })
        .fire({ icon: 'success', title: 'Votaciones actualizadas' });

    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.error?.msg || 'Error desconocido', timer: 3000 });
    } finally {
      this.isUpdating = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Contadores ─────────────────────────────────────────────────────────────

  contar(tipo: number): number {
    return this.votantes.filter(v => v.sentido === tipo).length;
  }

  contarComision(integrantes: any[], tipo: number): number {
    return integrantes.filter(i => i.sentido === tipo).length;
  }

  totalGeneral(): number {
    return this.listaComisiones.reduce((t, c) => t + c.integrantes.length, 0);
  }

  contarGeneral(tipo: number): number {
    return this.listaComisiones.reduce((t, c) =>
      t + c.integrantes.filter((i: any) => i.sentido === tipo).length, 0);
  }

  claseVotacion(sentido: number): string {
    const map: Record<number, string> = {
      1: 'votacion-favor',
      2: 'votacion-abstencion',
      3: 'votacion-contra',
      0: 'votacion-pendiente'
    };
    return map[sentido] ?? '';
  }

  cerrarPestana(): void {
    window.close();
  }
}