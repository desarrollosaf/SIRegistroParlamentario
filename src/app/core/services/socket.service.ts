import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { enviroment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;

  private ensureConnected(): Socket {
    if (!this.socket) {
      const url = enviroment.endpoint.replace(/\/$/, '');
      const parsed = new URL(url);
      const socketPath = parsed.pathname.replace(/\/$/, '') + '/socket.io';
      this.socket = io(parsed.origin, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        path: socketPath
      });
    }
    return this.socket;
  }

  /** Proyeccion: conecta y se une a la sala de la comisión para escuchar eventos */
  conectarYUnirse(idComision: string): void {
    const socket = this.ensureConnected();
    if (socket.connected) {
      socket.emit('unirse-sesion', idComision);
    } else {
      socket.once('connect', () => socket.emit('unirse-sesion', idComision));
    }
  }

  /** Detalle-comision: solo conecta para poder emitir eventos */
  conectar(): void {
    this.ensureConnected();
  }

  /** Panel diputado: conecta y se une a la sala general de diputados */
  conectarComoDiputado(): void {
    const socket = this.ensureConnected();
    if (socket.connected) {
      socket.emit('unirse-diputado');
    } else {
      socket.once('connect', () => socket.emit('unirse-diputado'));
    }
  }

  emitTerminarVotacion(idComision: string): void {
    this.socket?.emit('terminar-votacion', { idComision });
  }

  emitTerminarAsistencia(idComision: string): void {
    this.socket?.emit('terminar-asistencia', { idComision });
  }

  emitIniciarProyeccion(idComision: string, params: Record<string, string>): void {
    this.socket?.emit('iniciar-proyeccion', { idComision, params });
  }

  onVotacionTerminada(cb: () => void): void {
    this.socket?.on('votacion-terminada', cb);
  }

  onAsistenciaTerminada(cb: () => void): void {
    this.socket?.on('asistencia-terminada', cb);
  }

  offVotacionTerminada(): void {
    this.socket?.off('votacion-terminada');
  }

  offAsistenciaTerminada(): void {
    this.socket?.off('asistencia-terminada');
  }

  onProyeccionIniciada(cb: (params: Record<string, string>) => void): void {
    this.socket?.on('proyeccion-iniciada', cb);
  }

  offProyeccionIniciada(): void {
    this.socket?.off('proyeccion-iniciada');
  }

  // Admin abre/cierra la asistencia para que los diputados registren
  emitAbrirAsistencia(idComision: string, idAgenda: string): void {
    this.socket?.emit('abrir-asistencia', { idComision, idAgenda });
  }

  emitCerrarAsistencia(idComision: string): void {
    this.socket?.emit('cerrar-asistencia', { idComision });
  }

  // Admin abre/cierra la votación de un punto para que los diputados voten
  emitAbrirVotacion(idComision: string, idAgenda: string, punto: any, idPunto?: any, idReserva?: string | null, idIniciativa?: string | null): void {
    this.socket?.emit('abrir-votacion', { idComision, idAgenda, punto, idPunto, idReserva, idIniciativa });
  }

  emitCerrarVotacion(idComision: string): void {
    this.socket?.emit('cerrar-votacion', { idComision });
  }

  // Diputado escucha cuándo se abre/cierra asistencia
  onAsistenciaAbierta(cb: (data: { idAgenda: string; idComision: string }) => void): void {
    this.socket?.on('asistencia-abierta', cb);
  }

  offAsistenciaAbierta(): void {
    this.socket?.off('asistencia-abierta');
  }

  onAsistenciaCerrada(cb: (data: { idComision: string }) => void): void {
    this.socket?.on('asistencia-cerrada', cb);
  }

  offAsistenciaCerrada(): void {
    this.socket?.off('asistencia-cerrada');
  }

  // Diputado escucha cuándo se abre/cierra una votación
  onVotacionAbierta(cb: (data: { idAgenda: string; punto: any; idComision: string; idPunto?: any; idReserva?: string | null; idIniciativa?: string | null }) => void): void {
    this.socket?.on('votacion-abierta', cb);
  }

  offVotacionAbierta(): void {
    this.socket?.off('votacion-abierta');
  }

  onVotacionCerrada(cb: (data: { idComision: string }) => void): void {
    this.socket?.on('votacion-cerrada', cb);
  }

  offVotacionCerrada(): void {
    this.socket?.off('votacion-cerrada');
  }

  // ── Sesiones activas ──────────────────────────────────────────────────────

  emitIniciarSesion(data: {
    idAgenda: string;
    titulo: string;
    fecha: string;
    esComision: boolean;
    ordenDia: any[];
  }): void {
    this.socket?.emit('iniciar-sesion', data);
  }

  emitTerminarSesion(idAgenda: string, esComision: boolean): void {
    this.socket?.emit('terminar-sesion', { idAgenda, esComision });
  }

  emitGetSesionesActivas(): void {
    this.socket?.emit('get-sesiones-activas');
  }

  onSesionIniciada(cb: (data: any) => void): void {
    this.socket?.on('sesion-iniciada', cb);
  }

  offSesionIniciada(): void {
    this.socket?.off('sesion-iniciada');
  }

  onSesionTerminada(cb: (data: { clave: string; idAgenda: string }) => void): void {
    this.socket?.on('sesion-terminada', cb);
  }

  offSesionTerminada(): void {
    this.socket?.off('sesion-terminada');
  }

  onSesionConfirmada(cb: (data: any) => void): void {
    this.socket?.on('sesion-confirmada', cb);
  }

  offSesionConfirmada(): void {
    this.socket?.off('sesion-confirmada');
  }

  onSesionRechazada(cb: (data: { motivo: string; sesionActiva: any }) => void): void {
    this.socket?.on('sesion-rechazada', cb);
  }

  offSesionRechazada(): void {
    this.socket?.off('sesion-rechazada');
  }

  onSesionesActivas(cb: (lista: any[]) => void): void {
    this.socket?.on('sesiones-activas', cb);
  }

  offSesionesActivas(): void {
    this.socket?.off('sesiones-activas');
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
