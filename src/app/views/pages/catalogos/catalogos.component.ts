import { Component, inject, signal, ViewChild, TemplateRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule, ActivatedRoute  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../service/catalogos.service';


@Component({
  selector: 'app-catalogos',
  imports: [NgxDatatableModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './catalogos.component.html',
  styleUrl: './catalogos.component.scss'
})
export class CatalogosComponent {

  originalData = signal<any[]>([]);
  temp = signal<any[]>([]);
  rows = signal<any[]>([]);
  page = signal<number>(0);
  pageSize = signal<number>(10);
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);
  private _catalogoService = inject(CatalogosService);

  constructor(private ngZone: NgZone, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
   this._catalogoService.getCatalogos().subscribe({
      next: (response: any) => {
        console.log(response)
         this.originalData.set(response.data);
        this.temp.set(response.data);
        this.rows.set(response.data);
        this.filteredCount.set(response.data.length);
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
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
        const fecha = (row.fecha || '').toLowerCase();
        const sede = (row.sede.sede || '').toLowerCase();
        const tipo = (row.tipoevento.nombre || '').toLowerCase();

        return (
          nombre.includes(val) ||
          fecha.includes(val) ||
          sede.includes(val) ||
          tipo.includes(val)
        );
      });

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


}
