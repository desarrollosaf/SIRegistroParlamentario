import { Component, inject } from '@angular/core';
import { AgendaService } from '../../../../service/agenda.service';
import { HttpErrorResponse } from '@angular/common/http';
// import { SocketService } from '../../../../core/services/socket.service';

@Component({
  selector: 'app-eventos',
  imports: [],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent {
  private _agendaService = inject(AgendaService);
  // private _socketService = inject(SocketService);
  fecha: any 
  eventos: any[] = [];

  ngOnInit(): void {
    this.fecha = '2026-02-19';
  

    // this._agendaService.getAgendasHoy(this.fecha).subscribe({
    //     next: (response: any) => {
    //       console.log(response);
    //       this.eventos = response?.eventos ?? response?.citas ?? response ?? [];
    //       console.log(this.eventos)
    //       // this.originalData.set(response.citas);
    //       // this.temp.set(response.citas);
    //       // this.rows.set(response.citas);
    //       // this.filteredCount.set(response.citas.length);
    //       // this.loading.set(false);
    //     },
    //     error: (e: HttpErrorResponse) => {
    //       const msg = e.error?.msg || 'Error desconocido';
    //       console.error('Error del servidor:', msg);
    //     }
    //   });


    //   this._socketService.connect();

     

    //   this._socketService.onEventoIniciado((data: any) => {
    //     console.log('📡 socket evento_iniciado recibido:', data);

    //     const agendaIdStr = String(data.agenda_id ?? data.id); 
    //     const ev = this.eventos.find(e => String(e.id) === agendaIdStr);

    //     if (ev) {
    //       ev.iniciado = true;
    //       console.log('🟢 Marcado iniciado:', ev.id);
    //     } else {
    //       console.warn('⚠️ Evento no encontrado en la lista:', agendaIdStr);
    //     }
    //   });

  }

}
