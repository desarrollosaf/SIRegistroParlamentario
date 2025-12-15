import { Component, inject, signal, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule, ActivatedRoute  } from '@angular/router';
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
  comision?: string;
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
  private cdr = inject(ChangeDetectorRef);

  originalData = signal<any[]>([]);
  temp = signal<any[]>([]);
  rows = signal<any[]>([]);
  page = signal<number>(0);
  pageSize = signal<number>(10);
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);
  modalRef: NgbModalRef;

  // Para SESIÓN
  integrantes: any[] = [];

  // Para COMISIÓN (múltiples comisiones)
  esComision: boolean = false;
  listaComisiones: any[] = [];

  tipoEventoAgenda: string = '';
  idAgendaActual: string = '';
  agendasId: string = '';

  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  mostrarFormulario = false;
  tipoSeleccionado: 'legislatura' | 'comision' = 'legislatura';
  slctDiputados: any[] = [];
  slctPartidos: any[] = [];
  slctComisiones: any[] = [];
  slctCargo: any[] = [];
  tipo: string | null = null;
  integranteForm!: FormGroup;

  constructor(private ngZone: NgZone, private modalService: NgbModal, private route: ActivatedRoute) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tipo = params.get('tipo'); 
      if (this.tipo === 'sesiones') {
        this.tipo = '1';
      } else {
        this.tipo = '0';
      }
      this.getEventos(this.tipo);
    });
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach(tooltipEl => {
      new bootstrap.Tooltip(tooltipEl);
    });
    
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

  abrirModal(idAgenda: any) {
    this._eventoService.getIntegrantesEvento(idAgenda).subscribe({
      next: (response: any) => {
        console.log('Catálogos:', response);
        this.slctDiputados = response.diputados;
        this.slctPartidos = response.partidos;
        this.slctComisiones = response.comisiones;
        this.slctCargo = response.cargos;

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

    // Obtener datos de los selects
    const diputado = this.slctDiputados.find(d => d.id === formValue.diputadoId);
    const partido = this.slctPartidos.find(p => p.id === formValue.partidoId);
    const comision = this.slctComisiones.find(c => c.id === formValue.comisionId);
    const cargo = this.slctCargo.find(c => c.id === formValue.cargo);

    let nuevoIntegrante: any;

    if (this.esComision) {
      nuevoIntegrante = {
        id: Date.now(),
        id_diputado: formValue.diputadoId,
        diputado: diputado?.nombre || '',
        partido_dip: formValue.partidoId,
        partido: partido?.siglas || '',
        comision_dip_id: formValue.comisionId,
        comision: comision?.nombre || '',
        cargo: cargo?.valor || formValue.cargo
      };

      const comisionIndex = this.listaComisiones.findIndex(c => c.id === formValue.comisionId);
      if (comisionIndex !== -1) {
        this.listaComisiones[comisionIndex].integrantes.push(nuevoIntegrante);
        const mitad = Math.ceil(this.listaComisiones[comisionIndex].integrantes.length / 2);
        this.listaComisiones[comisionIndex].columna1 = this.listaComisiones[comisionIndex].integrantes.slice(0, mitad);
        this.listaComisiones[comisionIndex].columna2 = this.listaComisiones[comisionIndex].integrantes.slice(mitad);
      }
    } else {
      nuevoIntegrante = {
        id: Date.now(),
        id_diputado: formValue.diputadoId,
        diputado: diputado?.nombre || '',
        partido_dip: formValue.partidoId,
        partido: partido?.siglas || ''
      };

      this.integrantes.push(nuevoIntegrante);
    }

    console.log('Integrante agregado:', nuevoIntegrante);

    const data = {

      id_diputado: formValue.diputadoId,
      id_partido: formValue.partidoId,
      id_agenda: this.agendasId,
      id_cargo_dip: formValue.cargo,
      comision_dip_id: formValue.comisionId,
    };

    console.log(data);
    this._eventoService.addDiputadoComisionSesion(data).subscribe({
      next: (response: any) => {
        this.mostrarExito('Integrante agregado exitosamente');
        this.cancelarFormulario();
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.mostrarError('Error al agregar diputado');
      }
    });


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

  eliminarIntegrante(id: number, comisionId?: string) {
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
        if (this.esComision && comisionId) {
          // Eliminar de una comisión específica
          const comisionIndex = this.listaComisiones.findIndex(c => c.id === comisionId);
          if (comisionIndex !== -1) {
            this.listaComisiones[comisionIndex].integrantes =
              this.listaComisiones[comisionIndex].integrantes.filter((i: any) => i.id !== id);

            // Recalcular columnas
            const mitad = Math.ceil(this.listaComisiones[comisionIndex].integrantes.length / 2);
            this.listaComisiones[comisionIndex].columna1 = this.listaComisiones[comisionIndex].integrantes.slice(0, mitad);
            this.listaComisiones[comisionIndex].columna2 = this.listaComisiones[comisionIndex].integrantes.slice(mitad);
          }
        } else {
          // Eliminar de sesión
          this.integrantes = this.integrantes.filter(i => i.id !== id);
        }

        // DELETE al backend
        console.log(id);
        this._eventoService.deleteDiputadoComisionSesion(id).subscribe({
          next: (response: any) => {
            this.mostrarExito('Integrante eliminado correctamente');
            this.cdr.detectChanges();
          },
          error: (e: HttpErrorResponse) => {
            const msg = e.error?.msg || 'Error desconocido';
            console.error('Error del servidor:', msg);
            this.mostrarError('Error al eliminar');
          }
        });


      }
    });
  }

  verificarIntegrantes(id: any) {
    this.agendasId = id;
    this._eventoService.getEvento(id).subscribe({
      next: (response: any) => {
        console.log('Respuesta completa:', response);
        this.idAgendaActual = id;
        this.tipoEventoAgenda = response.evento.tipoevento.nombre;

        // DETECTAR SI ES COMISIÓN O SESIÓN
        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primerElemento = response.integrantes[0];

          if (primerElemento.comision_id && primerElemento.integrantes && Array.isArray(primerElemento.integrantes)) {
            // ES COMISIÓN
            this.esComision = true;
            this.tipoSeleccionado = 'comision';

            this.listaComisiones = response.integrantes.map((comision: any) => ({
              id: comision.comision_id,
              nombre: comision.comision_nombre,
              importancia: comision.importancia,
              integrantes: comision.integrantes || [],
              columna1: [],
              columna2: []
            }));

            // Dividir en columnas cada comisión
            this.listaComisiones.forEach(comision => {
              const mitad = Math.ceil(comision.integrantes.length / 2);
              comision.columna1 = comision.integrantes.slice(0, mitad);
              comision.columna2 = comision.integrantes.slice(mitad);
            });

            console.log('ES COMISIÓN - Lista de comisiones:', this.listaComisiones);
          } else {
            // ES SESIÓN
            this.esComision = false;
            this.tipoSeleccionado = 'legislatura';
            this.integrantes = response.integrantes || [];
            console.log('ES SESIÓN - Integrantes:', this.integrantes);
          }
        } else {
          // No hay integrantes
          this.esComision = false;
          this.integrantes = [];
        }

        this.onTipoChange();

        this.abrirModal(id);
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.mostrarError('Error al cargar los integrantes');
      }
    });
  }

  contarIntegrantesSesion(): number {
    return this.integrantes.length;
  }

  contarTotalGeneral(): number {
    if (!this.listaComisiones || this.listaComisiones.length === 0) {
      return 0;
    }
    return this.listaComisiones.reduce((total, comision) => {
      return total + comision.integrantes.length;
    }, 0);
  }


  contarIntegrantesComision(integrantes: any[]): number {
    return integrantes.length;
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

  getEventos(tipo: String) {
    this._eventoService.getEventos(tipo).subscribe({
      next: (response: any) => {
        console.log(response)
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