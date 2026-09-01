import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { enviroment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private reconnectHandlers = new Set<() => void>();

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
      // Un solo listener de manager que reenvía a todos los suscriptores activos,
      // para que dos pantallas/componentes vivos a la vez (p.ej. detalle-comision
      // y pantalla-diputado) no se pisen el callback de reconexión entre sí.
      this.socket.io.on('reconnect', () => {
        this.reconnectHandlers.forEach(cb => cb());
      });
      this.socket.on('connect_error', (err) => console.warn('Socket connect_error:', err.message));
      this.socket.on('disconnect', (reason) => console.warn('Socket desconectado:', reason));
    }
    return this.socket;
  }

  /** Proyeccion: conecta y se une a la sala de la comisión para escuchar eventos */
  conectarYUnirse(idComision: string): void {
    const socket = this.ensureConnected();
    if (socket.connected) {
      socket.emit('unirse-sesion', idComision);
    } else {
      socket.on('connect', () => socket.emit('unirse-sesion', idComision));
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
      socket.on('connect', () => socket.emit('unirse-diputado'));
    }
  }

  /** Pantalla física del Pleno: conecta y se une a la sala de esa pantalla
   *  para recibir identidad-detectada/identidad-perdida. */
  conectarComoPantalla(idPantalla: string): void {
    const socket = this.ensureConnected();
    if (socket.connected) {
      socket.emit('unirse-pantalla', idPantalla);
    } else {
      socket.on('connect', () => socket.emit('unirse-pantalla', idPantalla));
    }
  }

  onIdentidadDetectada(cb: (data: { diputado_id: string; nombre: string; alias?: string | null }) => void): void {
    this.socket?.on('identidad-detectada', cb);
  }

  offIdentidadDetectada(): void {
    this.socket?.off('identidad-detectada');
  }

  onIdentidadPerdida(cb: () => void): void {
    this.socket?.on('identidad-perdida', cb);
  }

  offIdentidadPerdida(): void {
    this.socket?.off('identidad-perdida');
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

  // Un voto/asistencia individual cambió — para actualizar el tablero al vuelo
  // sin recargar la lista completa (reemplaza el polling cada 3s).
  onVotoRegistrado(cb: (data: { id_diputado: string; sentido_voto: number; id?: string }) => void): void {
    this.socket?.on('voto-registrado', cb);
  }

  offVotoRegistrado(): void {
    this.socket?.off('voto-registrado');
  }

  onAsistenciaRegistrada(cb: (data: { id_diputado: string; id_agenda: string; sentido?: number }) => void): void {
    this.socket?.on('asistencia-registrada', cb);
  }

  offAsistenciaRegistrada(): void {
    this.socket?.off('asistencia-registrada');
  }

  // Botones "marcar todos" (admin) — afecta a todos los diputados a la vez,
  // así que el tablero recarga completo en vez de actualizar uno por uno.
  onVotosActualizadosMasivo(cb: (data: { sentido: number }) => void): void {
    this.socket?.on('votos-actualizados-masivo', cb);
  }

  offVotosActualizadosMasivo(): void {
    this.socket?.off('votos-actualizados-masivo');
  }

  onAsistenciasActualizadasMasivo(cb: (data: { sentido: number }) => void): void {
    this.socket?.on('asistencias-actualizadas-masivo', cb);
  }

  offAsistenciasActualizadasMasivo(): void {
    this.socket?.off('asistencias-actualizadas-masivo');
  }

  onProyeccionIniciada(cb: (params: Record<string, string>) => void): void {
    this.socket?.on('proyeccion-iniciada', cb);
  }

  offProyeccionIniciada(): void {
    this.socket?.off('proyeccion-iniciada');
  }

  // ── Contenido libre (imagen/video/mesa) en el tablero ─────────────────────
  emitProyectarContenido(idComision: string, contenido: any): void {
    this.socket?.emit('proyectar-contenido', { idComision, contenido });
  }

  emitLimpiarContenido(idComision: string): void {
    this.socket?.emit('limpiar-contenido', { idComision });
  }

  /** Termina el tablero (pantalla neutra "finalizado"); persiste al recargar. */
  emitTerminarTablero(idComision: string, mensaje?: string): void {
    this.socket?.emit('terminar-tablero', { idComision, mensaje });
  }

  onContenidoProyectado(cb: (contenido: any) => void): void {
    this.socket?.on('contenido-proyectado', cb);
  }

  offContenidoProyectado(): void {
    this.socket?.off('contenido-proyectado');
  }

  onContenidoLimpiado(cb: () => void): void {
    this.socket?.on('contenido-limpiado', cb);
  }

  offContenidoLimpiado(): void {
    this.socket?.off('contenido-limpiado');
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
    idComision?: string;
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

  emitGetEstadoEventos(): void {
    this.socket?.emit('get-estado-eventos');
  }

  onEstadoEventos(cb: (data: { asistencias: any[]; votaciones: any[] }) => void): void {
    this.socket?.on('estado-eventos', cb);
  }

  offEstadoEventos(): void {
    this.socket?.off('estado-eventos');
  }

  // ── Transcripción en vivo ─────────────────────────────────────────────────

  /** Se une a la sala de la sesión para recibir las líneas transcritas. */
  unirseTranscripcion(idAgenda: string): void {
    const socket = this.ensureConnected();
    if (socket.connected) {
      socket.emit('unirse-transcripcion', idAgenda);
    } else {
      socket.on('connect', () => socket.emit('unirse-transcripcion', idAgenda));
    }
  }

  salirTranscripcion(idAgenda: string): void {
    this.socket?.emit('salir-transcripcion', idAgenda);
  }

  onTranscripcionLinea(cb: (linea: any) => void): void {
    this.socket?.on('transcripcion-linea', cb);
  }

  offTranscripcionLinea(): void {
    this.socket?.off('transcripcion-linea');
  }

  onTranscripcionEstado(cb: (data: { idAgenda: string; transcribiendo: boolean }) => void): void {
    this.socket?.on('transcripcion-estado', cb);
  }

  offTranscripcionEstado(): void {
    this.socket?.off('transcripcion-estado');
  }

  // Se dispara cuando el socket recupera la conexión (p.ej. tras un corte de
  // internet) — el momento exacto en que conviene refrescar todo, sin tener
  // que estar preguntando a cada rato mientras la conexión está bien.
  onReconnect(cb: () => void): void {
    this.ensureConnected();
    this.reconnectHandlers.add(cb);
  }

  offReconnect(cb?: () => void): void {
    if (cb) {
      this.reconnectHandlers.delete(cb);
    } else {
      this.reconnectHandlers.clear();
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
