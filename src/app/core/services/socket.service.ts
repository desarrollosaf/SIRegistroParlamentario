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

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
