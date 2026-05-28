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
  sesionActiva: boolean = false;
  agenda: any = null;
  puntos: any[] = [];
  idComision: string = '';

  // Estado de asistencia
  asistenciaAbierta: boolean = false;
  asistenciaRegistrada: boolean = false;
  idAgendaAsistencia: string = '';

  // Estado de votación
  votacionAbierta: boolean = false;
  votoRegistrado: boolean = false;
  puntoActivo: any = null;
  idAgendaVotacion: string = '';

  ngOnInit(): void {
    this.cargarPerfil();
    this.escucharSocket();
  }

  ngOnDestroy(): void {
    this.socketService.offAsistenciaAbierta();
    this.socketService.offAsistenciaCerrada();
    this.socketService.offVotacionAbierta();
    this.socketService.offVotacionCerrada();
  }

  private cargarPerfil(): void {
    this.diputadoService.getMiPerfil().subscribe({
      next: (resp) => {
        this.perfil = resp.integrante;
        // La comisión del diputado se puede derivar del integrante o usamos la que el socket manda
        // Para la consulta de orden del día necesitamos el idComision de la sesión actual
        // Por ahora dejamos que el socket nos avise con el idAgenda
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar tu perfil de diputado', 'error');
      }
    });
  }

  private escucharSocket(): void {
    this.socketService.conectarComoDiputado();

    this.socketService.onAsistenciaAbierta((data) => {
      this.asistenciaAbierta = true;
      this.asistenciaRegistrada = false;
      this.idAgendaAsistencia = data.idAgenda;
    });

    this.socketService.onAsistenciaCerrada(() => {
      this.asistenciaAbierta = false;
    });

    this.socketService.onVotacionAbierta((data) => {
      this.votacionAbierta = true;
      this.votoRegistrado = false;
      this.puntoActivo = data.punto;
      this.idAgendaVotacion = data.idAgenda;
    });

    this.socketService.onVotacionCerrada(() => {
      this.votacionAbierta = false;
      this.puntoActivo = null;
    });
  }

  registrarAsistencia(): void {
    if (!this.idAgendaAsistencia) return;

    this.diputadoService.registrarAsistencia({
      id_agenda: this.idAgendaAsistencia,
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
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  votar(sentido: number): void {
    if (!this.idAgendaVotacion) return;

    const etiquetas: Record<number, string> = { 1: 'A favor', 2: 'Abstención', 3: 'En contra' };

    Swal.fire({
      title: '¿Confirmas tu voto?',
      text: etiquetas[sentido],
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (!result.isConfirmed) return;

      this.diputadoService.registrarVoto({
        id_agenda: this.idAgendaVotacion,
        sentido_voto: sentido,
        partido_dip: this.perfil?.partido_id || '',
        id_cargo_dip: this.perfil?.id_cargo || null,
      }).subscribe({
        next: () => {
          this.votoRegistrado = true;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: `Voto registrado: ${etiquetas[sentido]}`,
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (e) => {
          const msg = e.error?.msg || 'Error al registrar voto';
          Swal.fire('Error', msg, 'error');
        }
      });
    });
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
