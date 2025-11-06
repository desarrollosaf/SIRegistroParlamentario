
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
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
  sentido_voto: number; // 0: sin selección, 1: presente, 2: remota, 3: ausente
}

@Component({
  selector: 'app-detalle-comision',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, NgbAccordionModule],
  templateUrl: './detalle-comision.component.html',
  styleUrl: './detalle-comision.component.scss'
})
export class DetalleComisionComponent implements OnInit {
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
  idComision: string; // Obtén este ID de tu ruta o como lo necesites
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
  listaPuntos: any[] = [];
  mostrarFormularioPunto = false;
  formPunto!: FormGroup;

  documentos: { [key: string]: File | null } = {
    docPunto: null,
  };
  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
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
        this.slctProponentes = response.proponentes;
        this.slcTribunaDip = response.diputados;
        this.slcPresenta = response.comisiones;
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
        // Convertir cada punto en un formulario editable
        this.listaPuntos = this.listaPuntos.map(punto => {
        const puntoMapeado = {
          ...punto,
          tiposDisponibles: [], // ✅ Inicializar array vacío
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
        
        // ✅ Cargar tipos para este punto si tiene proponente
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

// ✅ Método para cuando cambian el proponente en un punto del accordion
getTipoPParaPunto(event: any, punto: any): void {
  if (event && event.id) {
    punto.form.get('tipo')?.setValue(null); // Resetear el tipo seleccionado
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

  }

  // Para eliminar un punto
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

  eliminarDocumento(punto: any, index: number) {
    punto.nuevoDocumento = null;
    const fileInput = document.getElementById(`fileInput${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  intervencion(punto: any) {
    // Tu lógica para intervención
    console.log('Intervención para punto:', punto);
  }

  notificar(punto: any) {
    // Tu lógica para notificar por WhatsApp
    console.log('Notificar punto:', punto);
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
  //PARA BORRAR  LOS ARCHIVOS QUE SE GUARDARON TEMPORALMENTE
  eliminarArchivo(campo: string, inputRef: HTMLInputElement): void {
    delete this.documentos[campo];
    this.documentos[campo] = null;
    inputRef.value = '';
  }





  toggleFormularioPunto() {
    this.mostrarFormularioPunto = !this.mostrarFormularioPunto;
  }










  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */
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




  private cargarDatosConfiguracion(): void {
    // Consulta para sección 3
  }

  private cargarDatosResumen(): void {
    // Consulta para sección 4
  }



}