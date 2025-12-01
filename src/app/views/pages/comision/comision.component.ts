import { Component, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../../service/evento.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { NgZone } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
declare var bootstrap: any;

interface Integrante {
  id: number;
  id_diputado: string;
  diputado: string;
  partido_dip: string;
  partido: string;
  comision_dip_id?: string;
  cargo?: string;
}

@Component({
  selector: 'app-comision',
  imports: [NgxDatatableModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './comision.component.html',
  styleUrl: './comision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComisionComponent {
  private _eventoService = inject(EventoService);
  private fb = inject(FormBuilder);
  
  originalData = signal<any[]>([]);
  temp = signal<any[]>([]);
  rows = signal<any[]>([]);
  page = signal<number>(0);
  pageSize = signal<number>(10);
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);
  modalRef: NgbModalRef;
  integrantes: any[] = [];
  tipoEventoAgenda: string = '';
  
  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;
  
  mostrarFormulario = false;
  tipoSeleccionado: 'legislatura' | 'comision' = 'legislatura';
  slctDiputados: any[] = [];
  slctPartidos: any[] = [];
  slctComisiones: any[] = [];
  
  // Reactive Form
  integranteForm!: FormGroup;

  constructor(private ngZone: NgZone, private modalService: NgbModal) {
    this.initForm();
  }

  ngOnInit(): void {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach(tooltipEl => {
      new bootstrap.Tooltip(tooltipEl);
    });
    this.getEventos();
  }

  initForm() {
    this.integranteForm = this.fb.group({
      diputadoId: ['', Validators.required],
      partidoId: ['', Validators.required],
      comisionId: [''],
      cargo: ['']
    });
  }


  onTipoChange() {
    console.log('entro aqui?=');
    const comisionControl = this.integranteForm.get('comisionId');
    const cargoControl = this.integranteForm.get('cargo');

    if (this.tipoSeleccionado === 'comision') {
      comisionControl?.setValidators([Validators.required]);
      cargoControl?.setValidators([Validators.required]);
      
      comisionControl?.setValue('');
      cargoControl?.setValue('');
    } else {
      comisionControl?.clearValidators();
      cargoControl?.clearValidators();
      comisionControl?.setValue('');
      cargoControl?.setValue('');
    }
    comisionControl?.updateValueAndValidity();
    cargoControl?.updateValueAndValidity();
  }

  get tipoEstaBloqueo(): boolean {
    return this.tipoEventoAgenda !== '';
  }


  get legislaturaDisponible(): boolean {
    if (this.tipoEventoAgenda === '') return true;
    return this.tipoEventoAgenda === 'Sesión';
  }

  get comisionDisponible(): boolean {
    if (this.tipoEventoAgenda === '') return true;
    return this.tipoEventoAgenda === 'Comisión';
  }

  abrirModal() {
    this._eventoService.getCatalogos().subscribe({
      next: (response: any) => {
        console.log(response);
        this.slctDiputados = response.diputados;
        this.slctPartidos = response.partidos;
        this.slctComisiones = response.comisiones;

        this.modalRef = this.modalService.open(this.xlModal, { 
          size: 'xl',
          backdrop: 'static',
          scrollable: true
        });

        this.modalRef.result.then(
          (result) => {
            console.log('Modal cerrado:', result);
            this.resetearFormulario();
          },
          (reason) => {
            console.log('Modal descartado:', reason);
            this.resetearFormulario();
          }
        );
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.mostrarError('Error al cargar los catálogos');
      }
    });
  }

  agregarIntegrante() {
    this.integranteForm.markAllAsTouched();

    if (this.integranteForm.invalid) {
      this.mostrarAdvertencia('Por favor complete todos los campos obligatorios');
      return;
    }

    const formValue = this.integranteForm.value;
    
    // Obtener nombres para la vista
    const diputado = this.slctDiputados.find(d => d.id === formValue.diputadoId);
    const partido = this.slctPartidos.find(p => p.id === formValue.partidoId);
    const comision = this.slctComisiones.find(c => c.id === formValue.comisionId);
    let nuevoIntegrante: any;

    if (this.tipoSeleccionado === 'legislatura') {
      nuevoIntegrante = {
        id: Math.max(...this.integrantes.map(i => i.id || 0), 0) + 1,
        id_diputado: formValue.diputadoId,
        diputado: diputado?.nombre || '',
        partido_dip: formValue.partidoId,
        partido: partido?.siglas || ''
      };
    } else {
      nuevoIntegrante = {
        id: Math.max(...this.integrantes.map(i => i.id || 0), 0) + 1,
        id_diputado: formValue.diputadoId,
        diputado: diputado?.nombre || '',
        partido_dip: formValue.partidoId,
        partido: partido?.siglas || '',
        comision_dip_id: formValue.comisionId,
        comision: comision?.nombre || '',
        cargo: formValue.cargo
      };
    }

    console.log('Guardando integrante:', {
      tipo: this.tipoSeleccionado,
      data: formValue,
      integrante: nuevoIntegrante
    });

    this.integrantes.push(nuevoIntegrante);
    
    console.log('Integrantes actualizados:', this.integrantes);

    this.mostrarExito('Integrante agregado exitosamente');
    this.cancelarFormulario();
  }


  cancelarFormulario() {
    this.mostrarFormulario = false;
  
    this.integranteForm.reset({
      diputadoId: '',
      partidoId: '',
      comisionId: '',
      cargo: ''
    });
    
    if (this.tipoEventoAgenda === 'Comisión') {
      this.tipoSeleccionado = 'comision';
    } else if (this.tipoEventoAgenda === 'Sesión') {
      this.tipoSeleccionado = 'legislatura';
    } else {
      this.tipoSeleccionado = 'legislatura';
    }
    
    this.onTipoChange();
    this.integranteForm.markAsPristine();
    this.integranteForm.markAsUntouched();
  
    Object.keys(this.integranteForm.controls).forEach(key => {
      this.integranteForm.get(key)?.setErrors(null);
    });
  }

  resetearFormulario() {
    this.mostrarFormulario = false;
    this.integranteForm.reset({
      diputadoId: '',
      partidoId: '',
      comisionId: '',
      cargo: ''
    });
    
    if (this.tipoEventoAgenda === 'Comisión') {
      this.tipoSeleccionado = 'comision';
    } else if (this.tipoEventoAgenda === 'Sesión') {
      this.tipoSeleccionado = 'legislatura';
    } else {
      this.tipoSeleccionado = 'legislatura';
    }
    
    this.onTipoChange();
    this.integranteForm.markAsPristine();
    this.integranteForm.markAsUntouched();
    
    Object.keys(this.integranteForm.controls).forEach(key => {
      this.integranteForm.get(key)?.setErrors(null);
    });
  }

  eliminarIntegrante(id: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción eliminará al integrante",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.integrantes = this.integrantes.filter(i => i.id !== id);
        this.mostrarExito('Integrante eliminado correctamente');
      }
    });
  }

  verificarIntegrantes(id: any) {
    this._eventoService.getEvento(id).subscribe({
      next: (response: any) => {
        console.log('Respuesta completa:', response);
  
        if (response.integrantes && response.integrantes.length > 0) {
          this.integrantes = response.integrantes || [];
          this.tipoEventoAgenda = response.evento.tipoevento.nombre;
          if (this.tipoEventoAgenda === 'Comisión') {
            this.tipoSeleccionado = 'comision';
          } else if (this.tipoEventoAgenda === 'Sesión') {
            this.tipoSeleccionado = 'legislatura';
          }
          
          this.onTipoChange();
          
          console.log('Tipo evento:', this.tipoEventoAgenda);
          console.log('Tipo seleccionado:', this.tipoSeleccionado);
          
          this.abrirModal();
        } else {
          this.mostrarAdvertencia('No se encontraron integrantes.');
        }
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.mostrarError('Error al cargar los integrantes');
      }
    });
  }


  get diputadoInvalid() {
    const control = this.integranteForm.get('diputadoId');
    return control?.invalid && control?.touched;
  }

  get partidoInvalid() {
    const control = this.integranteForm.get('partidoId');
    return control?.invalid && control?.touched;
  }

  get comisionInvalid() {
    const control = this.integranteForm.get('comisionId');
    return control?.invalid && control?.touched && this.tipoSeleccionado === 'comision';
  }

  get cargoInvalid() {
    const control = this.integranteForm.get('cargo');
    return control?.invalid && control?.touched && this.tipoSeleccionado === 'comision';
  }

 
  private mostrarExito(mensaje: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "success",
      title: mensaje
    });
  }

  private mostrarAdvertencia(mensaje: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "warning",
      title: mensaje
    });
  }

  private mostrarError(mensaje: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "error",
      title: mensaje
    });
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

  verDetalle(row: any) {
    console.log('Ver detalle:', row);
  }
}