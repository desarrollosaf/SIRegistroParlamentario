// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';

// @Injectable({ providedIn: 'root' })
// export class SocketService {
//   private socket?: Socket;

//   connect() {
//     if (this.socket?.connected) return;

//     this.socket = io('http://localhost:3013', {
//       withCredentials: true,
//       transports: ['websocket'] // opcional
//     });
//   }

//   onEventoIniciado(cb: (data: { agenda_id: any }) => void) {
//     this.socket?.on('evento_iniciado', cb);
//   }

//   disconnect() {
//     this.socket?.disconnect();
//     this.socket = undefined;
//   }
// }