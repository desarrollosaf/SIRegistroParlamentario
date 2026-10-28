import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { UserService } from '../../../../core/services/auth.service';
import { DiputadoService } from '../../../../core/services/diputado.service';
import { SocketService } from '../../../../core/services/socket.service';
import { enviroment } from '../../../../../enviroments/enviroment';

/**
 * Versión web de APP_SPID → Sesiones: el diputado entra con su usuario y
 * contraseña (login.component.ts lo manda aquí cuando el rol es 'diputado')
 * y ve la sesión del Pleno en vivo para registrar asistencia y votar.
 * Este componente solo confirma la sesión con `getMiPerfil` y, si no hay
 * sesión válida, manda a loguearse.
 *
 * El socket ('asistencia-abierta'/'votacion-abierta') ya trae todo lo
 * necesario para pintar la tarjeta al instante, sin pedirle nada al
 * backend — igual que pantalla-diputado.ts. Con ~75 diputados conectados a
 * la vez, si cada uno reaccionara a ese aviso llamando a getEstadoPanel()
 * REST, sería una ráfaga de 75 peticiones simultáneas a la BD justo en el
 * momento más cargado (pasó en producción). `getEstadoPanel()` solo se usa
 * en la carga inicial, al reconectar y cuando el admin corrige su registro.
 */
const SENTIDO_LABEL: Record<number, string> = { 0: 'Sin registro', 1: 'A favor', 2: 'Abstención', 3: 'En contra' };
const LARGO_TEXTO_CORTO = 110;

