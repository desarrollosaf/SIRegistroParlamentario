import { Component, ElementRef, inject, QueryList, ViewChildren, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-agenda',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent {
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


  demoSelect = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'opcion1' },
    { id: '0', name: 'opcion2' }
  ];

  tipoAutor = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'Legislatura' },
    { id: '2', name: 'Comision' },
    { id: '3', name: 'Grupo Parlamentario' },
    { id: '4', name: 'Municipio' },
    { id: '5', name: 'Diputado (a)' },
    { id: '6', name: 'Diputación permanente' },
    { id: '7', name: 'Otro' },
    { id: '8', name: 'Comité' },
  ];

  legislatura = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'Legislatura1' },
    { id: '2', name: 'Legislatura2' },
    { id: '3', name: 'Legislatura3' },
    { id: '4', name: 'Legislatura4' },
  ];

  comision = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'comision1' },
    { id: '2', name: 'comision2' },
    { id: '3', name: 'comision3' },
    { id: '4', name: 'comision4' },
  ];

  grupoP = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'grupoP1' },
    { id: '2', name: 'grupoP2' },
    { id: '3', name: 'grupoP3' },
    { id: '4', name: 'grupoP4' },
  ];

  municipio = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'municipio1' },
    { id: '2', name: 'municipio2' },
    { id: '3', name: 'municipio3' },
    { id: '4', name: 'municipio4' },
  ];

  diputado = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'diputado1' },
    { id: '2', name: 'diputado2' },
    { id: '3', name: 'diputado3' },
    { id: '4', name: 'diputado4' },
  ];

  diputadoPer = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'diputadoPer1' },
    { id: '2', name: 'diputadoPer2' },
    { id: '3', name: 'diputadoPer3' },
    { id: '4', name: 'diputadoPer4' },
  ];

  otro = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'otro1' },
    { id: '2', name: 'otro2' },
    { id: '3', name: 'otro3' },
    { id: '4', name: 'otro4' },
  ];

  comite = [
    { id: '', name: '--Selecciona--' },
    { id: '1', name: 'comite1' },
    { id: '2', name: 'comite2' },
    { id: '3', name: 'comite3' },
    { id: '4', name: 'comite4' },
  ];

  tiposMultiples = ['2', '3', '4', '5', '6', '7', '8'];

  autoresPorTipo: { [key: string]: { id: string, name: string }[] } = {
    '1': this.legislatura,
    '2': this.comision,
    '3': this.grupoP,
    '4': this.municipio,
    '5': this.diputado,
    '6': this.diputadoPer,
    '7': this.otro,
    '8': this.comite
  };
  get autoresFiltrados() {
    return this.autoresPorTipo[this.tipoAutorSeleccionado] || [];
  }

  getAutoresNombres(autores: { id: string; name: string }[]): string {
    return autores.map(a => a.name).join(', ');
  }
  constructor(private fb: FormBuilder, private router: Router, private modalService: NgbModal) {
    this.formAgenda = this.fb.group({
      a_fecha: ['', Validators.required],
      a_sede: ['', Validators.required],
      a_tipo_evento: ['', Validators.required],
      a_descripcion: ['', Validators.required],
      a_transmite: [false, Validators.required],
      a_liga: [''],
      a_hora_inicio: [''],
      a_hora_fin: [''],
    });
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
    console.log('hola?');
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
