import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SocketService } from '../../../../core/services/socket.service';
import { PlenoService } from '../../../../service/pleno.service';

const SENTIDO: Record<string, number> = { FAVOR: 1, ABSTENCION: 2, CONTRA: 3, 'SIN REGISTRO': 0 };

/**
 * Pantalla física del Pleno — sin login. Se une a la sala de sesiones igual
 * que un diputado en la app SPID, así que siempre muestra "sesión en curso",
 * orden del día, etc., sin importar si hay alguien sentado enfrente.
 *
 * El reconocimiento facial (programa aparte en Python) solo entra en juego
 * para lo que sí necesita saber DE QUIÉN se trata: marcar asistencia
 * automática, atribuir un voto a la persona correcta, y mostrar "mis votos".
 * Le avisa a esta pantalla vía el socket 'identidad-detectada'.
 */
@Component({
  selector: 'app-pantalla-diputado',
  imports: [CommonModule],
  templateUrl: './pantalla-diputado.component.html',
  styleUrl: './pantalla-diputado.component.scss'
})
export class PantallaDiputadoComponent implements OnInit, OnDestroy {

  private _socketService = inject(SocketService);
  private _plenoService = inject(PlenoService);
  private cdr = inject(ChangeDetectorRef);
  private aRouter = inject(ActivatedRoute);

  idPantalla: string = '';

  // Identidad de quién está sentado enfrente ahora mismo (o ninguna).
  identificado: boolean = false;
  diputadoId: string = '';
  nombreDiputado: string = '';

  // Sesión plenaria activa (independiente de la identidad).
  sesionActiva: boolean = false;
  sesionNombre: string = '';
  private sesionIdAgenda: string = '';

  // Estado del evento: 0 = nada, 2 = asistencia, 3 = votación.
  evento: number = 0;
  asistenciaRegistrada: boolean = false;
  registrandoAsistencia: boolean = false;

  temaVotacion: string = '';
  tipoPuntoVotacion: string = '';
  noPuntoVotacion: number | null = null;
  textoExpandido: boolean = false;
  miVoto: string = '';
  votando: boolean = false;

  // Vista de detalle (orden del día / mis votos) cuando no hay evento activo.
  vistaDetalle: 'none' | 'orden' | 'votos' = 'none';
  ordenDelDia: any[] = [];
  misVotos: any[] = [];
  cargandoDetalle: boolean = false;

  private idAgendaActual: string = '';
  private idVotoPuntoActual: string = '';

  ngOnInit(): void {
    this.idPantalla = String(this.aRouter.snapshot.paramMap.get('idPantalla'));

    // Se une tanto a la sala general de diputados (para enterarse de la sesión,
    // asistencia y votación abiertas) como a la sala propia de esta pantalla
    // (para recibir identidad-detectada/identidad-perdida).
    this._socketService.conectarComoDiputado();
    this._socketService.conectarComoPantalla(this.idPantalla);

    this._socketService.onIdentidadDetectada((data) => {
      this.identificado = true;
      this.diputadoId = data.diputado_id;
      this.nombreDiputado = data.nombre;
      this.refrescarEstadoIdentidad();
    });

    this._socketService.onIdentidadPerdida(() => {
      this.identificado = false;
      this.diputadoId = '';
      this.nombreDiputado = '';
      this.asistenciaRegistrada = false;
      this.miVoto = '';
      this.misVotos = [];
      this.cdr.detectChanges();
    });

    this._socketService.onSesionesActivas((lista: any[]) => {
      const plenaria = lista.find((s: any) => !s.esComision);
      if (plenaria) {
        this.sesionActiva = true;
        this.sesionNombre = plenaria.titulo ?? '';
        this.sesionIdAgenda = plenaria.idAgenda ?? '';
      } else {
        this.sesionActiva = false;
        this.sesionNombre = '';
        this.sesionIdAgenda = '';
        this.limpiarEvento();
      }
      this.cdr.detectChanges();
    });
    this._socketService.emitGetSesionesActivas();

    this._socketService.onSesionIniciada((data) => {
      if (data.esComision) return;
      this.sesionActiva = true;
      this.sesionNombre = data.titulo ?? '';
      this.sesionIdAgenda = data.idAgenda ?? '';
      this.vistaDetalle = 'none';
      this.cdr.detectChanges();
    });

    this._socketService.onSesionTerminada((data) => {
      if (this.sesionIdAgenda && data.idAgenda !== this.sesionIdAgenda) return;
      this.sesionActiva = false;
      this.sesionNombre = '';
      this.sesionIdAgenda = '';
      this.vistaDetalle = 'none';
      this.limpiarEvento();
      this.cdr.detectChanges();
    });

    this._socketService.onAsistenciaAbierta((data) => {
      if (!this.sesionIdAgenda || data.idAgenda !== this.sesionIdAgenda) return;
      this.idAgendaActual = data.idAgenda;
      this.evento = 2;
      this.asistenciaRegistrada = false;
      if (this.identificado) this.refrescarEstadoIdentidad();
      this.cdr.detectChanges();
    });

    this._socketService.onAsistenciaCerrada(() => {
      if (this.evento === 2) this.evento = 0;
      this.cdr.detectChanges();
    });

    this._socketService.onVotacionAbierta((data) => {
      if (!this.sesionIdAgenda || data.idAgenda !== this.sesionIdAgenda) return;
      this.idAgendaActual = data.idAgenda;
      this.temaVotacion = this.extraerTextoVotacion(data.punto, data.idReserva, data.idIniciativa);
      this.noPuntoVotacion = (data.punto as any)?.nopunto ?? null;
      this.tipoPuntoVotacion = data.idReserva ? 'Reserva' : data.idIniciativa ? 'Iniciativa' : '';
      this.textoExpandido = false;
      this.miVoto = '';
      this.evento = 3;
      if (this.identificado) this.refrescarEstadoIdentidad();
      this.cdr.detectChanges();
    });

    this._socketService.onVotacionCerrada(() => {
      if (this.evento === 3) {
        this.evento = 0;
        this.temaVotacion = '';
        this.miVoto = '';
      }
      this.cdr.detectChanges();
    });

    // Si se recupera la conexión, se vuelve a preguntar todo por si se perdió algo.
    this._socketService.onReconnect(() => {
      this._socketService.emitGetSesionesActivas();
      if (this.identificado) this.refrescarEstadoIdentidad();
    });
  }

