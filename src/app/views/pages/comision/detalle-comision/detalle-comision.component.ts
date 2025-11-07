
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { enviroment } from '../../../../../enviroments/enviroment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
interface Integrante {
  id: number;
  id_diputado: string;
  diputado: string;
  partido: string;
  sentido_voto: number;
}

interface Intervencion {
  id?: number;
  id_tipo_intervencion: string;
  id_diputado: any[];
  comentario?: string;
  destacada: boolean;
  id_punto?: number;
}

@Component({
  selector: 'app-detalle-comision',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, NgbAccordionModule],
  templateUrl: './detalle-comision.component.html',
  styleUrl: './detalle-comision.component.scss'
})
export class DetalleComisionComponent implements OnInit {
  @ViewChild('xlModal') xlModal!: TemplateRef<any>;
  step = 1;
  stepNames = [
    { numero: 1, nombre: 'Asistencia' },
    { numero: 2, nombre: 'Orden del día' },
    { numero: 3, nombre: 'Votaciones' },
    { numero: 4, nombre: 'Resumen' }
  ];

  integrantes: Integrante[] = [];
  columna1: Integrante[] = [];
  columna2: Integrante[] = [];
  idComision: string;
  enviro = enviroment.endpoint;
  datosAsistencia: any = {};
  datosDetalle: any = {};
  datosConfiguracion: any = {};
  datosResumen: any = {};
  private _eventoService = inject(EventoService);
  idComisionRuta: string;
  slctProponentes: any;
  slcTribunaDip: any;
  slcPresenta: any;
  slcTipo: any;
  slcTipIntervencion:any;

  listaPuntos: any[] = [];
  mostrarFormularioPunto = false;
  formPunto!: FormGroup;

