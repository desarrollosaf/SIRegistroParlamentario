import { Component, ElementRef, inject, QueryList, ViewChildren, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgendaService } from '../../../../service/agenda.service';
import { HttpErrorResponse } from '@angular/common/http';


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

  selectAll: any;


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

// "descripcion": "Evento para presentar propuestas de reforma",
//   "fecha": "2025-02-11 15:00:00",
//   "hora_inicio": "2025-10-21 13:00:00",
//   "hora_fin": "2025-10-21 18:00:00",
//   "sede_id": "0367d6f5-09cf-4729-bbad-7dc9e272dca8",
//   "tipo_evento_id":
  constructor(private fb: FormBuilder, private router: Router, private modalService: NgbModal) {
    this.formAgenda = this.fb.group({
      fecha: ['', Validators.required],
      sede_id: ['', Validators.required],
      tipo_evento_id : ['', Validators.required],
      descripcion: ['', Validators.required],
      transmite: [false, Validators.required],
      liga: [''],
      hora_inicio: [''],
      hora_fin: [''],
    });
  }

  ngOnInit(): void {
    this.getSelect();
  }

  abrirModal() {
    this.modalRef = this.modalService.open(this.xlModal, { size: 'lg' });
    this.modalRef.result.then((result) => {
      // console.log("Modal cerrado:", result);
    }).catch((res) => {
      // console.log("Modal cerrado por dismiss");
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
    if (this.itemsTabla.length === 0) {
      alert('Debes agregar al menos un anfitrión');
      return;
    }

    // Transformar itemsTabla al formato requerido
    const autoresTransformados = this.itemsTabla.map(item => ({
      tipo: item.tipoAutorNombre,
      autor_id: item.autores.map(autor => ({
        autor_id: autor.id
      }))
    }));

    // Construir el objeto completo para enviar
    const data = {
      ...this.formAgenda.value,
      autores: autoresTransformados
    };

    console.log('Datos a enviar:', data);
    console.log('JSON:', JSON.stringify(data, null, 2));
  }

  getSelect() {
    this._agendaService.getCatalogos().subscribe({
      next: (response: any) => {
        this.selectAll = response;
        console.log(this.selectAll);
        this.sedesSelect = response.sedes || [];
        this.tipoEventoSelect = response.tipoevento || [];
        this.tipoAutor = response.tipoAutores || [];

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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


        if (tipoComisionId) this.tiposMultiples.push(tipoComisionId);
        if (tipoGrupoParId) this.tiposMultiples.push(tipoGrupoParId);
        if (tipoMunicipioId) this.tiposMultiples.push(tipoMunicipioId);
        if (tipoDiputadoId) this.tiposMultiples.push(tipoDiputadoId);
        if (tipoDiputadoPermId) this.tiposMultiples.push(tipoDiputadoPermId);
        if (tipoOtroId) this.tiposMultiples.push(tipoOtroId);
        if (tipoComiteId) this.tiposMultiples.push(tipoComiteId);
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }




  agregarFila() {
    if (!this.tipoAutorSeleccionado) {
      alert('Selecciona un tipo de autor');
      return;
    }

    if (!this.autoresSeleccionados || (Array.isArray(this.autoresSeleccionados) && this.autoresSeleccionados.length === 0)) {
      alert('Selecciona al menos un autor');
      return;
    }

    // Obtener el nombre del tipo de autor
    const tipoAutorObj = this.tipoAutor.find(t => t.id === this.tipoAutorSeleccionado);
    if (!tipoAutorObj) return;

    // Obtener lista de autores seleccionados en formato [{id, name}]
    let autoresArray: Array<{ id: string, name: string }> = [];

    if (Array.isArray(this.autoresSeleccionados)) {
      autoresArray = this.autoresSeleccionados.map((id: string) => {
        return this.autoresFiltrados.find(a => a.id === id);
      }).filter(a => a !== undefined) as Array<{ id: string, name: string }>;
    } else if (typeof this.autoresSeleccionados === 'string') {
      const autor = this.autoresFiltrados.find(a => a.id === this.autoresSeleccionados);
      if (autor) autoresArray = [autor];
    }
    // Evitar agregar si ya existe la misma combinación (opcional)
    const existe = this.itemsTabla.some(item =>
      item.tipoAutorId === this.tipoAutorSeleccionado &&
      JSON.stringify(item.autores.map(a => a.id).sort()) === JSON.stringify(autoresArray.map(a => a.id).sort())
    );
    if (existe) {
      alert('Esa combinación ya fue agregada');
      return;
    }

    // Agregar al array
    this.itemsTabla.push({
      tipoAutorId: this.tipoAutorSeleccionado,
      tipoAutorNombre: tipoAutorObj.name,
      autores: autoresArray
    });

    // Limpiar selección
    this.tipoAutorSeleccionado = '';
    this.autoresSeleccionados = null;
  }

  eliminarFila(index: number) {
    this.itemsTabla.splice(index, 1);
  }
}
