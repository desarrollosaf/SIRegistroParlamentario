import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgZone } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ColumnMode, NgxDatatableModule } from '@siemens/ngx-datatable';
import { EventoService } from '../../../service/evento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orden-dia',
  imports: [CommonModule, RouterModule, NgxDatatableModule],
  templateUrl: './orden-dia.component.html',
  styleUrl: './orden-dia.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdenDiaComponent {
  private _eventoService = inject(EventoService);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);

  originalData = signal<any[]>([]);
  temp = signal<any[]>([]);
  rows = signal<any[]>([]);
  page = signal<number>(0);
  pageSize = signal<number>(10);
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);

  tipo: string = '1';
  titulo = signal<string>('Orden del día de sesiones');
  generandoExcel = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tipoParam = params.get('tipo');
      if (tipoParam === 'comisiones') {
        this.tipo = '0';
        this.titulo.set('Orden del día de comisiones');
      } else {
        this.tipo = '1';
        this.titulo.set('Orden del día de sesiones');
      }
      this.cargarEventos();
    });
  }

  cargarEventos(): void {
    this.loading.set(true);
    this._eventoService.getEventos(this.tipo).subscribe({
      next: (response: any) => {
        const citas: any[] = response.citas || [];

        if (citas.length === 0) {
          this.originalData.set([]);
          this.temp.set([]);
          this.filteredCount.set(0);
          this.loading.set(false);
          this.setPage({ offset: 0 });
          return;
        }

        const peticiones = citas.map((c: any) =>
          this._eventoService.getPuntos(c.id).pipe(catchError(() => of({ data: [] })))
        );

        forkJoin(peticiones).subscribe((resultados: any[]) => {
          const filas = citas.map((cita: any, i: number) => {
            const puntos: any[] = resultados[i]?.data || [];
            const ordenDelDia = puntos.length > 0
              ? puntos.map((p: any) => p.punto).filter(Boolean)
              : [];
            return {
              id: cita.id,
              fecha: cita.fecha,
              ordenDelDia
            };
          });

          this.originalData.set(filas);
          this.temp.set(filas);
          this.filteredCount.set(filas.length);
          this.loading.set(false);
          this.setPage({ offset: 0 });
        });
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.loading.set(false);
      }
    });
  }

  setPage(pageInfo: any) {
    this.page.set(pageInfo.offset);
    const start = this.page() * this.pageSize();
    const end = start + this.pageSize();
    this.rows.set(this.temp().slice(start, end));
  }

  updateFilter(event: any) {
    const val = (event.target?.value || '').toLowerCase().trim();

    this.ngZone.runOutsideAngular(() => {
      const filtered = this.originalData().filter((row: any) => {
        const id = String(row.id ?? '').toLowerCase();
        const fechaRaw = row.fecha ? new Date(row.fecha) : null;
        const fecha = fechaRaw
          ? `${fechaRaw.getDate().toString().padStart(2, '0')}/${(fechaRaw.getMonth() + 1).toString().padStart(2, '0')}/${fechaRaw.getFullYear()}`
          : '';
        const orden = (row.ordenDelDia || []).join(' ').toLowerCase();

        return id.includes(val) || fecha.includes(val) || orden.includes(val);
      });

      this.ngZone.run(() => {
        this.temp.set(filtered);
        this.filteredCount.set(filtered.length);
        this.setPage({ offset: 0 });
      });
    });
  }

  descargarExcel(): void {
    this.generandoExcel.set(true);
    const nombreArchivo = this.tipo === '1' ? 'orden_dia_sesiones.xlsx' : 'orden_dia_comisiones.xlsx';
    this._eventoService.generarReporteOrdenDia(this.tipo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        window.URL.revokeObjectURL(url);
        this.generandoExcel.set(false);
      },
      error: () => {
        this.generandoExcel.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el archivo Excel.', confirmButtonColor: '#800048' });
      }
    });
  }
}
