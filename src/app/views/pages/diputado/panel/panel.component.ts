import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiputadoService } from '../../../../core/services/diputado.service';
import { UserService } from '../../../../core/services/auth.service';
import { SocketService } from '../../../../core/services/socket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-panel-diputado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelDiputadoComponent implements OnInit, OnDestroy {

  private diputadoService = inject(DiputadoService);
  private userService = inject(UserService);
  private socketService = inject(SocketService);
  private router = inject(Router);

  perfil: any = null;
  cargandoPerfil = true;

  // Comisión del diputado en la sesión activa (para filtrar eventos del socket)
  miComision: string = '';

  // Estado de asistencia
  asistenciaAbierta: boolean = false;
  asistenciaRegistrada: boolean = false;
  idAgendaAsistencia: string = '';
  idComisionAsistencia: string = '';
  eventoAsistencia: { descripcion: string; fecha: string } | null = null;

  // Estado de votación
  votacionAbierta: boolean = false;
  votoRegistrado: boolean = false;
  puntoActivo: any = null;
  idAgendaVotacion: string = '';
  idComisionVotacion: string = '';
  idVotoPunto: string = '';
  sentidoVotado: number = 0;
  eventoVotacion: { descripcion: string; fecha: string } | null = null;

  ngOnInit(): void {
    this.cargarPerfil();
    this.restaurarEstadoPanel();
    this.escucharSocket();
  }

  ngOnDestroy(): void {
    this.socketService.offAsistenciaAbierta();
    this.socketService.offAsistenciaCerrada();
    this.socketService.offVotacionAbierta();
    this.socketService.offVotacionCerrada();
  }

  private cargarPerfil(): void {
    this.cargandoPerfil = true;
    this.diputadoService.getMiPerfil().subscribe({
      next: (resp) => {
        this.perfil = resp.integrante;
        this.cargandoPerfil = false;
      },
      error: () => {
        this.cargandoPerfil = false;
        Swal.fire('Error', 'No se pudo cargar tu perfil de diputado', 'error');
      }
    });
  }

  restaurarEstadoPanel(): void {
    this.diputadoService.getEstadoPanel().subscribe({
      next: (estado) => {
        if (estado.asistencia) {
          this.asistenciaAbierta = true;
          this.idAgendaAsistencia = estado.asistencia.idAgenda;
          this.idComisionAsistencia = estado.asistencia.idComision;
          this.miComision = estado.asistencia.idComision;
          this.asistenciaRegistrada = estado.asistencia.yaRegistro;
          this.eventoAsistencia = {
            descripcion: estado.asistencia.descripcion,
            fecha: estado.asistencia.fecha,
          };
        }
        if (estado.votacion) {
          this.votacionAbierta = true;
          this.idAgendaVotacion = estado.votacion.idAgenda;
          this.idComisionVotacion = estado.votacion.idComision;
          this.miComision = estado.votacion.idComision;
          this.puntoActivo = estado.votacion.punto;
          this.idVotoPunto = estado.votacion.id_voto_punto;
          this.votoRegistrado = estado.votacion.yaVoto;
          this.sentidoVotado = estado.votacion.sentidoActual || 0;
          this.eventoVotacion = {
            descripcion: estado.votacion.descripcion,
            fecha: estado.votacion.fecha,
          };
        }
      },
      error: () => {}
    });
  }

  private escucharSocket(): void {
    this.socketService.conectarComoDiputado();

    this.socketService.onAsistenciaAbierta((data) => {
      // Filtrar por comisión: si ya tenemos comisión asignada, solo mostrar la propia
      if (this.miComision && this.miComision !== data.idComision) return;

      this.asistenciaAbierta = true;
      this.asistenciaRegistrada = false;
      this.idAgendaAsistencia = data.idAgenda;
      this.idComisionAsistencia = data.idComision;
      if (!this.miComision) this.miComision = data.idComision;
      this.eventoAsistencia = null;
      // Cargar info del evento desde el servidor
      this.restaurarEstadoPanel();
    });

    this.socketService.onAsistenciaCerrada((data) => {
      if (this.idComisionAsistencia && this.idComisionAsistencia !== data.idComision) return;
      this.asistenciaAbierta = false;
      this.idAgendaAsistencia = '';
      this.idComisionAsistencia = '';
      this.eventoAsistencia = null;
    });

    this.socketService.onVotacionAbierta((data) => {
      if (this.miComision && this.miComision !== data.idComision) return;

      this.votacionAbierta = true;
      this.votoRegistrado = false;
      this.puntoActivo = data.punto;
      this.idAgendaVotacion = data.idAgenda;
      this.idComisionVotacion = data.idComision;
      if (!this.miComision) this.miComision = data.idComision;
      this.idVotoPunto = '';
      this.sentidoVotado = 0;
      this.eventoVotacion = null;
      // Obtener id_voto_punto e info del evento desde el servidor
      this.restaurarEstadoPanel();
    });

    this.socketService.onVotacionCerrada((data) => {
      if (this.idComisionVotacion && this.idComisionVotacion !== data.idComision) return;
      this.votacionAbierta = false;
      this.puntoActivo = null;
      this.idAgendaVotacion = '';
      this.idComisionVotacion = '';
      this.idVotoPunto = '';
      this.sentidoVotado = 0;
      this.eventoVotacion = null;
    });
  }

  registrarAsistencia(): void {
    if (!this.idAgendaAsistencia || !this.idComisionAsistencia) return;

    this.diputadoService.registrarAsistencia({
      id_agenda: this.idAgendaAsistencia,
      id_comision: this.idComisionAsistencia,
      partido_dip: this.perfil?.partido_id || '',
      id_cargo_dip: this.perfil?.id_cargo || null,
    }).subscribe({
      next: () => {
        this.asistenciaRegistrada = true;
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Asistencia registrada',
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: (e) => {
        const msg = e.error?.msg || 'Error al registrar asistencia';
        if (e.status === 409) this.asistenciaRegistrada = true;
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  votar(sentido: number): void {
    if (!this.idVotoPunto) {
      Swal.fire('Espera', 'Cargando datos de votación, intenta de nuevo en un momento.', 'info');
      this.restaurarEstadoPanel();
      return;
    }

    // Si ya votó lo mismo, no hacer nada
    if (this.sentidoVotado === sentido) return;

    const etiquetas: Record<number, string> = { 1: 'A favor', 2: 'Abstención', 3: 'En contra' };
    const esCambio = this.votoRegistrado;

    Swal.fire({
      title: esCambio ? '¿Cambiar tu voto?' : '¿Confirmas tu voto?',
      text: etiquetas[sentido],
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (!result.isConfirmed) return;

      this.diputadoService.registrarVoto({
        sentido_voto: sentido,
        id_voto_punto: this.idVotoPunto,
        id_comision: this.idComisionVotacion,
      }).subscribe({
        next: () => {
          this.votoRegistrado = true;
          this.sentidoVotado = sentido;
          const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
          Toast.fire({ icon: 'success', title: `Voto: ${etiquetas[sentido]}` });
        },
        error: (e) => {
          const msg = e.error?.msg || 'Error al registrar voto';
          Swal.fire('Error', msg, 'error');
        }
      });
    });
  }

  get etiquetaSentido(): string {
    const etiquetas: Record<number, string> = { 1: 'A favor', 2: 'Abstención', 3: 'En contra' };
    return etiquetas[this.sentidoVotado] || '';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  cerrarSesion(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.userService.clearSession();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.userService.clearSession();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
