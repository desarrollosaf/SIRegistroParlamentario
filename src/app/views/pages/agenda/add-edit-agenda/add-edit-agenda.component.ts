import { Component, ElementRef, inject, QueryList, ViewChildren, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgendaService } from '../../../../service/agenda.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-edit-agenda',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './add-edit-agenda.component.html',
  styleUrl: './add-edit-agenda.component.scss'
})
export class AddEditAgendaComponent {
  formAgenda: FormGroup;
  modalRef: NgbModalRef;
  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;
  tipoAutorSeleccionado: string = '';
  autoresSeleccionados: string | string[] | null = null;
  mostrarDiv: boolean = false;
  itemsTabla: Array<{
    tipoAutorId: string,
    tipoAutorNombre: string,
    autores: Array<{ id: string, name: string }>
  }> = [];
  private _agendaService = inject(AgendaService);

  idAgenda: any;
  operacion: string = 'Registrar';
  tipoAutor: any[] = [];
  sedesSelect: any[] = [];
  tipoEventoSelect: any[] = [];
  legislatura: any[] = [];
  comision: any[] = [];
  grupoP: any[] = [];
  municipio: any[] = [];
  diputado: any[] = [];
  diputadoPer: any[] = [];
  otro: any[] = [];
  comite: any[] = [];
  tiposMultiples: string[] = [];
  autoresPorTipo: { [key: string]: any[] } = {};

  get autoresFiltrados() {
    return this.autoresPorTipo[this.tipoAutorSeleccionado] || [];
  }

  getAutoresNombres(autores: { id: string; name: string }[]): string {
    return autores.map(a => a.name).join(', ');
  }