/** Saca el id de un enlace de YouTube: watch?v=ID, youtu.be/ID, /live/ID, /embed/ID o el id solo. */
function idDeYoutube(url: string): string | null {
  const m = url.trim().match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/) ?? url.trim().match(/^([\w-]{11})$/);
  return m ? m[1] : null;
}

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
  private diputadoId: string | null = null;

  // Estado del panel (fuente de verdad: DiputadoService.getEstadoPanel)
  asistencia: any = null;
  votacion: any = null;
  cargandoEstado: boolean = false;
  registrandoAsistencia: boolean = false;
  votando: boolean = false;
  textoExpandido: boolean = false;
  readonly largoTextoCorto = LARGO_TEXTO_CORTO;

  // Sesión plenaria activa (independiente de si hay asistencia/votación abierta ahora mismo)
  sesionActiva: boolean = false;
  sesionNombre: string = '';
  private sesionIdAgenda: string = '';
  /** Ya registró asistencia en la sesión plenaria (para la insignia del banner). */
  asistenciaRegistrada: boolean = false;

  /** Transmisión de la sesión (se arma una sola vez para que el iframe no se recargue). */
  readonly videoUrl: SafeResourceUrl | null;

  // Vista de detalle (orden del día / mis votos) cuando la sesión está activa
  // pero no hay asistencia ni votación abierta en este momento.
  vistaDetalle: 'none' | 'orden' | 'votos' = 'none';
  ordenDelDia: any[] = [];
  misVotos: any[] = [];
  cargandoDetalle: boolean = false;
  errorDetalle: boolean = false;

  constructor(sanitizer: DomSanitizer) {
    const id = idDeYoutube((enviroment as any).sesionVideoUrl ?? '');
    this.videoUrl = id
      ? sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`)
      : null;
  }

  ngOnInit(): void {
    this._diputadoService.getMiPerfil().subscribe({
      next: (r: any) => {
        const dip = r?.integrante?.diputado;
        this.diputadoId = r?.integrante?.diputado_id ?? dip?.id ?? null;
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
    this._socketService.offAsistenciaActualizadaAdmin();
    this._socketService.offVotoActualizadoAdmin();
    this._socketService.offReconnect();
  }

  private iniciarPanel(): void {
    this._socketService.conectarComoDiputado(this.diputadoId);
    // El estado se carga cuando se sabe cuál es la sesión plenaria (respuesta
    // de 'sesiones-activas'), para pedirlo filtrado por esa agenda.

    // Este panel es SOLO del Pleno: sala-diputados también recibe las
    // aperturas/cierres de comisiones (esas se votan en APP_SPID → Comisiones,
    // que manda id_comision). Si se aceptaran aquí, el voto/asistencia iría sin
    // id_comision y caería en la fila de otra comisión o daría 404.
    //
    // Se pinta directo del payload del socket — cero peticiones a la BD.
    // Se asume "todavía no registrado/votado" porque el evento recién abre;
    // si este celular ya tenía el estado real (por ejemplo, se reconectó a
    // media votación), cargarEstado() tras la reconexión lo corrige.
    this._socketService.onAsistenciaAbierta((data) => {
      if (!this.esDelPleno(data)) return;
      this.asistencia = { idAgenda: data.idAgenda, idComision: data.idComision, yaRegistro: this.asistenciaRegistrada };
      this.cdr.detectChanges();
    });
    this._socketService.onAsistenciaCerrada((data) => {
      if (!this.asistencia || (data?.idComision ?? '') !== (this.asistencia.idComision ?? '')) return;
      this.asistencia = null;
      this.cdr.detectChanges();
    });
    this._socketService.onVotacionAbierta((data) => {
      if (!this.esDelPleno(data)) return;
      this.votacion = this.armarVotacion(data, false, 0);
      this.textoExpandido = false;
      this.cdr.detectChanges();
    });
    this._socketService.onVotacionCerrada((data) => {
      if (!this.votacion || (data?.idComision ?? '') !== (this.votacion.idComision ?? '')) return;
      this.votacion = null;
      this.cdr.detectChanges();
    });

    this._socketService.onSesionesActivas((lista: any[]) => {
      const plenaria = lista.find((s: any) => !s.esComision);
      if (plenaria) {
        this.sesionActiva = true;
        this.sesionNombre = plenaria.titulo ?? '';
        this.sesionIdAgenda = plenaria.idAgenda ?? '';
        this.cargarMiAsistencia();
      } else {
        this.limpiarSesion();
      }
      this.cargarEstado();
      this.cdr.detectChanges();
    });
    this._socketService.emitGetSesionesActivas();

    this._socketService.onSesionIniciada((data) => {
      if (data.esComision) return;
      this.sesionActiva = true;
      this.sesionNombre = data.titulo ?? '';
      this.sesionIdAgenda = data.idAgenda ?? '';
      this.asistenciaRegistrada = false;
      this.vistaDetalle = 'none';
      this.cdr.detectChanges();
    });

    this._socketService.onSesionTerminada((data) => {
      if (this.sesionIdAgenda && data.idAgenda !== this.sesionIdAgenda) return;
      this.limpiarSesion();
      this.cdr.detectChanges();
    });

    // El admin corrigió la asistencia o el voto de este diputado desde su
    // pantalla: se vuelve a pedir el estado para que aquí se vea lo mismo.
    const alCorregirAdmin = () => {
      this.cargarMiAsistencia();
      this.cargarEstado();
    };
    this._socketService.onAsistenciaActualizadaAdmin(alCorregirAdmin);
    this._socketService.onVotoActualizadoAdmin(alCorregirAdmin);

    // La respuesta de 'sesiones-activas' vuelve a cargar el estado.
    this._socketService.onReconnect(() => {
      this._socketService.emitGetSesionesActivas();
    });
  }

  /** Es de la sesión plenaria activa, o el backend dice que es una Sesión
   *  (cubre que el admin abra asistencia/votación sin haber dado "Iniciar"). */
  private esDelPleno(data: { idAgenda?: string; esSesion?: boolean | null }): boolean {
    if (this.sesionIdAgenda && data.idAgenda === this.sesionIdAgenda) return true;
    return data.esSesion === true;
  }

  private armarVotacion(v: any, yaVoto: boolean, sentidoActual: number): any {
    const idReserva = v.idReserva ?? null;
    const idIniciativa = v.idIniciativa ?? null;
    return {
      idAgenda: v.idAgenda,
      idComision: v.idComision,
      idPunto: v.idPunto ?? null,
      idReserva,
      idIniciativa,
      id_voto_punto: v.id_voto_punto,
      puntoTexto: this.extraerTextoVotacion(v.punto, idReserva, idIniciativa),
      noPunto: v.punto?.nopunto ?? null,
      tipoPunto: idReserva ? 'Reserva' : idIniciativa ? 'Iniciativa' : '',
      yaVoto,
      sentidoActual,
    };
  }

  private limpiarSesion(): void {
    this.sesionActiva = false;
    this.sesionNombre = '';
    this.sesionIdAgenda = '';
    this.asistenciaRegistrada = false;
    this.vistaDetalle = 'none';
    this.asistencia = null;
    this.votacion = null;
  }

  private cargarMiAsistencia(): void {
    if (!this.sesionIdAgenda) return;
    this._diputadoService.getMiAsistencia(this.sesionIdAgenda).subscribe({
      next: (r: any) => {
        this.asistenciaRegistrada = !!r?.yaRegistro;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  verOrden(): void {
    if (this.vistaDetalle === 'orden') { this.vistaDetalle = 'none'; return; }
    this.vistaDetalle = 'orden';
    this.cargarOrdenDelDia();
  }

  private cargarOrdenDelDia(): void {
    if (!this.sesionIdAgenda) return;
    this.cargandoDetalle = true;
    this.errorDetalle = false;
    this._diputadoService.getOrdenDelDia(this.sesionIdAgenda).subscribe({
      next: (r: any) => { this.ordenDelDia = r.puntos || []; this.cargandoDetalle = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoDetalle = false; this.errorDetalle = true; this.cdr.detectChanges(); }
    });
  }

  verVotos(): void {
    if (this.vistaDetalle === 'votos') { this.vistaDetalle = 'none'; return; }
    this.vistaDetalle = 'votos';
    this.cargarMisVotos();
  }

  private cargarMisVotos(): void {
    if (!this.sesionIdAgenda) return;
    this.cargandoDetalle = true;
    this.errorDetalle = false;
    this._diputadoService.getMisVotos(this.sesionIdAgenda).subscribe({
      next: (r: any) => { this.misVotos = r.votos || []; this.cargandoDetalle = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoDetalle = false; this.errorDetalle = true; this.cdr.detectChanges(); }
    });
  }

  reintentarDetalle(): void {
    if (this.vistaDetalle === 'orden') this.cargarOrdenDelDia();
    else if (this.vistaDetalle === 'votos') this.cargarMisVotos();
  }

  private cargarEstado(): void {
    this.cargandoEstado = true;
    // Con sesión plenaria iniciada se filtra por su agenda; sin ella, el
    // backend regresa lo que haya abierto y aquí se descarta lo de comisiones.
    this._diputadoService.getEstadoPanel(this.sesionIdAgenda || undefined).subscribe({
      next: (r: any) => {
        const a = r?.asistencia;
        this.asistencia = a && this.esDelPleno(a) ? a : null;
        if (this.asistencia?.yaRegistro) this.asistenciaRegistrada = true;
        const v = r?.votacion && this.esDelPleno(r.votacion) ? r.votacion : null;
        const mismaVotacion = v && this.votacion && this.votacion.id_voto_punto === v.id_voto_punto;
        this.votacion = v ? this.armarVotacion(v, v.yaVoto, v.sentidoActual ?? 0) : null;
        if (!mismaVotacion) this.textoExpandido = false;
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
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Dejarás de recibir la asistencia y las votaciones en este dispositivo.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#96134b',
    }).then(res => {
      if (!res.isConfirmed) return;
      this._userService.logout().subscribe({
        next: () => this.finalizarSesionLocal(),
        error: () => this.finalizarSesionLocal()
      });
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
      next: () => this.marcarAsistenciaRegistrada(),
      error: (e: HttpErrorResponse) => {
        // 409 = ya se había registrado (p. ej. doble clic o el admin ya lo
        // marcó): no es un error real, ya quedó guardada.
        if (e.status === 409) { this.marcarAsistenciaRegistrada(); return; }
        this.registrandoAsistencia = false;
        this.cdr.detectChanges();
        this.mostrarErrorConReintento(
          'No se pudo registrar la asistencia. Verifica tu conexión e intenta de nuevo.',
          () => this.registrarAsistencia()
        );
      }
    });
  }

  private marcarAsistenciaRegistrada(): void {
    this.registrandoAsistencia = false;
    // Actualización optimista: la petición ya confirmó el registro, no
    // hace falta otra ida y vuelta a la BD solo para refrescar la vista.
    if (this.asistencia) this.asistencia.yaRegistro = true;
    this.asistenciaRegistrada = true;
    this.cdr.detectChanges();
  }

  votar(sentido: number): void {
    if (this.votando || !this.votacion) return;
    this.votando = true;
    const votacion = this.votacion;
    this._diputadoService.registrarVoto({
      sentido_voto: sentido,
      id_voto_punto: votacion.id_voto_punto,
      idPunto: votacion.idPunto,
      idReserva: votacion.idReserva,
      idIniciativa: votacion.idIniciativa,
    }).subscribe({
      next: () => {
        this.votando = false;
        votacion.yaVoto = true;
        votacion.sentidoActual = sentido;
        this.cdr.detectChanges();
      },
      error: () => {
        this.votando = false;
        this.cdr.detectChanges();
        // Si la votación ya se cerró mientras tanto, no tiene caso reintentar.
        if (this.votacion !== votacion) return;
        this.mostrarErrorConReintento(
          'No se pudo registrar el voto. La votación puede haber sido cerrada o hay un problema de conexión.',
          () => this.votar(sentido)
        );
      }
    });
  }

  private mostrarErrorConReintento(mensaje: string, reintentar: () => void): void {
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Reintentar',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#96134b',
    }).then(res => { if (res.isConfirmed) reintentar(); });
  }

  esSentidoActivo(sentido: number): boolean {
    return !!this.votacion?.yaVoto && this.votacion.sentidoActual === sentido;
  }

  get sentidoActualLabel(): string {
    return SENTIDO_LABEL[this.votacion?.sentidoActual] ?? '';
  }
}
