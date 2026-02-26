import { Component, inject } from '@angular/core';
import { AgendaService } from '../../../../service/agenda.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-eventos',
  imports: [],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent {
  private _agendaService = inject(AgendaService);
  fecha: any 

  ngOnInit(): void {
    this.fecha = '2026-02-26';
    this._agendaService.getAgendasHoy(this.fecha).subscribe({
        next: (response: any) => {
          console.log(response);
          // this.originalData.set(response.citas);
          // this.temp.set(response.citas);
          // this.rows.set(response.citas);
          // this.filteredCount.set(response.citas.length);
          // this.loading.set(false);
        },
        error: (e: HttpErrorResponse) => {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      });

  }

}
