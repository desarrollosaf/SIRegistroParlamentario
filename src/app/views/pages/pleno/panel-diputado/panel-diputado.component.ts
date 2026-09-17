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
 * A diferencia de pantalla-diputado.ts (pantalla física del Pleno, sin
 * login, identidad por reconocimiento facial), aquí REST (`getEstadoPanel`)
 * es la fuente de verdad y el socket solo avisa cuándo volver a preguntar.
 */
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
    this._socketService.offReconnect();
  }

  private iniciarPanel(): void {
    this._socketService.conectarComoDiputado();
    this.cargarEstado();

    this._socketService.onAsistenciaAbierta(() => this.cargarEstado());
    this._socketService.onAsistenciaCerrada(() => this.cargarEstado());
    this._socketService.onVotacionAbierta(() => this.cargarEstado());
    this._socketService.onVotacionCerrada(() => this.cargarEstado());
    this._socketService.onReconnect(() => this.cargarEstado());
  }

  private cargarEstado(): void {
    this.cargandoEstado = true;
    this._diputadoService.getEstadoPanel().subscribe({
      next: (r: any) => {
        this.asistencia = r?.asistencia ?? null;
        this.votacion = r?.votacion ?? null;
        this.cargandoEstado = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoEstado = false;
        this.cdr.detectChanges();
      }
    });
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
    this.router.navigate(['/auth/login']);
  }

  registrarAsistencia(): void {
    if (this.registrandoAsistencia || !this.asistencia || this.asistencia.yaRegistro) return;
    this.registrandoAsistencia = true;
    this._diputadoService.registrarAsistencia({
      id_agenda: this.asistencia.idAgenda,
      id_comision: this.asistencia.idComision,
    }).subscribe({
      next: () => {
        this.registrandoAsistencia = false;
        this.cargarEstado();
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
      id_comision: this.votacion.idComision,
    }).subscribe({
      next: () => {
        this.votando = false;
        this.cargarEstado();
      },
      error: (e: HttpErrorResponse) => {
        this.votando = false;
        console.error('Error al registrar voto:', e);
        this.cdr.detectChanges();
      }
    });
  }

  get sentidoActualLabel(): string {
    switch (this.votacion?.sentidoActual) {
      case 1: return 'A favor';
      case 2: return 'Abstención';
      case 3: return 'En contra';
      default: return '';
    }
  }
}