  constructor(private fb: FormBuilder, private aRouter: ActivatedRoute, private router: Router, private modalService: NgbModal) {
    this.formAgenda = this.fb.group({
      fecha: ['', Validators.required],
      sede_id: ['', Validators.required],
      tipo_evento_id: ['', Validators.required],
      descripcion: ['', Validators.required],
      transmite: [false, Validators.required],
      liga: [''],
      hora_inicio: [''],
      hora_fin: [''],
    });
    this.idAgenda = aRouter.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {


    this.formAgenda.get('transmite')?.valueChanges.subscribe(value => {
      const ligaControl = this.formAgenda.get('liga');
      const horaInicioControl = this.formAgenda.get('hora_inicio');
      const horaFinControl = this.formAgenda.get('hora_fin');

      if (value === true) {
        ligaControl?.setValidators([Validators.required]);
        horaInicioControl?.setValidators([Validators.required]);
        horaFinControl?.setValidators([Validators.required]);
      } else {
        ligaControl?.clearValidators();
        horaInicioControl?.clearValidators();
        horaFinControl?.clearValidators();

        this.formAgenda.patchValue({
          liga: '',
          hora_inicio: '',
          hora_fin: ''
        }, { emitEvent: false });
      }

      ligaControl?.updateValueAndValidity();
      horaInicioControl?.updateValueAndValidity();
      horaFinControl?.updateValueAndValidity();
    });

    if (this.idAgenda != null) {
      this.operacion = 'Editar';
      this.getAgendaRegistrada();
    } else {
      this.getSelect();
    }
  }


  //++++++++++++++++++++Holi este es para hacer la editacion+++++++++++++++++++++++
  getAgendaRegistrada() {
    this._agendaService.getAgendaRegistrada(this.idAgenda).subscribe({
      next: (response: any) => {
        // console.log(response);
        const transmiteBoolean = response.transmision === true || response.transmision === 1;

        this.formAgenda.patchValue({
          fecha: this.formatFecha(response.fecha),
          sede_id: response.sede_id,
          tipo_evento_id: response.tipo_evento_id,
          descripcion: response.descripcion,
          transmite: transmiteBoolean,
          liga: transmiteBoolean ? (response.liga || '') : '',
          hora_inicio: transmiteBoolean ? this.formatFecha(response.fecha_hora_inicio) : '',
          hora_fin: transmiteBoolean ? this.formatFecha(response.fecha_hora_fin) : ''
        });

        this.getSelect();

        this.getSelect(() => {
          if (response.anfitrion_agendas && response.anfitrion_agendas.length > 0) {
            this.setAnfitriones(response.anfitrion_agendas);
          }
        });
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }


  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }



  setAnfitriones(anfitrionesData: any[]) {
    this.itemsTabla = [];

    anfitrionesData.forEach((anfitrion: any) => {

      const tipoAutorObj = this.tipoAutor.find(t => t.id === anfitrion.tipo_autor_id);

      if (!tipoAutorObj) {
        return;
      }

      const autoresFiltrados = this.autoresPorTipo[anfitrion.tipo_autor_id] || [];

      const autor = autoresFiltrados.find((a: any) => a.id === anfitrion.autor_id);

      if (autor) {
        const existe = this.itemsTabla.some(item =>
          item.tipoAutorId === anfitrion.tipo_autor_id &&
          item.autores.length === 1 &&
          item.autores[0].id === autor.id
        );

        if (!existe) {
          this.itemsTabla.push({
            tipoAutorId: anfitrion.tipo_autor_id,
            tipoAutorNombre: tipoAutorObj.name,
            autores: [autor] 
          });
          
        } else {
          console.log('Anfitrión duplicado, no se agregó');
        }
      } else {
        console.warn(`No se encontró el autor con ID: ${anfitrion.autor_id}`);
      }
    });
  }

  volver(): void {
    // this.router.navigate(['/agenda-comision']);
    if (this.formAgenda.dirty || this.itemsTabla.length > 0) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Los cambios no guardados se perderán",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/agenda-comision/sesiones']);
        }
      });
    } else {
      this.router.navigate(['/agenda-comision/sesiones']);
    }
  }

  //++++++++++++++++++++Holi este es el fin de la editacion+++++++++++++++++++++++

  abrirModal() {
    this.modalRef = this.modalService.open(this.xlModal, { size: 'lg' });
    this.modalRef.result.then((result) => {
    }).catch((res) => {
    });
  }

  esMultiple(tipoId: string): boolean {
    return this.tiposMultiples.includes(tipoId);
  }
  setTipoAutor(tipo: string) {
    this.tipoAutorSeleccionado = tipo;
    this.autoresSeleccionados = this.esMultiple(tipo) ? [] : null;
  }


  enviarDatos(): void {
    Object.keys(this.formAgenda.controls).forEach(key => {
      this.formAgenda.get(key)?.markAsTouched();
    });
    if (this.formAgenda.invalid) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#fff3cd",
        color: "#856404",
        iconColor: "#d39e00",
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });

      Toast.fire({
        icon: "warning",
        title: "Por favor completa todos los campos requeridos"
      });
      return;
    }
    if (this.itemsTabla.length === 0) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#fff3cd",
        color: "#856404",
        iconColor: "#d39e00",
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });

      Toast.fire({
        icon: "warning",
        title: "Debes agregar al menos un anfitrión"
      });
      return;
    }

    const autoresTransformados = this.itemsTabla.map(item => ({
      tipo: item.tipoAutorNombre,
      autor_id: item.autores.map(autor => ({
        autor_id: autor.id
      }))
    }));

    const data = {
      ...this.formAgenda.value,
      autores: autoresTransformados
    };

    // console.log(data);
    if (this.operacion == 'Editar') {
      this._agendaService.updateAgenda(data, this.idAgenda).subscribe({
        next: (response: any) => {
          // console.log(response);
          Swal.fire({
            position: "center",
            icon: "success",
            title: "¡Correcto!",
            text: `Se guardo correctamente.`,
            showConfirmButton: false,
            timer: 2000
          });
          this.router.navigate(['/agenda-comision/sesiones']);

        },
        error: (e: HttpErrorResponse) => {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      });
    } else {
      this._agendaService.saveAgenda(data).subscribe({
        next: (response: any) => {
          // console.log(response);
          Swal.fire({
            title: "Se guardo correctamente",
            text: "¿Desea agregar otro registro?",
            icon: "success",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirmar",
            cancelButtonText: "Salir"
          }).then((result) => {
            if (result.isConfirmed) {
              this.limpiarFormulario();
            } else {
              this.router.navigate(['/agenda-comision']);
            }
          });
        },
        error: (e: HttpErrorResponse) => {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      });
    }

  }

  limpiarFormulario(): void {
    this.formAgenda.reset({
      fecha: '',
      sede_id: '',
      tipo_evento_id: '',
      descripcion: '',
      transmite: false,
      liga: '',
      hora_inicio: '',
      hora_fin: ''
    });
    this.itemsTabla = [];
    this.tipoAutorSeleccionado = '';
    this.autoresSeleccionados = null;
  }


  getSelect(callback?: () => void) {
    this._agendaService.getCatalogos().subscribe({
      next: (response: any) => {

        this.sedesSelect = response.sedes || [];
        this.tipoEventoSelect = response.tipoevento || [];
        this.tipoAutor = response.tipoAutores || [];

        this.legislatura = response.legislatura || [];
        this.comision = response.comisiones || [];
        this.grupoP = response.partidos || [];
        this.municipio = response.municipios || [];
        this.diputado = response.diputadosArray || [];
        this.diputadoPer = response.permanente || [];
        this.otro = response.otros || [];
        this.comite = response.comites || [];

        const tipoLegislaturaId = this.tipoAutor.find(t => t.name === 'Legislatura')?.id;
        const tipoComisionId = this.tipoAutor.find(t => t.name === 'Comision')?.id;
        const tipoGrupoParId = this.tipoAutor.find(t => t.name === 'Grupo Parlamentario')?.id;
        const tipoMunicipioId = this.tipoAutor.find(t => t.name === 'Municipio')?.id;
        const tipoDiputadoId = this.tipoAutor.find(t => t.name === 'Diputado (a)')?.id;
        const tipoDiputadoPermId = this.tipoAutor.find(t => t.name === 'Diputación permanente')?.id;
        const tipoOtroId = this.tipoAutor.find(t => t.name === 'Otros')?.id;
        const tipoComiteId = this.tipoAutor.find(t => t.name === 'Comité')?.id;

        this.autoresPorTipo = {};
        if (tipoLegislaturaId) this.autoresPorTipo[tipoLegislaturaId] = this.legislatura;
        if (tipoComisionId) this.autoresPorTipo[tipoComisionId] = this.comision;
        if (tipoGrupoParId) this.autoresPorTipo[tipoGrupoParId] = this.grupoP;
        if (tipoMunicipioId) this.autoresPorTipo[tipoMunicipioId] = this.municipio;
        if (tipoDiputadoId) this.autoresPorTipo[tipoDiputadoId] = this.diputado;
        if (tipoDiputadoPermId) this.autoresPorTipo[tipoDiputadoPermId] = this.diputadoPer;
        if (tipoOtroId) this.autoresPorTipo[tipoOtroId] = this.otro;
        if (tipoComiteId) this.autoresPorTipo[tipoComiteId] = this.comite;

        this.tiposMultiples = [];
        if (tipoComisionId) this.tiposMultiples.push(tipoComisionId);
        if (tipoGrupoParId) this.tiposMultiples.push(tipoGrupoParId);
        if (tipoMunicipioId) this.tiposMultiples.push(tipoMunicipioId);
        if (tipoDiputadoId) this.tiposMultiples.push(tipoDiputadoId);
        if (tipoDiputadoPermId) this.tiposMultiples.push(tipoDiputadoPermId);
        if (tipoOtroId) this.tiposMultiples.push(tipoOtroId);
        if (tipoComiteId) this.tiposMultiples.push(tipoComiteId);

        if (callback) {
          callback();
        }
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }




  agregarFila() {
    if (!this.tipoAutorSeleccionado) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#fff3cd",
        color: "#856404",
        iconColor: "#d39e00",
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });

      Toast.fire({
        icon: "warning",
        title: "Selecciona un tipo de autor"
      });
      return;
    }

    if (!this.autoresSeleccionados || (Array.isArray(this.autoresSeleccionados) && this.autoresSeleccionados.length === 0)) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#fff3cd",
        color: "#856404",
        iconColor: "#d39e00",
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });

      Toast.fire({
        icon: "warning",
        title: "Selecciona al menos un autor"
      });
      return;
    }

    const tipoAutorObj = this.tipoAutor.find(t => t.id === this.tipoAutorSeleccionado);
    if (!tipoAutorObj) return;

    let autoresArray: Array<{ id: string, name: string }> = [];

    if (Array.isArray(this.autoresSeleccionados)) {
      autoresArray = this.autoresSeleccionados.map((id: string) => {
        return this.autoresFiltrados.find(a => a.id === id);
      }).filter(a => a !== undefined) as Array<{ id: string, name: string }>;
    } else if (typeof this.autoresSeleccionados === 'string') {
      const autor = this.autoresFiltrados.find(a => a.id === this.autoresSeleccionados);
      if (autor) autoresArray = [autor];
    }

    const existe = this.itemsTabla.some(item =>
      item.tipoAutorId === this.tipoAutorSeleccionado &&
      JSON.stringify(item.autores.map(a => a.id).sort()) === JSON.stringify(autoresArray.map(a => a.id).sort())
    );
    if (existe) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#fff3cd",
        color: "#856404",
        iconColor: "#d39e00",
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });

      Toast.fire({
        icon: "warning",
        title: "Esa combinación ya fue agregada"
      });
      return;
    }

    this.itemsTabla.push({
      tipoAutorId: this.tipoAutorSeleccionado,
      tipoAutorNombre: tipoAutorObj.name,
      autores: autoresArray
    });

    this.tipoAutorSeleccionado = '';
    this.autoresSeleccionados = null;
  }

  eliminarFila(index: number) {
    this.itemsTabla.splice(index, 1);
  }
}
