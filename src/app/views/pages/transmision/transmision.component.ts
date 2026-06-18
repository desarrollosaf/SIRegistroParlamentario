import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../../core/services/socket.service';
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

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.conectar();

    this.socketService.onSesionesActivas((lista: any[]) => {
      this.sesionesActivas = lista.filter(s => s.esComision);
    });

    this.socketService.onSesionIniciada((data: any) => {
      if (data.esComision && !this.sesionesActivas.find(s => s.clave === data.clave)) {
        this.sesionesActivas = [...this.sesionesActivas, data];
      }
    });

    this.socketService.onSesionTerminada((data: any) => {
      this.sesionesActivas = this.sesionesActivas.filter(s => s.clave !== data.clave);
      this.cerrando.delete(data.clave);
    });

    this.socketService.emitGetSesionesActivas();
  }

  ngOnDestroy(): void {
    this.socketService.offSesionesActivas();
    this.socketService.offSesionIniciada();
    this.socketService.offSesionTerminada();
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
