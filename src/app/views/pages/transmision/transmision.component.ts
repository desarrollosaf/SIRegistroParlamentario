import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../../core/services/socket.service';
import { UserService } from '../../../core/services/auth.service';
import { FeatherIconDirective } from '../../../core/feather-icon/feather-icon.directive';

interface SesionActiva {
  clave: string;
  idAgenda: string;
  titulo: string;
  fecha: string;
  esComision: boolean;
  idComision?: string;
  idComisiones: string[];
  iniciadaEn?: string;
}

@Component({
  selector: 'app-transmision',
  standalone: true,
  imports: [CommonModule, FeatherIconDirective],
  templateUrl: './transmision.component.html',
  styleUrl: './transmision.component.scss'
})
export class TransmisionComponent implements OnInit, OnDestroy {

  sesionesActivas: SesionActiva[] = [];
  cerrando = new Set<string>();
  private estadoEventos: { asistencias: any[]; votaciones: any[] } = { asistencias: [], votaciones: [] };
  /** Público para que la plantilla muestre "cargando" en vez de nada mientras esto es false. */
  estadoCargado = false;
  private estadoPollInterval: any = null;

  constructor(private socketService: SocketService, private userService: UserService) {}

  /** Comunicación Social solo abre el link, no puede cerrar la sesión. */
  get puedeCerrarSesion(): boolean {
    return this.userService.getRol() !== 'comunicacion';
  }

  /**
   * Link de la pantalla de proyección para compartir/proyectar esta sesión.
   * Usa idAgenda (siempre presente) y no idComision: ese último solo se
   * resuelve en el backend cuando hay una comisión anfitriona registrada
   * (AnfitrionAgenda), y queda vacío para sesiones sin comisión asociada
   * (p.ej. una sesión solemne/protocolaria) — pero detalle-comision.component.ts
   * ya usa idAgenda como clave de la sala de proyección para cualquier sesión.
   *
   * El modo no puede ser fijo ('contenido' se queda en "en espera", nunca
   * carga nada): hay que preguntar qué está realmente abierto ahora mismo
   * (asistencia o votación) para esta sesión, vía get-estado-eventos.
   *
   * Asistencia y votación son mapas independientes en el servidor — nada
   * impide que ambos tengan una entrada para la misma sesión a la vez (por
   * ejemplo, una votación que quedó sin cerrar de un evento anterior). Por
   * eso no se puede asumir que "si hay votación, es la vigente": se compara
   * abiertaEn y se usa la más reciente.
   */
  enlaceProyeccion(sesion: SesionActiva): string | null {
    if (!sesion.idAgenda) return null;
    // Todavía no llega la respuesta de get-estado-eventos (recién se entró a
    // la página): mejor no mostrar el botón que armar un link con modo por
    // default y sin idPunto, que se queda en "Esperando datos...".
    if (!this.estadoCargado) return null;
    const votacion = this.estadoEventos.votaciones.find(v => v.idAgenda === sesion.idAgenda);
    const asistencia = this.estadoEventos.asistencias.find(a => a.idAgenda === sesion.idAgenda);
    const votacionEsMasReciente = votacion && (!asistencia
      || new Date(votacion.abiertaEn ?? 0).getTime() >= new Date(asistencia.abiertaEn ?? 0).getTime());

    // Igual que proyectarVotacion()/proyectarAsistencia() en detalle-comision:
    // votación necesita idPunto/idReserva del punto realmente abierto, o
    // cargarVotacion() no carga nada (corta si idPunto viene vacío).
    const params: Record<string, string> = { id: sesion.idAgenda };
    if (votacionEsMasReciente) {
      params['modo'] = 'votacion';
      params['idPunto'] = String(votacion!.idPunto ?? '');
      params['idReserva'] = String(votacion!.idReserva ?? '');
    } else if (asistencia) {
      params['modo'] = 'asistencia';
    } else {
      params['modo'] = 'votacion';
    }

    const qs = new URLSearchParams(params).toString();
    return `/proyeccion-votacion?t=${btoa(qs)}`;
  }

  ngOnInit(): void {
    this.socketService.conectar();

    this.socketService.onSesionesActivas((lista: any[]) => {
      this.sesionesActivas = lista;
    });

    this.socketService.onSesionIniciada((data: any) => {
      if (!this.sesionesActivas.find(s => s.clave === data.clave)) {
        this.sesionesActivas = [...this.sesionesActivas, data];
      }
    });

    this.socketService.onSesionTerminada((data: any) => {
      this.sesionesActivas = this.sesionesActivas.filter(s => s.clave !== data.clave);
      this.cerrando.delete(data.clave);
    });

    this.socketService.onEstadoEventos((data: { asistencias: any[]; votaciones: any[] }) => {
      this.estadoEventos = data;
      this.estadoCargado = true;
    });

    this.socketService.emitGetSesionesActivas();
    this.socketService.emitGetEstadoEventos();
    // Refresco periódico: esta pantalla puede quedar abierta mucho tiempo, y
    // asistencia-abierta/votacion-abierta no le llegan en vivo (son solo para
    // la sala de diputados), así que sin esto el modo del link se quedaría
    // desactualizado si asistencia/votación abre después de cargar la página.
    this.estadoPollInterval = setInterval(() => this.socketService.emitGetEstadoEventos(), 15000);
  }

  ngOnDestroy(): void {
    this.socketService.offSesionesActivas();
    this.socketService.offSesionIniciada();
    this.socketService.offSesionTerminada();
    this.socketService.offEstadoEventos();
    if (this.estadoPollInterval) clearInterval(this.estadoPollInterval);
  }

  cerrarSesion(sesion: SesionActiva): void {
    if (this.cerrando.has(sesion.clave)) return;
    this.cerrando.add(sesion.clave);
    this.socketService.emitTerminarSesion(sesion.idAgenda, sesion.esComision);
  }

  formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const d = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T12:00:00`);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatTiempo(iniciadaEn: string): string {
    if (!iniciadaEn) return '';
    const diff = Math.floor((Date.now() - new Date(iniciadaEn).getTime()) / 60000);
    if (diff < 60) return `${diff} min en curso`;
    return `${Math.floor(diff / 60)}h ${diff % 60}min en curso`;
  }
}
