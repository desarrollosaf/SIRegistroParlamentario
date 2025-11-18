import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../../service/evento.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { NgZone } from '@angular/core';
declare var bootstrap: any;
@Component({
  selector: 'app-comision',
  imports: [NgxDatatableModule, CommonModule, RouterModule],
  templateUrl: './comision.component.html',
  styleUrl: './comision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComisionComponent {
  private _eventoService = inject(EventoService);
  originalData = signal<any[]>([]);
  temp = signal<any[]>([]);
  rows = signal<any[]>([]);
  page = signal<number>(0);
  pageSize = signal<number>(10);
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);
  
  @ViewChild('table') table: DatatableComponent;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void { 
      const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach(tooltipEl => {
      new bootstrap.Tooltip(tooltipEl);
    });
    this.getEventos();
  }

  getEventos() {
    this._eventoService.getEventos().subscribe({
      next: (response: any) => {
        this.originalData.set(response.citas);
        this.temp.set(response.citas);
        this.rows.set(response.citas);
        this.filteredCount.set(response.citas.length);
        this.loading.set(false);
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
  const val = (event.target?.value || '').toLowerCase();

  this.ngZone.runOutsideAngular(() => {
    const filtered = this.originalData().filter((row: any) => {
      const nombre = (row.descripcion || '').toLowerCase();
      const fechainicio = (row.fecha_hora_inicio || '').toLowerCase();
      const fechafin = (row.fecha_hora_fin || '').toLowerCase();
      const sede = (row.sede.sede || '').toLowerCase();
      const tipo = (row.tipoevento.nombre || '').toLowerCase();

      return (
        nombre.includes(val) ||
        fechainicio.includes(val) ||
        fechafin.includes(val) ||
        sede.includes(val) ||
        tipo.includes(val)
      );
    });

    // vuelve al contexto Angular solo al final
    this.ngZone.run(() => {
      this.temp.set(filtered);
      this.filteredCount.set(filtered.length);
      this.setPage({ offset: 0 });
    });
  });
}

  onSort(event: any): void {
    const sort = event.sorts[0];
    const { prop, dir } = sort;
    const sorted = [...this.temp()].sort((a: any, b: any) => {
      const aValue = a[prop];
      const bValue = b[prop];

      if (aValue == null || bValue == null) return 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return dir === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return dir === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    this.temp.set(sorted);
    this.setPage({ offset: this.page() });
  }

  verDetalle(row: any) {
    console.log('Ver detalle:', row);
  }
}