  modalRef!: NgbModalRef;
  formIntervencion!: FormGroup;
  mostrarFormIntervencion = false;
  tipoIntervencionActual: number = 1;
  puntoSeleccionado: any = null;
  listaIntervenciones: Intervencion[] = [];
  // tiposIntervencion:any;
  documentos: { [key: string]: File | null } = {
    docPunto: null,
  };
  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) {

    this.idComisionRuta = String(aRouter.snapshot.paramMap.get('id'));

    this.formPunto = this.fb.group({
      numpunto: [''],
      proponente: [''],
      presenta: [''],
      tipo: [''],
      tribuna: [''],
      punto: [''],
      observaciones: ['']
    });

     this.formIntervencion = this.fb.group({
      id_diputado: [[]],
      id_tipo_intervencion: [null],
      comentario: [{ value: '', disabled: true }], // ← DESHABILITADO
      destacada: [false]
    });

  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }



  nextStep() {
    if (this.step < 4) {
      this.step++;
      this.cargarDatosSeccion(this.step);
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  goToStep(stepNumber: number) {
    this.step = stepNumber;
    this.cargarDatosSeccion(stepNumber);
  }

  private cargarDatosIniciales(): void {
    this.cargarDatosSeccion(1);
  }

  private cargarDatosSeccion(seccion: number): void {
    switch (seccion) {
      case 1:
        this.cargardatosAsistencia();
        break;
      case 2:
        this.cargarOrdenDia();
        break;
      case 3:
        this.cargarDatosConfiguracion();
        break;
      case 4:
        this.cargarDatosResumen();
        break;
    }
  }


  private cargardatosAsistencia(): void {
    this._eventoService.getEvento(this.idComisionRuta).subscribe({
      next: (response: any) => {
        this.integrantes = response.integrantes || [];
        this.dividirEnColumnas();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }


  private dividirEnColumnas(): void {
    const mitad = Math.ceil(this.integrantes.length / 2);
    this.columna1 = this.integrantes.slice(0, mitad);
    this.columna2 = this.integrantes.slice(mitad);
  }

  contarAsistencias(tipo: number): number {
    return this.integrantes.filter(i => i.sentido_voto === tipo).length;
  }

  marcarAsistencia(integrante: Integrante, sentido: number): void {
    integrante.sentido_voto = sentido;
    this.guardarSentidoVoto(integrante.id_diputado, sentido, this.idComisionRuta);
  }

  guardarSentidoVoto(idIntegrante: string, sentido: number, idAgenda: string): void {
    const datos = {
      iddiputado: idIntegrante,
      sentido: sentido,
      idagenda: idAgenda
    };
    this._eventoService.actualizaAsistencia(datos).subscribe({
      next: (response: any) => {
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }

  getClaseAsistencia(sentido_voto: number): string {
    switch (sentido_voto) {
      case 1:
        return 'asistencia-presente';
      case 2:
        return 'asistencia-remota';
      case 0:
        return 'asistencia-ausente';
      default:
        return '';
    }
  }

  private cargarOrdenDia(): void {
    this.mostrarFormularioPunto = false;
    this.formPunto.reset();
    this._eventoService.getCatalogos().subscribe({
      next: (response: any) => {
        console.log(response);
        this.slctProponentes = response.proponentes;
        this.slcTribunaDip = response.diputados;
        this.slcPresenta = response.comisiones;
        this.slcTipIntervencion = response.tipointer;
        this.cargarPuntosRegistrados();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }


  cargarPuntosRegistrados(): void {
    this._eventoService.getPuntos(this.idComisionRuta).subscribe({
      next: (response: any) => {
        console.log(response);
        this.listaPuntos = response.data || [];
        this.listaPuntos = this.listaPuntos.map(punto => {
          const puntoMapeado = {
            ...punto,
            tiposDisponibles: [],
            form: this.fb.group({
              id: [punto.id],
              numpunto: [punto.nopunto],
              proponente: [punto.id_proponente ? Number(punto.id_proponente) : null],
              presenta: [punto.id_presenta ? Number(punto.id_presenta) : null],
              tipo: [punto.id_tipo ? Number(punto.id_tipo) : null],
              tribuna: [punto.tribuna],
              punto: [punto.punto],
              observaciones: [punto.observaciones]
            })
          };


          if (punto.id_proponente) {
            this.cargarTiposParaPunto(puntoMapeado, punto.id_proponente);
          }

          return puntoMapeado;
        });

      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }

  cargarTiposParaPunto(punto: any, idProponente: number): void {
    this._eventoService.getTipo(idProponente).subscribe({
      next: (response: any) => {
        punto.tiposDisponibles = response.tipos || [];
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar tipos para punto:', e);
        punto.tiposDisponibles = [];
      }
    });
  }


  getTipoPParaPunto(event: any, punto: any): void {
    if (event && event.id) {
      punto.form.get('tipo')?.setValue(null);
      this.cargarTiposParaPunto(punto, event.id);
    }
  }

  triggerFileInput(index: number): void {
    const fileInput = document.getElementById(`fileInput${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }



  guardarCambiosPunto(punto: any) {

    const formData = new FormData();
    Object.entries(punto.form.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (punto.nuevoDocumento) {
      formData.append('documento', punto.nuevoDocumento);
    }

    this._eventoService.updatePunto(formData, punto.id).subscribe({
      next: (response: any) => {
        console.log('Punto actualizado:', response);
        this.cargarPuntosRegistrados();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al actualizar:', e);
      }
    });

  }


  eliminarPunto(punto: any, index: number) {
    if (confirm('¿Estás seguro de eliminar este punto?')) {

    }
  }


  verDocumento(punto: any) {
    if (punto.path_doc) {
      const url = punto.path_doc.startsWith('http')
        ? punto.path_doc
        : `${this.enviro}${punto.path_doc}`;
      window.open(url, '_blank');
    } else {
      alert('No hay documento disponible');
    }
  }

  onFileSelectPunto(event: Event, punto: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      punto.nuevoDocumento = input.files[0];
    }
  }

   // ==================== MÉTODOS DEL MODAL DE INTERVENCIONES ====================
  
  abrirModalIntervencionGeneral() {
    this.tipoIntervencionActual = 1;
    this.puntoSeleccionado = null;
    this.abrirModalIntervencion();
  }

  intervencion(punto: any) {
    this.tipoIntervencionActual = 2;
    this.puntoSeleccionado = punto;
    this.abrirModalIntervencion();
  }

  abrirModalIntervencion() {
    this.formIntervencion.reset({
      id_diputado: [],
      id_tipo_intervencion: [],
      comentario: { value: '', disabled: true },
      destacada: false
    });
    this.mostrarFormIntervencion = false;
    this.cargarIntervenciones();
    this.modalRef = this.modalService.open(this.xlModal, { 
      size: 'xl',
      centered: true,
      backdrop: 'static'
    });
  }

  toggleFormIntervencion() {
    this.mostrarFormIntervencion = !this.mostrarFormIntervencion;
    if (!this.mostrarFormIntervencion) {
      this.formIntervencion.reset({
        id_diputado: [],
        id_tipo_intervencion: [],
        comentario: { value: '', disabled: true },
        destacada: false
      });
    }
  }
  onTipoIntervencionChange(event: { id?: number; valor?: string } | null) {
    const tipoValor = String(event?.valor ?? '').trim().toLowerCase();
    const comentarioControl = this.formIntervencion.get('comentario');
    console.log('Tipo seleccionado:', event?.valor);
    if (tipoValor === 'comentario') {
      comentarioControl?.enable();
    } else {
      comentarioControl?.disable();
      comentarioControl?.setValue('');
    }
  }

  cargarIntervenciones() {
    // Aquí harás el subscribe a tu servicio
    // Por ahora simulo datos de ejemplo
    /* 
    this._eventoService.getIntervenciones(params).subscribe({
      next: (response: any) => {
        this.listaIntervenciones = response.data || [];
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar intervenciones:', e);
      }
    });
    */
    
    // Datos de ejemplo (eliminar cuando implementes el servicio real)
    this.listaIntervenciones = [];
  }

  guardarIntervencion() {
    if (this.formIntervencion.invalid) {
      this.formIntervencion.markAllAsTouched();
      return;
    }

    const datos = {
      ...this.formIntervencion.value,
      tipo: this.tipoIntervencionActual,
      id_punto: this.puntoSeleccionado?.id || null,
      id_agenda: this.idComisionRuta
    };

    console.log('Datos a enviar:', datos);

    /*
    this._eventoService.guardarIntervencion(datos).subscribe({
      next: (response: any) => {
        console.log('Intervención guardada:', response);
        this.cargarIntervenciones();
        this.toggleFormIntervencion();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al guardar intervención:', e);
      }
    });
    */

    // Simulación (eliminar cuando implementes el servicio real)
    // const nuevaIntervencion: Intervencion = {
    //   id: Date.now(),
    //   // id_tipo_intervencion: this.tiposIntervencion.find(t => t.id === datos.tipo_intervencion)?.nombre || '',
    //   id_tipo_intervencion: '',
    //   id_diputado: datos.diputados,
    //   comentario: datos.comentario,
    //   destacada: datos.destacada
    // };
    // this.listaIntervenciones.push(nuevaIntervencion);
    this.toggleFormIntervencion();
  }

  eliminarIntervencion(intervencion: Intervencion, index: number) {
    if (confirm('¿Estás seguro de eliminar esta intervención?')) {
      /*
      this._eventoService.eliminarIntervencion(intervencion.id).subscribe({
        next: (response: any) => {
          console.log('Intervención eliminada:', response);
          this.cargarIntervenciones();
        },
        error: (e: HttpErrorResponse) => {
          console.error('Error al eliminar:', e);
        }
      });
      */
      
      // Simulación (eliminar cuando implementes el servicio real)
      this.listaIntervenciones.splice(index, 1);
    }
  }

  getNombreDiputados(diputados: any[]): string {
    if (!diputados || diputados.length === 0) return 'Sin diputados';
    return diputados.map(d => d.nombre || d).join(', ');
  }

  cerrarModal() {
    this.modalRef.close();
  }



  // ==================== FIN MÉTODOS DEL MODAL ====================
  notificar(punto: any) {

  }


  getTipoP(id: any): void {
    this._eventoService.getTipo(id.id).subscribe({
      next: (response: any) => {
        this.formPunto.get('tipo')?.setValue(null);
        this.slcTipo = [];
        this.slcTipo = response.tipos;
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }
  onFileSelect(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentos[campo] = input.files[0];
    }
  }

  eliminarArchivo(campo: string, inputRef: HTMLInputElement): void {
    delete this.documentos[campo];
    this.documentos[campo] = null;
    inputRef.value = '';
  }

  toggleFormularioPunto() {
    this.mostrarFormularioPunto = !this.mostrarFormularioPunto;
  }


  guardarPunto() {
    if (this.formPunto.invalid) {
      this.formPunto.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.entries(this.formPunto.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (this.documentos['docPunto']) {
      formData.append('documento', this.documentos['docPunto'], this.documentos['docPunto'].name);
    }
    formData.forEach((valor, clave) => {
      console.log(clave, valor);
    });
    this._eventoService.saveRegistro(formData, this.idComisionRuta).subscribe({
      next: (response: any) => {
        this.documentos['docPunto'] = null;
        this.formPunto.reset();
        this.mostrarFormularioPunto = false;
        this.cargarPuntosRegistrados();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });

  }

  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */

  private cargarDatosConfiguracion(): void {

  }

  private cargarDatosResumen(): void {

  }



}