import { Component, inject, signal, ViewChild, TemplateRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../service/catalogos.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
  formNombre!: FormGroup;
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);
  modalRef: NgbModalRef;
  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;
  private _catalogoService = inject(CatalogosService);

  constructor(private ngZone: NgZone, private route: ActivatedRoute, private modalService: NgbModal, private fb: FormBuilder,) {
    this.formNombre = this.fb.group({
      nombre: ['', Validators.required],
    });
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

  abrirModal() {
    this.modalRef = this.modalService.open(this.xlModal, { size: 'lg' });
    this.modalRef.result.then((result) => {
      this.formNombre.reset({
        nombre: '',

      });
    }).catch((res) => {
      this.formNombre.reset({
        nombre: '',

      });
    });
  }


  guardarNombre() {
    const data = {
      ...this.formNombre.value,
    };
    console.log(data);
      // this._catalogoService.saveAgenda(data).subscribe({
      //   next: (response: any) => {
      //     console.log(response);
      //     this.cerrarModal();
      //   },
      //   error: (e: HttpErrorResponse) => {
      //     const msg = e.error?.msg || 'Error desconocido';
      //     console.error('Error del servidor:', msg);
      //   }
      // });
  }
 cerrarModal() {
    this.modalRef.close();
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
