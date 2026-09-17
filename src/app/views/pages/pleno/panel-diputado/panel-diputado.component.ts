import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../../core/services/auth.service';
import { DiputadoService } from '../../../../core/services/diputado.service';
import { SocketService } from '../../../../core/services/socket.service';

/**
 * Pantalla móvil del diputado: equivalente en SIRegistroParlamentario a la
 * app que hoy usan en spid para registrar asistencia/voto desde el celular.
 * El login pasa por el mismo /auth/login de siempre (login.component.ts ya
 * redirige aquí cuando el rol es 'diputado') — este componente solo confirma
 * la sesión con `getMiPerfil` y, si no hay sesión válida, manda a loguearse.
 *
 * El socket ('asistencia-abierta'/'votacion-abierta') ya trae todo lo
 * necesario para pintar la tarjeta al instante, sin pedirle nada al
 * backend — igual que pantalla-diputado.ts. Con ~75 diputados conectados a
 * la vez, si cada uno reaccionara a ese aviso llamando a getEstadoPanel()
 * REST, sería una ráfaga de 75 peticiones simultáneas a la BD justo en el
 * momento más cargado (pasó en producción). `getEstadoPanel()` solo se usa
 * en la carga inicial y al reconectar, para saber si YA había votado/
 * registrado asistencia antes de que este celular se conectara.
 */
const SENTIDO_LABEL: Record<number, string> = { 1: 'A favor', 2: 'Abstención', 3: 'En contra' };
@Component({
  selector: 'app-panel-diputado',
  imports: [CommonModule],
  templateUrl: './panel-diputado.component.html',
  styleUrl: './panel-diputado.component.scss'
})
export class PanelDiputadoComponent implements OnInit, OnDestroy {