  ngOnDestroy(): void {
    this._socketService.offIdentidadDetectada();
    this._socketService.offIdentidadPerdida();
    this._socketService.offSesionesActivas();
    this._socketService.offSesionIniciada();
    this._socketService.offSesionTerminada();
    this._socketService.offAsistenciaAbierta();
    this._socketService.offAsistenciaCerrada();
    this._socketService.offVotacionAbierta();
    this._socketService.offVotacionCerrada();
    this._socketService.offReconnect();
  }

  private limpiarEvento(): void {
    this.evento = 0;
    this.temaVotacion = '';
    this.miVoto = '';
    this.idAgendaActual = '';
    this.idVotoPuntoActual = '';
  }

  /** Consulta si YA se registró asistencia/voto para el diputado identificado. */
  private refrescarEstadoIdentidad(): void {
    if (!this.diputadoId) return;
    this._plenoService.getEstado(this.diputadoId).subscribe({
      next: (estado: any) => {
        if (estado.votacion && this.evento === 3) {
          this.idVotoPuntoActual = estado.votacion.id_voto_punto;
          if (estado.votacion.yaVoto && estado.votacion.sentidoActual) {
            const labels: Record<number, string> = { 1: 'FAVOR', 2: 'ABSTENCION', 3: 'CONTRA' };
            this.miVoto = labels[estado.votacion.sentidoActual] ?? '';
          }
        } else if (estado.asistencia && this.evento === 2) {
          this.asistenciaRegistrada = estado.asistencia.yaRegistro;
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  private extraerTextoVotacion(punto: any, idReserva?: any, idIniciativa?: any): string {
    if (!punto) return '';
    if (typeof punto === 'string') return punto;
    if (idReserva && punto.reservas?.length) {
      const r = punto.reservas.find((x: any) => String(x.id) === String(idReserva));
      if (r?.tema_votacion) return r.tema_votacion;
    }
    if (idIniciativa && punto.iniciativas?.length) {
      const i = punto.iniciativas.find((x: any) => String(x.id) === String(idIniciativa));
      if (i?.iniciativa) return i.iniciativa;
    }
    return punto.punto ?? punto.descripcion ?? punto.titulo ?? '';
  }

  get temaVotacionCorto(): string {
    return this.temaVotacion.length > 110 ? this.temaVotacion.slice(0, 110) : this.temaVotacion;
  }

  votar(tipo: string): void {
    if (this.votando || !this.identificado) return;
    const prevVoto = this.miVoto;
    this.miVoto = tipo;
    this.votando = true;
    this._plenoService.registrarVoto({
      diputado_id: this.diputadoId,
      sentido_voto: SENTIDO[tipo] ?? 1,
      id_voto_punto: this.idVotoPuntoActual,
    }).subscribe({
      next: () => { this.votando = false; },
      error: (e: HttpErrorResponse) => {
        this.votando = false;
        this.miVoto = prevVoto;
        console.error('Error al registrar voto:', e);
      }
    });
  }

  registrarAsistencia(): void {
    if (this.registrandoAsistencia || this.asistenciaRegistrada || !this.identificado) return;
    this.registrandoAsistencia = true;
    this._plenoService.registrarAsistencia({
      diputado_id: this.diputadoId,
      id_agenda: this.idAgendaActual,
    }).subscribe({
      next: () => {
        this.asistenciaRegistrada = true;
        this.registrandoAsistencia = false;
      },
      error: (e: HttpErrorResponse) => {
        this.registrandoAsistencia = false;
        console.error('Error al registrar asistencia:', e);
      }
    });
  }

  verOrden(): void {
    if (this.vistaDetalle === 'orden') { this.vistaDetalle = 'none'; return; }
    this.vistaDetalle = 'orden';
    if (!this.sesionIdAgenda) return;
    this.cargandoDetalle = true;
    this._plenoService.getOrdenDelDia(this.sesionIdAgenda).subscribe({
      next: (r: any) => { this.ordenDelDia = r.puntos || []; this.cargandoDetalle = false; },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  verVotos(): void {
    if (this.vistaDetalle === 'votos') { this.vistaDetalle = 'none'; return; }
    this.vistaDetalle = 'votos';
    if (!this.identificado || !this.sesionIdAgenda) return;
    this.cargandoDetalle = true;
    this._plenoService.getMisVotos(this.diputadoId, this.sesionIdAgenda).subscribe({
      next: (r: any) => { this.misVotos = r.votos || []; this.cargandoDetalle = false; },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  get miVotoLabel(): string {
    switch (this.miVoto) {
      case 'FAVOR': return 'A Favor';
      case 'CONTRA': return 'En Contra';
      case 'ABSTENCION': return 'Abstención';
      case 'SIN REGISTRO': return 'Sin Registro';
      default: return '';
    }
  }
}