  private _userService = inject(UserService);
  private _diputadoService = inject(DiputadoService);
  private _socketService = inject(SocketService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  vista: 'cargando' | 'panel' = 'cargando';

  // Perfil
  nombreCompleto: string = '';

  // Estado del panel (fuente de verdad: DiputadoService.getEstadoPanel)
  asistencia: any = null;
  votacion: any = null;
  cargandoEstado: boolean = false;
  registrandoAsistencia: boolean = false;
  votando: boolean = false;

  // Sesión plenaria activa (independiente de si hay asistencia/votación abierta ahora mismo)
  sesionActiva: boolean = false;
  sesionNombre: string = '';
  private sesionIdAgenda: string = '';

  // Vista de detalle (orden del día / mis votos) cuando la sesión está activa
  // pero no hay asistencia ni votación abierta en este momento.
  vistaDetalle: 'none' | 'orden' | 'votos' = 'none';
  ordenDelDia: any[] = [];
  misVotos: any[] = [];
  cargandoDetalle: boolean = false;

  ngOnInit(): void {
    this._diputadoService.getMiPerfil().subscribe({
      next: (r: any) => {
        const dip = r?.integrante?.diputado;
        this.nombreCompleto = dip?.alias || `${dip?.nombres ?? ''} ${dip?.apaterno ?? ''} ${dip?.amaterno ?? ''}`.trim();
        this.vista = 'panel';
        this.iniciarPanel();
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/diputado' } });
      }
    });
  }

  ngOnDestroy(): void {
    this._socketService.offAsistenciaAbierta();
    this._socketService.offAsistenciaCerrada();
    this._socketService.offVotacionAbierta();
    this._socketService.offVotacionCerrada();
    this._socketService.offSesionesActivas();
    this._socketService.offSesionIniciada();
    this._socketService.offSesionTerminada();
    this._socketService.offReconnect();
  }

  private iniciarPanel(): void {
    this._socketService.conectarComoDiputado();
    this.cargarEstado();

    // Se pinta directo del payload del socket — cero peticiones a la BD.
    // Se asume "todavía no registrado/votado" porque el evento recién abre;
    // si este celular ya tenía el estado real (por ejemplo, se reconectó a
    // media votación), cargarEstado() en onReconnect lo corrige.
    this._socketService.onAsistenciaAbierta((data) => {
      this.asistencia = { idAgenda: data.idAgenda, idComision: data.idComision, yaRegistro: false };
      this.cdr.detectChanges();
    });
    this._socketService.onAsistenciaCerrada(() => {
      this.asistencia = null;
      this.cdr.detectChanges();
    });
    this._socketService.onVotacionAbierta((data) => {
      this.votacion = {
        idAgenda: data.idAgenda,
        idComision: data.idComision,
        idPunto: data.idPunto ?? null,
        idReserva: data.idReserva ?? null,
        idIniciativa: data.idIniciativa ?? null,
        puntoTexto: this.extraerTextoVotacion(data.punto, data.idReserva, data.idIniciativa),
        yaVoto: false,
        sentidoActual: 0,
      };
      this.cdr.detectChanges();
    });
    this._socketService.onVotacionCerrada(() => {
      this.votacion = null;
      this.cdr.detectChanges();
    });

    this._socketService.onSesionesActivas((lista: any[]) => {
      const plenaria = lista.find((s: any) => !s.esComision);
      if (plenaria) {
        this.sesionActiva = true;
        this.sesionNombre = plenaria.titulo ?? '';
        this.sesionIdAgenda = plenaria.idAgenda ?? '';
      } else {
        this.limpiarSesion();
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
      this.limpiarSesion();
      this.cdr.detectChanges();
    });

    this._socketService.onReconnect(() => {
      this.cargarEstado();
      this._socketService.emitGetSesionesActivas();
    });
  }

  private limpiarSesion(): void {
    this.sesionActiva = false;
    this.sesionNombre = '';
    this.sesionIdAgenda = '';
    this.vistaDetalle = 'none';
    this.asistencia = null;
    this.votacion = null;
  }

  verOrden(): void {
    if (this.vistaDetalle === 'orden') { this.vistaDetalle = 'none'; return; }
    this.vistaDetalle = 'orden';
    if (!this.sesionIdAgenda) return;
    this.cargandoDetalle = true;
    this._diputadoService.getOrdenDelDia(this.sesionIdAgenda).subscribe({
      next: (r: any) => { this.ordenDelDia = r.puntos || []; this.cargandoDetalle = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoDetalle = false; this.cdr.detectChanges(); }
    });
  }

  verVotos(): void {
    if (this.vistaDetalle === 'votos') { this.vistaDetalle = 'none'; return; }
    this.vistaDetalle = 'votos';
    if (!this.sesionIdAgenda) return;
    this.cargandoDetalle = true;
    this._diputadoService.getMisVotos(this.sesionIdAgenda).subscribe({
      next: (r: any) => { this.misVotos = r.votos || []; this.cargandoDetalle = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoDetalle = false; this.cdr.detectChanges(); }
    });
  }

  private cargarEstado(): void {
    this.cargandoEstado = true;
    this._diputadoService.getEstadoPanel().subscribe({
      next: (r: any) => {
        this.asistencia = r?.asistencia ?? null;
        const v = r?.votacion;
        this.votacion = v ? {
          idAgenda: v.idAgenda,
          idComision: v.idComision,
          idPunto: v.idPunto ?? null,
          idReserva: v.idReserva ?? null,
          idIniciativa: v.idIniciativa ?? null,
          id_voto_punto: v.id_voto_punto,
          puntoTexto: this.extraerTextoVotacion(v.punto, v.idReserva, v.idIniciativa),
          yaVoto: v.yaVoto,
          sentidoActual: v.sentidoActual ?? 0,
        } : null;
        this.cargandoEstado = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoEstado = false;
        this.cdr.detectChanges();
      }
    });
  }

  private extraerTextoVotacion(punto: any, idReserva?: any, idIniciativa?: any): string {
    if (!punto) return 'Punto en votación';
    if (typeof punto === 'string') return punto;
    if (idReserva && punto.reservas?.length) {
      const r = punto.reservas.find((x: any) => String(x.id) === String(idReserva));
      if (r?.tema_votacion) return r.tema_votacion;
    }
    if (idIniciativa && punto.iniciativas?.length) {
      const i = punto.iniciativas.find((x: any) => String(x.id) === String(idIniciativa));
      if (i?.iniciativa) return i.iniciativa;
    }
    return punto.punto ?? punto.descripcion ?? punto.titulo ?? 'Punto en votación';
  }

  cerrarSesion(): void {
    this._userService.logout().subscribe({
      next: () => this.finalizarSesionLocal(),
      error: () => this.finalizarSesionLocal()
    });
  }

  private finalizarSesionLocal(): void {
    this._userService.clearSession();
    this._socketService.disconnect();
    this.asistencia = null;
    this.votacion = null;
    this.limpiarSesion();
    this.router.navigate(['/auth/login']);
  }

  registrarAsistencia(): void {
    if (this.registrandoAsistencia || !this.asistencia || this.asistencia.yaRegistro) return;
    this.registrandoAsistencia = true;
    this._diputadoService.registrarAsistencia({
      id_agenda: this.asistencia.idAgenda,
    }).subscribe({
      next: () => {
        this.registrandoAsistencia = false;
        // Actualización optimista: la petición ya confirmó el registro, no
        // hace falta otra ida y vuelta a la BD solo para refrescar la vista.
        if (this.asistencia) this.asistencia.yaRegistro = true;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.registrandoAsistencia = false;
        console.error('Error al registrar asistencia:', e);
        this.cdr.detectChanges();
      }
    });
  }

  votar(sentido: number): void {
    if (this.votando || !this.votacion) return;
    this.votando = true;
    this._diputadoService.registrarVoto({
      sentido_voto: sentido,
      id_voto_punto: this.votacion.id_voto_punto,
      idPunto: this.votacion.idPunto,
      idReserva: this.votacion.idReserva,
      idIniciativa: this.votacion.idIniciativa,
    }).subscribe({
      next: () => {
        this.votando = false;
        if (this.votacion) {
          this.votacion.yaVoto = true;
          this.votacion.sentidoActual = sentido;
        }
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.votando = false;
        console.error('Error al registrar voto:', e);
        this.cdr.detectChanges();
      }
    });
  }

  get sentidoActualLabel(): string {
    return SENTIDO_LABEL[this.votacion?.sentidoActual] ?? '';
  }
}
