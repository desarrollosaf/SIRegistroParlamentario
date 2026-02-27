import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { enviroment } from '../../../../../enviroments/enviroment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
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

interface Votante {
  id: number;
  id_diputado: string;
  diputado: string;
  partido: string;
  sentido: number; // 0=pendiente, 1=a favor, 2=abstención, 3=en contra
}

@Component({
  selector: 'app-detalle-comision',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, NgbAccordionModule],
  templateUrl: './detalle-comision.component.html',
  styleUrl: './detalle-comision.component.scss'
})
export class DetalleComisionComponent implements OnInit, OnDestroy {

  private segPlanoInterval: any = null;
  private segPlanoActivo: boolean = false;
  private readonly SEGUNDO_PLANO_INTERVAL_MS = 5000;

  @ViewChild('xlModal') xlModal!: TemplateRef<any>;
  @ViewChild('xlModalT') xlModalT!: TemplateRef<any>;
  @ViewChild('xlModalI') xlModalI!: TemplateRef<any>;

  step = 1;
  stepNames = [
    { numero: 1, nombre: 'Asistencia' },
    { numero: 2, nombre: 'Orden del día' },
    { numero: 3, nombre: 'Votaciones' },
    { numero: 4, nombre: 'Resumen' }
  ];
  //VOTACION
  votantes: Votante[] = [];
  columnaVotantes1: Votante[] = [];
  columnaVotantes2: Votante[] = [];
  puntoSeleccionadoVotacion: number | null = null; // solo guardará el id
  reservaPuntoSeleccionadoVotacion: string | null = null; // solo guardará el id de la reserva
  listaReservasPunto: any[] = [];
  listaPuntosVotacion: any[] = [];

  votacionActual: { idPunto: number | null, idReserva: string | null } = {
    idPunto: null,
    idReserva: null
  };
  votacionIniciada: boolean = false;

  idpto: any;
  listaComisionesVotacion: any[] = []; // Para votaciones de comisiones
  //VOTACION
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
  slcTipIntervencion: any;
  slcComisiones: any; // <-- NUEVO CAMPO
  slcPuntosTurnados: any; // <-- NUEVO CAMPO
  slcDictamenes: any; // <-- NUEVO CAMPO
  tipo_evento: any;
  listaPuntos: any[] = [];
  mostrarFormularioPunto = false;
  formPunto!: FormGroup;

  modalRef!: NgbModalRef;
  modalRefT!: NgbModalRef;
  modalRefI!: NgbModalRef;

  formIntervencion!: FormGroup;
  mostrarFormIntervencion = false;
  tipoIntervencionActual: number = 1;
  puntoSeleccionado: any = null;
  listaIntervenciones: any;
  // tiposIntervencion:any;
  agendaPunto: '';
  isUpdatingAsistencia: boolean = false;
  isUpdatingVotacion: boolean = false;
  tituloC: '';
  idEvento: '';
  fechaC: '';
  esComision: boolean = false; //C
  listaComisiones: any[] = []; //C
  documentos: { [key: string]: File | null } = {
    docPunto: null,
  };

  mostrarformReserva = false;
  formReserva!: FormGroup;
  listaReservas: any[] = []; // Esta será temporal mientras se crea el punto
  reservasTemporales: any[] = []; // Para almacenar temas antes de guardar el punto

  puntoSeleccionadoReserva: any = null;


  mostrarformIniciativa = false;
  formIniciativa!: FormGroup;
  listaIniciativas: any[] = []; // Temporal mientras se crea el punto
  iniciativasTemporales: any[] = []; // Para almacenar antes de guardar el punto
  puntoSeleccionadoIniciativa: any = null;

  slcIniciativasPrecargadas: any[] = []; // NUEVO: para el select de iniciativas precargadas
  mostrarSelectIniciativaPrecargada = false; // NUEVO: para mostrar/ocultar el select
  iniciativaPrecargadaSeleccionada: any = null; // NUEVO: iniciativa seleccionada del select
  // slcIniciativasDisponibles: any[] = [];

  puntosTurnadosSeleccionados: any[] = [];

  consoleiniciativas: any[] = [];
  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {

    this.idComisionRuta = String(aRouter.snapshot.paramMap.get('id'));

    // MODIFICADO: Agregar los nuevos campos al formulario
    this.formPunto = this.fb.group({
      numpunto: [''],
      proponente: [''],
      presenta: [''],
      tipo: [''],
      tribuna: [''],
      punto: [''],
      observaciones: [''],
      se_turna_comision: [false], // <-- NUEVO
      id_comision: [[]], // <-- NUEVO (array vacío para multi-select)
      id_punto_turnado: [''], // <-- NUEVO (array vacío para multi-select)
      id_dictamen: [''] // <-- NUEVO (array vacío para multi-select)
    });

    // NUEVO: Suscribirse a cambios de se_turna_comision para manejar validaciones
    this.formPunto.get('se_turna_comision')?.valueChanges.subscribe((value: boolean) => {
      const comisionControl = this.formPunto.get('id_comision');
      if (value === true) {
        // Validar que el array tenga al menos 1 elemento
        comisionControl?.setValidators([Validators.required, Validators.minLength(1)]);
      } else {
        comisionControl?.clearValidators();
        comisionControl?.setValue([]); // Limpiar con array vacío
      }
      comisionControl?.updateValueAndValidity();
    });

    this.formIntervencion = this.fb.group({
      id_diputado: [[]],
      id_tipo_intervencion: [null],
      comentario: [{ value: '', disabled: true }],
      destacada: [false],
      liga: ['']
    });

    this.formReserva = this.fb.group({
      descripcion: ['', Validators.required]
    });

    this.formIniciativa = this.fb.group({
      descripcion: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    // this.formPunto.get('id_punto_turnado')?.valueChanges.subscribe(value => {
    //   // console.log('jkasdhjksdfajkhasd');
    //   if (!value) {
    //     this.formPunto.get('punto')?.setValue('');
    //     this.formPunto.get('punto')?.enable();
    //     return;
    //   }

    //   let selectedOption;

    //   if (this.esComision) {
    //     selectedOption = this.slcPuntosTurnados?.find((p: any) => p.id === value);
    //   } else {
    //     selectedOption = this.slcDictamenes?.find((d: any) => d.id === value);
    //   }

    //   const textoSeleccionado = selectedOption?.punto || '';

    //   this.formPunto.get('punto')?.setValue(textoSeleccionado);
    //   this.formPunto.get('punto')?.disable();
    // });

    this.cargarDatosIniciales();


  }

  // actualizarIniciativasDisponibles() {
  //   const idsAgregados = this.listaIniciativas.map(ini => ini.id);
  //   this.slcIniciativasDisponibles = this.slcIniciativasPrecargadas.filter(
  //     ini => !idsAgregados.includes(ini.id)
  //   );
  // }

  cargarIniciativasDisponibles() {
    if (!this.puntoSeleccionadoIniciativa) {
      console.log('❌ No hay punto seleccionado');
      return;
    }

    console.log('🔄 Filtrando iniciativas disponibles para punto:', this.puntoSeleccionadoIniciativa.id);
    console.log('📋 Iniciativas del punto:', this.listaIniciativas);

    // Obtener IDs de las iniciativas ya agregadas a este punto
    const idsAgregados = this.listaIniciativas.map(ini => ini.id);
    console.log('🚫 IDs ya agregados:', idsAgregados);

    // Filtrar las iniciativas precargadas
    const iniciativasDisponibles = this.slcIniciativasPrecargadas.filter(
      (ini: any) => !idsAgregados.includes(ini.id)
    );

    console.log('✅ Iniciativas disponibles (filtradas):', iniciativasDisponibles);

    // IMPORTANTE: Crear un nuevo array para que ng-select detecte el cambio
    this.slcIniciativasPrecargadas = [...iniciativasDisponibles];

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    console.log('Limpiando');
    this.detenerSegPlano();
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
      this.cargarDatosSeccion(this.step);
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
    this.detenerSegPlano();

    switch (seccion) {
      case 1:
        this.cargardatosAsistencia();
        this.iniciarSegPlano();
        break;
      case 2:
        this.cargarOrdenDia();
        break;
      case 3:
        this.cargarDatosVotacion();
        this.iniciarSegPlano();
        break;
      case 4:
        this.cargarDatosResumen();
        break;
    }
  }

  // ============================================================
  //ACTUALIXAR
  // ============================================================
  private iniciarSegPlano(): void {
    if (this.segPlanoActivo) {
      return;
    }

    const seccionNombre = this.step === 1 ? 'Asistencia' : 'Votaciones';
    console.log(`Iniciando ${seccionNombre}`);
    this.segPlanoActivo = true;

    this.segPlanoInterval = setInterval(() => {
      this.actualizarDatosAutomaticamente();
    }, this.SEGUNDO_PLANO_INTERVAL_MS);
  }

  private detenerSegPlano(): void {
    if (this.segPlanoInterval) {
      console.log('Deteniendo');
      clearInterval(this.segPlanoInterval);
      this.segPlanoInterval = null;
      this.segPlanoActivo = false;
    }
  }

  private actualizarDatosAutomaticamente(): void {
    if (this.step === 1) {
      this.actualizarAsistenciaAutomaticamente();
    } else if (this.step === 3 && this.puntoSeleccionadoVotacion && this.idpto) {
      this.actualizarVotacionesAutomaticamente();
    }
  }

  // ============================================================
  //ACTUALIZA ASISTENCIA
  // ============================================================


  private actualizarAsistenciaAutomaticamente(): void {
    this._eventoService.getEvento(this.idComisionRuta).subscribe({
      next: (response: any) => {
        if (this.esComision) {
          // CASO COMISIÓN: Actualizar lista de comisiones
          const nuevasComisiones = response.integrantes || [];

          if (Array.isArray(nuevasComisiones) && nuevasComisiones.length > 0) {
            const primerElemento = nuevasComisiones[0];

            if (primerElemento.comision_id && primerElemento.integrantes) {
              if (this.hayaCambiosEnComisiones(nuevasComisiones)) {
                console.log('Comisiones actualizadas desde el servidor');

                this.listaComisiones = nuevasComisiones.map((comision: any) => ({
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

                this.cdr.detectChanges();
              }
            }
          }
        } else {
          // CASO SESIÓN: Actualizar lista normal
          const nuevosIntegrantes = response.integrantes || [];
          if (this.hayaCambiosEnAsistencia(nuevosIntegrantes)) {
            console.log('Asistencia actualizada desde el servidor');
            this.integrantes = nuevosIntegrantes;
            this.dividirEnColumnas();
            this.cdr.detectChanges();
          }
        }
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al actualizar asistencia:', e);
      }
    });
  }



  private hayaCambiosEnAsistencia(nuevosIntegrantes: Integrante[]): boolean {
    if (nuevosIntegrantes.length !== this.integrantes.length) {
      return true;
    }

    for (let i = 0; i < nuevosIntegrantes.length; i++) {
      const nuevoIntegrante = nuevosIntegrantes[i];
      const integranteActual = this.integrantes.find(int => int.id_diputado === nuevoIntegrante.id_diputado);

      if (!integranteActual || integranteActual.sentido_voto !== nuevoIntegrante.sentido_voto) {
        return true;
      }
    }

    return false;
  }

  private hayaCambiosEnComisiones(nuevasComisiones: any[]): boolean {
    if (nuevasComisiones.length !== this.listaComisiones.length) {
      return true;
    }

    // Revisar
    for (let i = 0; i < nuevasComisiones.length; i++) {
      const nuevaComision = nuevasComisiones[i];
      const comisionActual = this.listaComisiones.find(c => c.id === nuevaComision.comision_id);

      if (!comisionActual) {
        return true; // Nueva
      }

      // Revisar número de integrantes
      if (nuevaComision.integrantes.length !== comisionActual.integrantes.length) {
        return true;
      }

      // Revisar cada integrante de esta comisión
      for (let j = 0; j < nuevaComision.integrantes.length; j++) {
        const nuevoIntegrante = nuevaComision.integrantes[j];
        const integranteActual = comisionActual.integrantes.find(
          (int: any) => int.id_diputado === nuevoIntegrante.id_diputado
        );

        if (!integranteActual || integranteActual.sentido_voto !== nuevoIntegrante.sentido_voto) {
          return true; // Cambió el voto de algún integrante
        }
      }
    }

    return false;
  }


  // ============================================================
  //  ACTUALIZA VOTACIONES
  // ============================================================

  private actualizarVotacionesAutomaticamente(): void {
    console.log(this.idpto);
    this._eventoService.getIntegrantesVotosPunto(this.votacionActual).subscribe({
      next: (response: any) => {
        if (this.esComision) {
          // CASO COMISIÓN: Actualizar lista de comisiones
          const nuevasComisionesVotacion = response.integrantes || [];

          if (Array.isArray(nuevasComisionesVotacion) && nuevasComisionesVotacion.length > 0) {
            const primerElemento = nuevasComisionesVotacion[0];

            if (primerElemento.comision_id && primerElemento.integrantes) {
              if (this.hayaCambiosEnComisionesVotacion(nuevasComisionesVotacion)) {
                console.log('Votaciones de comisiones actualizadas desde el servidor');

                this.listaComisionesVotacion = nuevasComisionesVotacion.map((comision: any) => ({
                  id: comision.comision_id,
                  nombre: comision.comision_nombre,
                  importancia: comision.importancia,
                  integrantes: comision.integrantes || [],
                  columna1: [],
                  columna2: []
                }));

                // Dividir en columnas cada comisión
                this.listaComisionesVotacion.forEach(comision => {
                  const mitad = Math.ceil(comision.integrantes.length / 2);
                  comision.columna1 = comision.integrantes.slice(0, mitad);
                  comision.columna2 = comision.integrantes.slice(mitad);
                });

                this.cdr.detectChanges();
              }
            }
          }
        } else {
          // CASO SESIÓN: Actualizar lista normal
          const nuevosVotantes = response.integrantes || [];
          if (this.hayaCambiosEnVotacion(nuevosVotantes)) {
            console.log('Votaciones actualizadas desde el servidor');
            this.votantes = nuevosVotantes;
            this.dividirEnColumnasVotacion();
            this.cdr.detectChanges();
          }
        }
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al actualizar votaciones:', e);
      }
    });
  }

  private hayaCambiosEnVotacion(nuevosVotantes: Votante[]): boolean {
    if (nuevosVotantes.length !== this.votantes.length) {
      return true;
    }

    for (let i = 0; i < nuevosVotantes.length; i++) {
      const nuevoVotante = nuevosVotantes[i];
      const votanteActual = this.votantes.find(v => v.id_diputado === nuevoVotante.id_diputado);

      if (!votanteActual || votanteActual.sentido !== nuevoVotante.sentido) {
        return true;
      }
    }

    return false;
  }

  private hayaCambiosEnComisionesVotacion(nuevasComisionesVotacion: any[]): boolean {
    if (nuevasComisionesVotacion.length !== this.listaComisionesVotacion.length) {
      return true;
    }

    for (let i = 0; i < nuevasComisionesVotacion.length; i++) {
      const nuevaComision = nuevasComisionesVotacion[i];
      const comisionActual = this.listaComisionesVotacion.find(c => c.id === nuevaComision.comision_id);

      if (!comisionActual) {
        return true;
      }

      if (nuevaComision.integrantes.length !== comisionActual.integrantes.length) {
        return true;
      }

      for (let j = 0; j < nuevaComision.integrantes.length; j++) {
        const nuevoIntegrante = nuevaComision.integrantes[j];
        const integranteActual = comisionActual.integrantes.find(
          (int: any) => int.id_diputado === nuevoIntegrante.id_diputado
        );

        if (!integranteActual || integranteActual.sentido !== nuevoIntegrante.sentido) {
          return true;
        }
      }
    }

    return false;
  }

  //******************************************************************************************************************** */
  //******************************************************************************************************************** */
  //******************************************************************************************************************** */



  private cargardatosAsistencia(): void {
    this._eventoService.getEvento(this.idComisionRuta).subscribe({
      next: (response: any) => {
        console.log('Respuesta completa DE PUNTOS:', response);
        this.idEvento = response.evento.id;
        this.tituloC = response.titulo;
        this.fechaC = response.evento.fecha;
        this.slcPuntosTurnados = response.puntos;
        //COMISIÓN O SESIÓN
        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primerElemento = response.integrantes[0];

          if (primerElemento.comision_id && primerElemento.integrantes && Array.isArray(primerElemento.integrantes)) {
            // ES COMISIÓN
            this.esComision = true;
            this.listaComisiones = response.integrantes.map((comision: any) => ({
              id: comision.comision_id,
              nombre: comision.comision_nombre,
              importancia: comision.importancia,
              integrantes: comision.integrantes || [],
              columna1: [],
              columna2: []
            }));


            this.listaComisiones.forEach(comision => {
              const mitad = Math.ceil(comision.integrantes.length / 2);
              comision.columna1 = comision.integrantes.slice(0, mitad);
              comision.columna2 = comision.integrantes.slice(mitad);
            });

          } else {
            // ES SESIÓN
            this.esComision = false;
            this.integrantes = response.integrantes || [];
            this.dividirEnColumnas();
          }
        } else {
          this.esComision = false;
          this.integrantes = [];
        }
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }

  contarAsistenciasComision(integrantes: any[], tipo: number): number {
    return integrantes.filter(i => i.sentido_voto === tipo).length;
  }

  // Método para marcar asistencia en comisión
  marcarAsistenciaComision(integrante: any, sentido: number, comisionId: string): void {
    integrante.sentido_voto = sentido;
    this.guardarSentidoVoto(integrante.id, sentido, this.idComisionRuta);
    this.cdr.detectChanges();
  }

  contarTotalGeneral(): number {
    if (!this.listaComisiones || this.listaComisiones.length === 0) {
      return 0;
    }
    return this.listaComisiones.reduce((total, comision) => {
      return total + comision.integrantes.length;
    }, 0);
  }

  contarAsistenciasGeneral(tipo: number): number {
    if (!this.listaComisiones || this.listaComisiones.length === 0) {
      return 0;
    }
    return this.listaComisiones.reduce((total, comision) => {
      const count = comision.integrantes.filter((i: any) => i.sentido_voto === tipo).length;
      return total + count;
    }, 0);
  }


  private dividirEnColumnas(): void {
    const mitad = Math.ceil(this.integrantes.length / 2);
    this.columna1 = this.integrantes.slice(0, mitad);
    this.columna2 = this.integrantes.slice(mitad);
  }

  contarAsistencias(tipo: number): number {
    return this.integrantes.filter(i => i.sentido_voto === tipo).length;
  }

  marcarAsistencia(integrante: any, sentido: number): void {
    integrante.sentido_voto = sentido;
    // console.log(integrante);
    this.guardarSentidoVoto(integrante.id, sentido, this.idComisionRuta);
  }


  async marcarTodosAsistencia(sentido: number): Promise<void> {
    this.isUpdatingAsistencia = true;
    this.cdr.detectChanges();

    // Pequeña pausa para que el spinner se muestre
    await new Promise(resolve => setTimeout(resolve, 100));

    const datos = {
      id: this.idEvento,
      sentido: sentido
    }

    console.log(datos);

    try {
      const response: any = await this._eventoService.ActualizarTodosAsistencia(datos).toPromise();

      // ACTUALIZACIÓN OPTIMISTA: Actualizar la UI inmediatamente sin esperar al servidor
      if (this.esComision) {
        // Actualizar todas las comisiones localmente
        this.listaComisiones.forEach(comision => {
          comision.integrantes.forEach((integrante: any) => {
            integrante.sentido_voto = sentido;
          });
          // Actualizar columnas
          const mitad = Math.ceil(comision.integrantes.length / 2);
          comision.columna1 = comision.integrantes.slice(0, mitad);
          comision.columna2 = comision.integrantes.slice(mitad);
        });
      } else {
        // Actualizar lista normal de sesión
        this.integrantes.forEach(integrante => {
          integrante.sentido_voto = sentido;
        });
        this.dividirEnColumnas();
      }

      this.cdr.detectChanges();

      // Toast de éxito
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: "success",
        title: "Asistencias actualizadas correctamente"
      });

    } catch (e: any) {
      const msg = e.error?.msg || 'Error desconocido';
      console.error('Error del servidor:', msg);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        timer: 3000
      });
    } finally {
      this.isUpdatingAsistencia = false;
      this.cdr.detectChanges();
    }
  }


  guardarSentidoVoto(idIntegrante: string, sentido: number, idAgenda: string): void {
    const datos = {
      id: idIntegrante,
      sentido: sentido
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
    this.formPunto.reset({
      se_turna_comision: false // <-- Establecer valor por defecto
    });
    this._eventoService.getCatalogos().subscribe({
      next: (response: any) => {
        console.log(response);
        this.slctProponentes = response.proponentes;
        this.slcTribunaDip = response.diputados;
        this.slcComisiones = response.comisiones; // <-- CARGAR COMISIONES
        this.slcDictamenes = response.dictamenes;
        this.slcTipIntervencion = response.tipointer;
        this.cargarPuntosRegistrados();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }


  abrirModalReservaPunto(punto: any) {
    this.formReserva.reset();
    this.mostrarformReserva = false;
    this.puntoSeleccionadoReserva = punto; // ← PUNTO = modo BD

    // Cargar reservas del punto desde el array que ya está cargado
    this.listaReservas = [...(punto.reservas || [])];

    this.modalRefT = this.modalService.open(this.xlModalT, {
      size: 'xl',
      windowClass: 'modal-top-centered',
      backdrop: 'static'
    });
  }



  cargarPuntosRegistrados(): void {
    this._eventoService.getPuntos(this.idComisionRuta).subscribe({
      next: (response: any) => {
        console.log('Response completo:', response);

        //iniciativas precargadas
        this.consoleiniciativas = response.selectini || [];
        this.slcIniciativasPrecargadas = response.selectini || [];

        console.log('Iniciativas precargadas:', this.slcIniciativasPrecargadas);
        // this.actualizarIniciativasDisponibles();
        this.listaPuntos = response.data || [];
        this.listaPuntos = this.listaPuntos.map(punto => {

          // Extraer los id_proponente únicos
          let proponentesIds: number[] = [];
          if (punto.presentan && Array.isArray(punto.presentan) && punto.presentan.length > 0) {
            const idsRaw = punto.presentan
              .map((p: any) => p.id_proponente)
              .filter((id: any) => id !== null && id !== undefined && id !== '');
            proponentesIds = [...new Set(idsRaw)].map(id => Number(id)).filter(id => !isNaN(id));
          }

          // Extraer los id_presenta como STRINGS
          const presentanIds = punto.presentan && Array.isArray(punto.presentan)
            ? punto.presentan
              .map((p: any) => {
                const id = p.id;
                return id !== null && id !== undefined ? String(id) : null;
              })
              .filter((id: string | null) => id !== null && id !== '' && id !== 'null' && id !== 'undefined')
            : [];

          // Extraer los id_comision del array turnocomision
          let comisionesIds: string[] = [];
          if (punto.turnocomision && Array.isArray(punto.turnocomision) && punto.turnocomision.length > 0) {
            comisionesIds = punto.turnocomision
              .map((tc: any) => tc.id_comision)
              .filter((id: any) => id !== null && id !== undefined);
          }

          // Determinar si se turna a comisión basado en si hay comisiones
          const seTurnaComision = comisionesIds.length > 0;
          let idPuntoTurnadoInicial: any = null;

          if (this.esComision) {
            idPuntoTurnadoInicial = punto.turnocomision?.[0]?.id_punto || null;
          } else {
            idPuntoTurnadoInicial = punto.id_dictamen || null;
          }

          const puntoMapeado = {
            ...punto,
            // ← AGREGAR ESTA LÍNEA: Asignar las reservas del response
            reservas: punto.reservas || [],
            iniciativas: punto.iniciativas || [],
            puntosTurnadosSeleccionados: (punto.turnocomision || []).map((tc: any) => {
              const encontrado = this.slcPuntosTurnados?.find((p: any) => p.id === tc.id_punto);
              return encontrado ? { ...encontrado } : { id: tc.id_punto, punto: `Punto #${tc.id_punto}` };
            }),
            tiposDisponibles: [],
            presentaDisponibles: [],
            form: this.fb.group({
              id: [punto.id],
              numpunto: [punto.nopunto],
              proponente: [proponentesIds],
              presenta: [presentanIds],
              tipo: [punto.id_tipo ? String(punto.id_tipo) : null],
              tribuna: [punto.tribuna],
              punto: [punto.punto],
              observaciones: [punto.observaciones],
              se_turna_comision: [seTurnaComision],
              id_comision: [comisionesIds],
              id_punto_turnado: [idPuntoTurnadoInicial]
            })
          };

          // Suscribirse a cambios en cada form de punto
          puntoMapeado.form.get('se_turna_comision')?.valueChanges.subscribe((value: boolean) => {
            const comisionControl = puntoMapeado.form.get('id_comision');
            if (value === true) {
              comisionControl?.setValidators([Validators.required, Validators.minLength(1)]);
            } else {
              comisionControl?.clearValidators();
              comisionControl?.setValue([]);
            }
            comisionControl?.updateValueAndValidity();
          });

          // PARA id_punto_turnado
          // puntoMapeado.form.get('id_punto_turnado')?.valueChanges.subscribe((value: any) => {
          //   this.aplicarPuntoTurnado(puntoMapeado.form, value);
          // });

          // LÓGICA INICIAL SI YA HAY UN VALOR
          // const valorInicial = puntoMapeado.form.get('id_punto_turnado')?.value;
          // if (valorInicial) {
          //   this.aplicarPuntoTurnado(puntoMapeado.form, valorInicial);
          // }

          // Cargar tipos UNA SOLA VEZ con el array completo de proponentes
          if (proponentesIds.length > 0) {
            this.cargarTiposParaPunto(puntoMapeado, proponentesIds);
          }

          return puntoMapeado;
        });
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
    this.cdr.detectChanges();
  }






  //**********************************INICIATIVAS******************************************************** */


  // NUEVO: Toggle para mostrar/ocultar el select de iniciativas precargadas
  toggleSelectIniciativaPrecargada() {
    this.mostrarSelectIniciativaPrecargada = !this.mostrarSelectIniciativaPrecargada;
    if (!this.mostrarSelectIniciativaPrecargada) {
      this.iniciativaPrecargadaSeleccionada = null;
    }
  }

  guardarIniciativaPrecargada() {
    if (!this.iniciativaPrecargadaSeleccionada) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "¡Atención!",
        text: "Debe seleccionar una iniciativa.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    if (!this.puntoSeleccionadoIniciativa) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Error",
        text: "No se puede agregar iniciativa sin un punto seleccionado.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const iniciativaSeleccionada = { ...this.iniciativaPrecargadaSeleccionada };

    const datos = {
      punto: this.puntoSeleccionadoIniciativa.id,
      iniciativa: iniciativaSeleccionada.id
    };

    console.log(datos);

    this._eventoService.saveIniciativasCargadas(datos).subscribe({
      next: (response: any) => {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: "success",
          title: "Iniciativa guardada correctamente."
        });

        this.iniciativaPrecargadaSeleccionada = null;

        // Actualización optimista de la UI
        if (response.data) {
          this.listaIniciativas.push(response.data);
          if (this.puntoSeleccionadoIniciativa.iniciativas) {
            this.puntoSeleccionadoIniciativa.iniciativas.push(response.data);
          } else {
            this.puntoSeleccionadoIniciativa.iniciativas = [response.data];
          }
        } else {
          const nuevaIniciativa = {
            id: response.id || iniciativaSeleccionada.id,
            iniciativa: iniciativaSeleccionada.iniciativa
          };

          this.listaIniciativas.push(nuevaIniciativa);
          if (this.puntoSeleccionadoIniciativa.iniciativas) {
            this.puntoSeleccionadoIniciativa.iniciativas.push(nuevaIniciativa);
          } else {
            this.puntoSeleccionadoIniciativa.iniciativas = [nuevaIniciativa];
          }
        }

        const puntoIndex = this.listaPuntos.findIndex(p => p.id === this.puntoSeleccionadoIniciativa.id);
        if (puntoIndex !== -1) {
          this.listaPuntos[puntoIndex].iniciativas = [...this.puntoSeleccionadoIniciativa.iniciativas];
        }

        // ✅ RECARGAR INICIATIVAS DISPONIBLES DESDE EL SERVIDOR
        this.cargarIniciativasDisponibles();

        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg,
          timer: 3000
        });
      }
    });
  }

  abrirModalIniciativa() {
    this.formIniciativa.reset();
    this.mostrarformIniciativa = false;
    this.puntoSeleccionadoIniciativa = null;
    this.listaIniciativas = [...this.iniciativasTemporales];

    this.modalRefI = this.modalService.open(this.xlModalI, {
      size: 'xl',
      windowClass: 'modal-top-centered',
      backdrop: 'static'
    });
  }

  abrirModalIniciativaPunto(punto: any) {
    this.formIniciativa.reset();
    this.mostrarformIniciativa = false;
    this.mostrarSelectIniciativaPrecargada = false;
    this.iniciativaPrecargadaSeleccionada = null;
    this.puntoSeleccionadoIniciativa = punto;
    this.listaIniciativas = [...(punto.iniciativas || [])];

    this.modalRefI = this.modalService.open(this.xlModalI, {
      size: 'xl',
      windowClass: 'modal-top-centered',
      backdrop: 'static'
    });
  }

  toggleformIniciativa() {
    this.mostrarformIniciativa = !this.mostrarformIniciativa;
    if (!this.mostrarformIniciativa) {
      this.formIniciativa.reset();
    }
  }

  guardarIniciativa() {
    if (this.formIniciativa.invalid) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "¡Atención!",
        text: "Debe escribir la descripción de la iniciativa.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    // CASO 1: CREAR NUEVO PUNTO (TEMPORAL)
    if (!this.puntoSeleccionadoIniciativa) {
      const nuevaIniciativa = {
        id: Date.now(),
        descripcion: this.formIniciativa.value.descripcion
      };

      this.listaIniciativas.push(nuevaIniciativa);
      this.iniciativasTemporales.push(nuevaIniciativa);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: "success",
        title: "Se agregó iniciativa (se guardará con el punto)."
      });

      this.toggleformIniciativa();
      return;
    }

    // CASO 2: PUNTO EXISTENTE (GUARDAR EN BD)
    const datos = {
      punto: this.puntoSeleccionadoIniciativa.id,
      descripcion: this.formIniciativa.value.descripcion
    };

    this._eventoService.saveIniciativa(datos).subscribe({
      next: (response: any) => {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: "success",
          title: "Iniciativa guardada correctamente."
        });

        this.toggleformIniciativa();

        if (response.data) {
          this.listaIniciativas.push(response.data);
          if (this.puntoSeleccionadoIniciativa.iniciativas) {
            this.puntoSeleccionadoIniciativa.iniciativas.push(response.data);
          } else {
            this.puntoSeleccionadoIniciativa.iniciativas = [response.data];
          }
        } else {
          const nuevaIniciativa = {
            id: response.id || Date.now(),
            descripcion: datos.descripcion
          };

          this.listaIniciativas.push(nuevaIniciativa);
          if (this.puntoSeleccionadoIniciativa.iniciativas) {
            this.puntoSeleccionadoIniciativa.iniciativas.push(nuevaIniciativa);
          } else {
            this.puntoSeleccionadoIniciativa.iniciativas = [nuevaIniciativa];
          }
        }

        const puntoIndex = this.listaPuntos.findIndex(p => p.id === this.puntoSeleccionadoIniciativa.id);
        if (puntoIndex !== -1) {
          this.listaPuntos[puntoIndex].iniciativas = [...this.puntoSeleccionadoIniciativa.iniciativas];
        }

        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg,
          timer: 3000
        });
      }
    });
  }

  eliminarIniciativa(iniciativa: any, index: number) {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se eliminará esta iniciativa",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {

        if (!this.puntoSeleccionadoIniciativa) {
          this.listaIniciativas.splice(index, 1);
          const tempIndex = this.iniciativasTemporales.findIndex(t => t.id === iniciativa.id);
          if (tempIndex > -1) {
            this.iniciativasTemporales.splice(tempIndex, 1);
          }

          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          Toast.fire({
            icon: "success",
            title: "Iniciativa eliminada."
          });
          return;
        }

        this._eventoService.deleteIniciativa(iniciativa.id).subscribe({
          next: (response: any) => {
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
            Toast.fire({
              icon: "success",
              title: "Iniciativa eliminada correctamente."
            });

            this.listaIniciativas.splice(index, 1);

            if (this.puntoSeleccionadoIniciativa.iniciativas) {
              const iniciativaIndex = this.puntoSeleccionadoIniciativa.iniciativas.findIndex(
                (r: any) => r.id === iniciativa.id
              );
              if (iniciativaIndex !== -1) {
                this.puntoSeleccionadoIniciativa.iniciativas.splice(iniciativaIndex, 1);
              }
            }

            const puntoIndex = this.listaPuntos.findIndex(p => p.id === this.puntoSeleccionadoIniciativa.id);
            if (puntoIndex !== -1) {
              this.listaPuntos[puntoIndex].iniciativas = [...this.puntoSeleccionadoIniciativa.iniciativas];
            }

            // ✅ RECARGAR INICIATIVAS DISPONIBLES DESDE EL SERVIDOR
            this.cargarIniciativasDisponibles();

            this.cdr.detectChanges();
          },
          error: (e: HttpErrorResponse) => {
            const msg = e.error?.msg || 'Error desconocido';
            console.error('Error del servidor:', msg);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: msg,
              timer: 3000
            });
          }
        });
      }
    });
  }

  cerrarModalIniciativa() {
    this.modalRefI.close();
  }



  // cargarPuntosRegistrados(): void {
  //   this._eventoService.getPuntos(this.idComisionRuta).subscribe({
  //     next: (response: any) => {
  //       console.log('Response completo:', response);
  //       this.listaPuntos = response.data || [];
  //       this.listaPuntos = this.listaPuntos.map(punto => {

  //         // Extraer los id_proponente únicos
  //         let proponentesIds: number[] = [];
  //         if (punto.presentan && Array.isArray(punto.presentan) && punto.presentan.length > 0) {
  //           const idsRaw = punto.presentan
  //             .map((p: any) => p.id_proponente)
  //             .filter((id: any) => id !== null && id !== undefined && id !== '');
  //           proponentesIds = [...new Set(idsRaw)].map(id => Number(id)).filter(id => !isNaN(id));
  //         }

  //         // Extraer los id_presenta como STRINGS
  //         const presentanIds = punto.presentan && Array.isArray(punto.presentan)
  //           ? punto.presentan
  //             .map((p: any) => {
  //               // Convertir a string sin importar si es UUID o número
  //               const id = p.id; //id_presenta
  //               return id !== null && id !== undefined ? String(id) : null;
  //             })
  //             .filter((id: string | null) => id !== null && id !== '' && id !== 'null' && id !== 'undefined')
  //           : [];

  //         console.log(presentanIds);

  //         // Extraer los id_comision del array turnocomision
  //         let comisionesIds: string[] = [];
  //         if (punto.turnocomision && Array.isArray(punto.turnocomision) && punto.turnocomision.length > 0) {
  //           comisionesIds = punto.turnocomision
  //             .map((tc: any) => tc.id_comision)
  //             .filter((id: any) => id !== null && id !== undefined);
  //         }

  //         // Determinar si se turna a comisión basado en si hay comisiones
  //         const seTurnaComision = comisionesIds.length > 0;
  //         let idPuntoTurnadoInicial: any = null;

  //         if (this.esComision) {
  //           idPuntoTurnadoInicial = punto.turnocomision?.[0]?.id_punto || null;
  //         } else {
  //           idPuntoTurnadoInicial = punto.id_dictamen || null; 
  //         }

  //         console.log(this.esComision)
  //         console.log('PIKOASDJKASJKS', punto.turnocomision.id_punto);
  //         const puntoMapeado = {
  //           ...punto,
  //           tiposDisponibles: [],
  //           presentaDisponibles: [],
  //           form: this.fb.group({
  //             id: [punto.id],
  //             numpunto: [punto.nopunto],
  //             proponente: [proponentesIds],
  //             presenta: [presentanIds],
  //             tipo: [punto.id_tipo ? String(punto.id_tipo) : null],
  //             tribuna: [punto.tribuna],
  //             punto: [punto.punto],
  //             observaciones: [punto.observaciones],
  //             se_turna_comision: [seTurnaComision],
  //             id_comision: [comisionesIds],
  //             id_punto_turnado: [idPuntoTurnadoInicial]
  //           })
  //         };

  //         // Suscribirse a cambios en cada form de punto
  //         puntoMapeado.form.get('se_turna_comision')?.valueChanges.subscribe((value: boolean) => {
  //           const comisionControl = puntoMapeado.form.get('id_comision');
  //           if (value === true) {
  //             // Validar que el array tenga al menos 1 elemento
  //             comisionControl?.setValidators([Validators.required, Validators.minLength(1)]);
  //           } else {
  //             comisionControl?.clearValidators();
  //             comisionControl?.setValue([]); // Limpiar con array vacío
  //           }
  //           comisionControl?.updateValueAndValidity();
  //         });

  //         // PARA id_punto_turnado
  //         puntoMapeado.form.get('id_punto_turnado')?.valueChanges.subscribe((value: any) => {
  //           this.aplicarPuntoTurnado(puntoMapeado.form, value);
  //         });

  //         // LÓGICA INICIAL SI YA HAY UN VALOR
  //         const valorInicial = puntoMapeado.form.get('id_punto_turnado')?.value;
  //         if (valorInicial) {
  //           this.aplicarPuntoTurnado(puntoMapeado.form, valorInicial);
  //         }


  //         // Cargar tipos UNA SOLA VEZ con el array completo de proponentes
  //         if (proponentesIds.length > 0) {
  //           this.cargarTiposParaPunto(puntoMapeado, proponentesIds);
  //         } else {
  //         }

  //         return puntoMapeado;
  //       });
  //     },
  //     error: (e: HttpErrorResponse) => {
  //       const msg = e.error?.msg || 'Error desconocido';
  //       console.error('Error del servidor:', msg);
  //     }
  //   });
  //   this.cdr.detectChanges();
  // }





  // aplicarPuntoTurnado(form: FormGroup, value: any): void {
  //   if (!value) {
  //     form.get('punto')?.setValue('');
  //     form.get('punto')?.enable();
  //     return;
  //   }

  //   let selectedOption;

  //   if (this.esComision) {
  //     selectedOption = this.slcPuntosTurnados.find((p: any) => p.id === value);
  //   } else {
  //     selectedOption = this.slcDictamenes.find((d: any) => d.id === value);
  //   }

  //   const textoSeleccionado = selectedOption?.punto || '';

  //   form.get('punto')?.setValue(textoSeleccionado);
  //   form.get('punto')?.disable();
  // }


  getTipoPParaPunto(event: any, punto: any): void {
    if (event && Array.isArray(event) && event.length > 0) {
      // punto.form.get('tipo')?.setValue(null);
      // punto.form.get('presenta')?.setValue([]);
      const idsProponentes = event.map(item => item.id);
      this.cargarTiposParaPunto(punto, idsProponentes);
    } else {
      // Si no hay selección, limpiar
      punto.tiposDisponibles = [];
      punto.presentaDisponibles = [];
    }
  }

  cargarTiposParaPunto(punto: any, proponentesIds: number[]): void {
    if (!proponentesIds || !Array.isArray(proponentesIds) || proponentesIds.length === 0) {
      console.error('proponentes vacío o inválido');
      return;
    }

    const proponentesObjetos = proponentesIds
      .map(id => this.slctProponentes.find((p: any) => Number(p.id) === Number(id)))
      .filter(p => p !== undefined);


    if (proponentesObjetos.length === 0) {
      return;
    }

    this._eventoService.getTipo(proponentesObjetos).subscribe({
      next: (response: any) => {
        // console.log('estos son los RESPONSE presneta: ', response);
        // Asignar los datos
        punto.tiposDisponibles = (response.tipos || []).map((tipo: any) => ({
          ...tipo,
          id: String(tipo.id)
        }));
        // AQUI ABAJO CAMBIE id_original por id
        punto.presentaDisponibles = (response.dtSlct || []).map((item: any) => ({
          ...item,
          id: String(item.id)
        }));

        // console.log('estos son los presneta: ', punto.presentaDisponibles);
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar tipos:', e);
        punto.tiposDisponibles = [];
        punto.presentaDisponibles = [];
      }
    });
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

    if (this.esComision) {
      this.tipo_evento = 1;
    } else {
      this.tipo_evento = 0;

    }
    formData.append('tipo_evento', this.tipo_evento);


    const idsPuntosTurnados = (punto.puntosTurnadosSeleccionados || []).map((p: any) => p.id);
    formData.append('puntos_turnados', JSON.stringify(idsPuntosTurnados));
    // formData.forEach((valor, clave) => {
    //   console.log(clave, valor);
    // });

    this._eventoService.updatePunto(formData, punto.id).subscribe({
      next: (response: any) => {
        this.cargarPuntosRegistrados();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al actualizar:', e);
      }
    });

  }


  eliminarPunto(punto: any, index: number) {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se eliminará este punto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this._eventoService.deletePunto(punto.id, this.esComision).subscribe({
          next: (response: any) => {
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
              title: "Punto eliminado correctamente."
            });
            this.cargarPuntosRegistrados();
          },
          error: (e: HttpErrorResponse) => {
            const msg = e.error?.msg || 'Error desconocido';
            console.error('Error del servidor:', msg);
          }
        });
      }
    });
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

  // ==================== MODAL DE INTERVENCIONES ====================

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

  abrirModalReserva() {
    // this.formReserva.reset();
    // this.mostrarformReserva = false;
    // // No cargamos temas del servidor, usamos los temporales
    // this.listaReservas = [...this.reservasTemporales];

    // this.modalRefT = this.modalService.open(this.xlModalT, {
    //   size: 'xl',
    //   windowClass: 'modal-top-centered',
    //   backdrop: 'static'
    // });
    this.formReserva.reset();
    this.mostrarformReserva = false;
    // Caso: crear nuevo punto (usa temporales)
    this.puntoSeleccionadoReserva = null; // ← NULL = modo temporal
    this.listaReservas = [...this.reservasTemporales];

    this.modalRefT = this.modalService.open(this.xlModalT, {
      size: 'xl',
      windowClass: 'modal-top-centered',
      backdrop: 'static'
    });
  }

  // MODIFICA toggleformReserva (mantiene igual):
  toggleformReserva() {
    this.mostrarformReserva = !this.mostrarformReserva;
    if (!this.mostrarformReserva) {
      this.formReserva.reset();
    }
  }

  guardarTema() {
    if (this.formReserva.invalid) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "¡Atención!",
        text: "Debe escribir la descripción de la reserva.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    // ==========================================
    // CASO 1: CREAR NUEVO PUNTO (TEMPORAL)
    // ==========================================
    if (!this.puntoSeleccionadoReserva) {
      const nuevoTema = {
        id: Date.now(), // ID temporal
        tema_votacion: this.formReserva.value.descripcion
      };

      this.listaReservas.push(nuevoTema);
      this.reservasTemporales.push(nuevoTema);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: "success",
        title: "Se agregó reserva (se guardará con el punto)."
      });

      this.toggleformReserva();
      return; // ← SALE AQUÍ, no hace subscribe
    }

    // ==========================================
    // CASO 2: PUNTO EXISTENTE (GUARDAR EN BD CON SUBSCRIBE)
    // ==========================================
    const datos = {
      punto: this.puntoSeleccionadoReserva.id,
      descripcion: this.formReserva.value.descripcion
    };

    // ← AQUÍ SÍ HACE SUBSCRIBE INMEDIATAMENTE
    this._eventoService.saveReserva(datos).subscribe({
      next: (response: any) => {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: "success",
          title: "Reserva guardada correctamente."
        });

        this.toggleformReserva();

        // ==========================================
        // ACTUALIZACIÓN OPTIMISTA: Actualizar la lista del modal inmediatamente
        // ==========================================

        // Opción 1: Si el backend devuelve la reserva creada en el response
        if (response.data) {
          this.listaReservas.push(response.data);

          // También actualizar el array de reservas del punto en memoria
          if (this.puntoSeleccionadoReserva.reservas) {
            this.puntoSeleccionadoReserva.reservas.push(response.data);
          } else {
            this.puntoSeleccionadoReserva.reservas = [response.data];
          }
        }
        // Opción 2: Si el backend NO devuelve la reserva, crearla manualmente
        else {
          const nuevaReserva = {
            id: response.id || Date.now(), // Usar el ID del response o temporal
            tema_votacion: datos.descripcion,

          };

          this.listaReservas.push(nuevaReserva);

          // También actualizar el array de reservas del punto en memoria
          if (this.puntoSeleccionadoReserva.reservas) {
            this.puntoSeleccionadoReserva.reservas.push(nuevaReserva);
          } else {
            this.puntoSeleccionadoReserva.reservas = [nuevaReserva];
          }
        }

        // Actualizar la lista de puntos sin hacer otra petición al servidor
        const puntoIndex = this.listaPuntos.findIndex(p => p.id === this.puntoSeleccionadoReserva.id);
        if (puntoIndex !== -1) {
          this.listaPuntos[puntoIndex].reservas = [...this.puntoSeleccionadoReserva.reservas];
        }

        // Forzar detección de cambios para actualizar el badge
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg,
          timer: 3000
        });
      }
    });
  }

  // MODIFICA eliminarTema:
  eliminarReserva(reserva: any, index: number) {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se eliminará esta reserva",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {

        // ==========================================
        // CASO 1: CREAR NUEVO PUNTO (TEMPORAL)
        // ==========================================
        if (!this.puntoSeleccionadoReserva) {
          // Eliminar de ambas listas temporales
          this.listaReservas.splice(index, 1);
          const tempIndex = this.reservasTemporales.findIndex(t => t.id === reserva.id);
          if (tempIndex > -1) {
            this.reservasTemporales.splice(tempIndex, 1);
          }

          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          Toast.fire({
            icon: "success",
            title: "Reserva eliminada."
          });
          return; // ← SALE AQUÍ, no hace subscribe
        }

        // ==========================================
        // CASO 2: PUNTO EXISTENTE (ELIMINAR DE BD CON SUBSCRIBE)
        // ==========================================
        this._eventoService.deleteReserva(reserva.id).subscribe({
          next: (response: any) => {
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
            Toast.fire({
              icon: "success",
              title: "Reserva eliminada correctamente."
            });

            // ==========================================
            // ACTUALIZACIÓN OPTIMISTA: Eliminar de la lista inmediatamente
            // ==========================================

            // Eliminar de la lista del modal
            this.listaReservas.splice(index, 1);

            // Eliminar del array de reservas del punto en memoria
            if (this.puntoSeleccionadoReserva.reservas) {
              const reservaIndex = this.puntoSeleccionadoReserva.reservas.findIndex(
                (r: any) => r.id === reserva.id
              );
              if (reservaIndex !== -1) {
                this.puntoSeleccionadoReserva.reservas.splice(reservaIndex, 1);
              }
            }

            // Actualizar la lista de puntos sin hacer otra petición
            const puntoIndex = this.listaPuntos.findIndex(p => p.id === this.puntoSeleccionadoReserva.id);
            if (puntoIndex !== -1) {
              this.listaPuntos[puntoIndex].reservas = [...this.puntoSeleccionadoReserva.reservas];
            }

            // Forzar detección de cambios para actualizar el badge
            this.cdr.detectChanges();
          },
          error: (e: HttpErrorResponse) => {
            const msg = e.error?.msg || 'Error desconocido';
            console.error('Error del servidor:', msg);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: msg,
              timer: 3000
            });
          }
        });
      }
    });
  }







  abrirModalIntervencion() {
    this.formIntervencion.reset({
      id_diputado: [],
      id_tipo_intervencion: [],
      comentario: { value: '', disabled: true },
      destacada: false,
      liga: ''
    });
    this.mostrarFormIntervencion = false;
    this.cargarIntervenciones();
    this.modalRef = this.modalService.open(this.xlModal, {
      size: 'xl',
      windowClass: 'modal-top-centered',
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
        destacada: false,
        liga: ''
      });
    }
  }
  onTipoIntervencionChange(event: { id?: number; valor?: string } | null) {
    const tipoValor = String(event?.valor ?? '').trim().toLowerCase();
    const comentarioControl = this.formIntervencion.get('comentario');
    if (tipoValor === 'comentario') {
      comentarioControl?.enable();
    } else {
      comentarioControl?.disable();
      comentarioControl?.setValue('');
    }
  }

  cargarIntervenciones() {
    const datos = {
      tipo: this.tipoIntervencionActual,
      idpunto: this.puntoSeleccionado?.id || null,
      idagenda: this.idComisionRuta
    }
    // console.log(datos);


    this._eventoService.getIntervenciones(datos).subscribe({
      next: (response: any) => {
        // console.log(response);
        this.listaIntervenciones = response.data || [];
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });

    this.listaIntervenciones = [];
  }

  guardarIntervencion() {
    if (this.formIntervencion.value.id_diputado == '' || this.formIntervencion.value.id_tipo_intervencion == '') {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "¡Atención!",
        text: `Debe seleccionar Diputado y tipo intervención.`,
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    if (this.formIntervencion.value.comentario == '') {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "¡Atención!",
        text: `Debe dejar un comentario.`,
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const datos = {
      ...this.formIntervencion.value,
      tipo: this.tipoIntervencionActual,
      id_punto: this.puntoSeleccionado?.id || null,
      id_evento: this.idComisionRuta
    };

    this._eventoService.saveIntervencion(datos).subscribe({
      next: (response: any) => {
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
          title: "Intervención guardada correctamente."
        });
        this.toggleFormIntervencion();
        this.cargarIntervenciones();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });

  }

  eliminarIntervencion(intervencion: Intervencion, index: number) {
    if (confirm('¿Estás seguro de eliminar esta intervención?')) {

    }
  }

  getNombreDiputados(diputados: any[]): string {
    if (!diputados || diputados.length === 0) return 'Sin diputados';
    return diputados.map(d => d.nombre || d).join(', ');
  }

  cerrarModal() {
    this.modalRef.close();
  }
  cerrarModalReserva() {
    this.modalRefT.close();
  }
  // ==================== FIN DEL MODAL ====================
  notificar(punto: any) {

  }


  getTipoP(id?: any): void {
    // this.formPunto.get('tipo')?.setValue(null);
    // this.formPunto.get('presenta')?.setValue(null);

    this._eventoService.getTipo(id).subscribe({
      next: (response: any) => {
        console.log('response de los presenta y tipo de crear: ', response);
        this.slcPresenta = (response.dtSlct || []).map((item: any) => ({
          ...item,
          id: String(item.id)
        }));

        this.slcTipo = response.tipos || [];
        console.log('presenta11 ', this.slcPresenta);
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
    this.puntosTurnadosSeleccionados = [];
    this.documentos['docPunto'] = null;
    this.formPunto.reset({
      se_turna_comision: false
    });

    // Limpiar temporales cuando se cierra el formulario
    if (!this.mostrarFormularioPunto) {
      this.reservasTemporales = [];
      this.listaReservas = [];
      this.iniciativasTemporales = []; // AGREGAR ESTA LÍNEA
      this.listaIniciativas = [];       // AGREGAR ESTA LÍNEA
    }
  }

  guardarPunto() {
    if (this.formPunto.invalid) {
      this.formPunto.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    // Agregar todos los campos del formulario
    Object.entries(this.formPunto.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Agregar documento si existe
    if (this.documentos['docPunto']) {
      formData.append('documento', this.documentos['docPunto'], this.documentos['docPunto'].name);
    }

    // Agregar tipo de evento
    if (this.esComision) {
      this.tipo_evento = 1;
    } else {
      this.tipo_evento = 0;
    }
    formData.append('tipo_evento', this.tipo_evento);

    const idsPuntosTurnados = this.puntosTurnadosSeleccionados.map(p => p.id);
    formData.append('puntos_turnados', JSON.stringify(idsPuntosTurnados));

    if (this.reservasTemporales.length > 0) {
      const reservasParaEnviar = this.reservasTemporales.map(t => ({
        descripcion: t.tema_votacion

      }));
      formData.append('reservas', JSON.stringify(reservasParaEnviar));
    }
    if (this.iniciativasTemporales.length > 0) {
      const iniciativasParaEnviar = this.iniciativasTemporales.map(i => ({
        descripcion: i.descripcion
      }));
      formData.append('iniciativas', JSON.stringify(iniciativasParaEnviar));
    }

    // Log para verificar
    console.log('reservas a enviar:', this.reservasTemporales);

    formData.forEach((valor, clave) => {
      console.log(clave, valor);
    });
    this._eventoService.saveRegistro(formData, this.idComisionRuta).subscribe({
      next: (response: any) => {
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
          title: "Punto guardado correctamente."
        });

        // Limpiar todo
        this.documentos['docPunto'] = null;
        this.formPunto.reset({
          se_turna_comision: false
        });
        this.reservasTemporales = [];
        this.listaReservas = [];
        this.iniciativasTemporales = [];
        this.listaIniciativas = [];
        this.mostrarFormularioPunto = false;
        this.cargarPuntosRegistrados();
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg,
          timer: 3000
        });
      }
    });
  }

  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */

  private cargarDatosVotacion(): void {
    // this._eventoService.getPuntos(this.idComisionRuta).subscribe({
    //   next: (response: any) => {
    //     this.listaPuntosVotacion = response.data || [];
    //   },
    //   error: (e: HttpErrorResponse) => {
    //     const msg = e.error?.msg || 'Error desconocido';
    //     console.error('Error del servidor:', msg);
    //   }
    // });
    // Limpiar datos anteriores
    this.puntoSeleccionadoVotacion = null;
    this.reservaPuntoSeleccionadoVotacion = null;
    this.listaReservasPunto = [];
    this.votantes = [];
    this.listaComisionesVotacion = [];
    this.columnaVotantes1 = [];
    this.columnaVotantes2 = [];
    this.votacionActual = { idPunto: null, idReserva: null };
    this.votacionIniciada = false;

    // Cargar solo la lista de puntos disponibles
    this._eventoService.getPuntos(this.idComisionRuta).subscribe({
      next: (response: any) => {
        this.listaPuntosVotacion = response.data || [];
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }

  onPuntoVotacionChange(puntoId: any): void {
    if (puntoId.id) {
      this.agendaPunto = puntoId.id;
      this.cargarVotantes(puntoId.id);
      if (this.segPlanoActivo && this.step === 3) {
        // console.log('onchange');
        this.detenerSegPlano();
        this.iniciarSegPlano();
      }
    }
  }

  getReservasPuntos(puntoId: any) {
    // console.log(puntoId);

    // Limpiar la reserva seleccionada cuando cambies de punto
    this.reservaPuntoSeleccionadoVotacion = null;

    // SOLO cargar las reservas, NO los votantes
    this._eventoService.getReservas(puntoId.id).subscribe({
      next: (response: any) => {
        console.log('reservas', response.data.reservas);
        // Asignar las reservas al array
        this.listaReservasPunto = response.data.reservas || [];
        this.cdr.detectChanges();
        this.iniciarVotacion();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar reservas:', e);
        this.listaReservasPunto = [];
      }
    });
  }


  iniciarVotacion(): void {
    if (!this.puntoSeleccionadoVotacion) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "¡Atención!",
        text: "Debe seleccionar un punto para iniciar la votación.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    // Almacenar los datos seleccionados
    this.votacionActual = {
      idPunto: this.puntoSeleccionadoVotacion,
      idReserva: this.reservaPuntoSeleccionadoVotacion || null
    };

    console.log('Datos de votación:', this.votacionActual);

    // Cargar los votantes
    this.cargarVotantes(this.puntoSeleccionadoVotacion);

    // Actualizar idpto para el sistema de actualización automática
    this.idpto = this.puntoSeleccionadoVotacion;

    // MARCAR QUE LA VOTACIÓN HA SIDO INICIADA
    this.votacionIniciada = true;

    // Reiniciar el sistema de actualización automática si está activo
    if (this.segPlanoActivo && this.step === 3) {
      this.detenerSegPlano();
      this.iniciarSegPlano();
    }

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: "success",
      title: "Votación iniciada correctamente"
    });
  }

  private cargarVotantes(punto: any): void {
    this.idpto = punto;
    console.log('A ENVIAG', this.votacionActual);
    this._eventoService.getIntegrantesVotosPunto(this.votacionActual).subscribe({
      next: (response: any) => {
        // console.log('Respuesta votantes:', response);

        // Verificar si es comisión o sesión
        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primerElemento = response.integrantes[0];

          if (primerElemento.comision_id && primerElemento.integrantes && Array.isArray(primerElemento.integrantes)) {
            // ES COMISIÓN
            // console.log('ES COMISIÓN - Cargando votaciones por comisión');
            this.listaComisionesVotacion = response.integrantes.map((comision: any) => ({
              id: comision.comision_id,
              nombre: comision.comision_nombre,
              importancia: comision.importancia,
              integrantes: comision.integrantes || [],
              columna1: [],
              columna2: []
            }));

            // Dividir en columnas cada comisión
            this.listaComisionesVotacion.forEach(comision => {
              const mitad = Math.ceil(comision.integrantes.length / 2);
              comision.columna1 = comision.integrantes.slice(0, mitad);
              comision.columna2 = comision.integrantes.slice(mitad);
            });

          } else {
            // ES SESIÓN
            // console.log('ES SESIÓN - Cargando votaciones normal');
            this.votantes = response.integrantes || [];
            this.dividirEnColumnasVotacion();
          }
        } else {
          this.votantes = [];
          this.listaComisionesVotacion = [];
        }
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar votantes:', e);
      }
    });
  }

  private dividirEnColumnasVotacion(): void {
    const mitad = Math.ceil(this.votantes.length / 2);
    this.columnaVotantes1 = this.votantes.slice(0, mitad);
    this.columnaVotantes2 = this.votantes.slice(mitad);
  }

  contarVotaciones(tipo: number): number {
    return this.votantes.filter(v => v.sentido === tipo).length;
  }

  // Métodos para comisiones en votación
  contarVotacionesComision(integrantes: any[], tipo: number): number {
    return integrantes.filter(i => i.sentido === tipo).length;
  }

  contarTotalGeneralVotacion(): number {
    if (!this.listaComisionesVotacion || this.listaComisionesVotacion.length === 0) {
      return 0;
    }
    return this.listaComisionesVotacion.reduce((total, comision) => {
      return total + comision.integrantes.length;
    }, 0);
  }

  contarVotacionesGeneral(tipo: number): number {
    if (!this.listaComisionesVotacion || this.listaComisionesVotacion.length === 0) {
      return 0;
    }
    return this.listaComisionesVotacion.reduce((total, comision) => {
      const count = comision.integrantes.filter((i: any) => i.sentido === tipo).length;
      return total + count;
    }, 0);
  }



  async marcarTodosVotos(sentido: number): Promise<void> {
    this.isUpdatingVotacion = true;
    this.cdr.detectChanges();

    // Pequeña pausa para que el spinner se muestre
    await new Promise(resolve => setTimeout(resolve, 100));

    const datos = {
      // idpunto: this.agendaPunto,
      idpunto: this.puntoSeleccionadoVotacion,
      idReserva: this.reservaPuntoSeleccionadoVotacion || null,
      sentido: sentido
    }

    console.log(datos);

    try {
      const response: any = await this._eventoService.ActualizarTodosVotos(datos).toPromise();

      // ACTUALIZACIÓN OPTIMISTA: Actualizar la UI inmediatamente
      if (this.esComision) {
        // Actualizar todas las comisiones localmente
        this.listaComisionesVotacion.forEach(comision => {
          comision.integrantes.forEach((integrante: any) => {
            integrante.sentido = sentido;
          });
          // Actualizar columnas
          const mitad = Math.ceil(comision.integrantes.length / 2);
          comision.columna1 = comision.integrantes.slice(0, mitad);
          comision.columna2 = comision.integrantes.slice(mitad);
        });
      } else {
        // Actualizar lista normal de sesión
        this.votantes.forEach(votante => {
          votante.sentido = sentido;
        });
        this.dividirEnColumnasVotacion();
      }

      this.cdr.detectChanges();

      // Toast de éxito
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: "success",
        title: "Votaciones actualizadas correctamente"
      });

    } catch (e: any) {
      const msg = e.error?.msg || 'Error desconocido';
      console.error('Error del servidor:', msg);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        timer: 3000
      });
    } finally {
      this.isUpdatingVotacion = false;
      this.cdr.detectChanges();
    }
  }


  marcarVotacion(votante: Votante, sentido: number): void {
    votante.sentido = sentido;

    const datos = {
      idpunto: this.idpto,
      id: votante.id,
      sentido: votante.sentido
    }
    this._eventoService.saveVotacion(datos).subscribe({
      next: (response: any) => {
        // console.log(response);
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al votar:', e);
      }
    });
  }

  marcarVotacionComision(integrante: any, sentido: number, comisionId: string): void {
    integrante.sentido = sentido;
    const datos = {
      idpunto: this.idpto,
      id: integrante.id,
      sentido: integrante.sentido
    }


    this._eventoService.saveVotacion(datos).subscribe({
      next: (response: any) => {
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al votar:', e);
      }
    });
  }

  getClaseVotacion(sentido: number): string {
    switch (sentido) {
      case 1:
        return 'votacion-favor';
      case 2:
        return 'votacion-abstencion';
      case 3:
        return 'votacion-contra';
      case 0:
        return 'votacion-pendiente';
      default:
        return '';
    }
  }

  terminarVotacion(): void {
    // Swal.fire({
    //   title: '¿Terminar votación?',
    //   text: 'Se finalizará la votación del punto seleccionado',
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonColor: '#28a745',
    //   cancelButtonColor: '#6c757d',
    //   confirmButtonText: 'Sí, terminar',
    //   cancelButtonText: 'Cancelar'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.puntoSeleccionadoVotacion = null;

    //     const Toast = Swal.mixin({
    //       toast: true,
    //       position: 'top-end',
    //       showConfirmButton: false,
    //       timer: 3000,
    //       timerProgressBar: true
    //     });
    //     Toast.fire({
    //       icon: 'success',
    //       title: 'Votación finalizada correctamente'
    //     });
    //   }
    // });
    Swal.fire({
      title: '¿Terminar votación?',
      text: 'Se finalizará la votación del punto seleccionado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, terminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('me voy')
        this._eventoService.terminarVotacion(this.idpto).subscribe({
          next: (response: any) => {
            console.log(response);
            this.finalizarVotacion();
          },
          error: (e: HttpErrorResponse) => {
            if (e.status === 404) {
              this.finalizarVotacion();
            } else {
              console.error('Error al terminar votación:', e);
            }
          }
        });
      }
    });
  }



  private finalizarVotacion(): void {
    this.puntoSeleccionadoVotacion = null;
    this.reservaPuntoSeleccionadoVotacion = null;
    this.votacionIniciada = false;
    this.votacionActual = { idPunto: null, idReserva: null };

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: 'success',
      title: 'Votación finalizada correctamente'
    });
  }


  reiniciarVotacion(): void {
    Swal.fire({
      title: '¿Reiniciar votación?',
      text: 'Se borrarán todos los votos del punto seleccionado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {

        const datos = {
          // idpunto: this.idpto,
          idPunto: this.puntoSeleccionadoVotacion,
          idReserva: this.reservaPuntoSeleccionadoVotacion || null
        }
        this._eventoService.reinicioVotacion(datos).subscribe({
          next: (response: any) => {
            // Reiniciar según el tipo
            if (this.esComision && this.listaComisionesVotacion.length > 0) {
              this.listaComisionesVotacion.forEach(comision => {
                comision.integrantes.forEach((v: any) => v.sentido = 0);
                const mitad = Math.ceil(comision.integrantes.length / 2);
                comision.columna1 = comision.integrantes.slice(0, mitad);
                comision.columna2 = comision.integrantes.slice(mitad);
              });
            } else {
              this.votantes.forEach(v => v.sentido = 0);
              this.dividirEnColumnasVotacion();
            }
            this.cdr.detectChanges();
          },
          error: (e: HttpErrorResponse) => {
            console.error('Error al reiniciar votación:', e);
          }
        });

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'info',
          title: 'Votación reiniciada'
        });
      }
    });
  }

  imprimirVotacion(): void {
    // Swal.fire({
    //   position: 'center',
    //   icon: 'info',
    //   title: 'Generando reporte...',
    //   text: 'Se descargará el reporte de votación',
    //   showConfirmButton: false,
    //   timer: 2000
    // });
    // const datos = {
    //   idPunto: this.puntoSeleccionadoVotacion,
    //   idReserva: this.reservaPuntoSeleccionadoVotacion || null
    // }
    // // Aquí va la lógica para imprimir/descargar
    // setTimeout(() => {
    //   console.log('Imprimir votación del punto:', this.puntoSeleccionadoVotacion);
    // }, 2000);

    this._eventoService.generarPDFVotacion(this.idpto).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `votacion_.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          Swal.fire({
            icon: 'info',
            title: 'Sin registros',
            text: 'No se encontraron registros de votación para esta sesión.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#800048',
          });
        } else {
          console.error('Error al descargar votación:', e);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al descargar el archivo. Intenta de nuevo.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#800048',
          });
        }
      }
    });
  }


  notificarWhats(tipo: number): void {
    console.log(tipo);


    Swal.fire({
      position: 'center',
      icon: 'info',
      title: 'Enviando notificación',
      text: 'Espere mientras se procesa la solicitud',
      showConfirmButton: false,
      allowOutsideClick: false
    });


    if (tipo == 2) {
      const datos = {
        // idpunto: this.idpto,
        idPunto: this.puntoSeleccionadoVotacion,
        idReserva: this.reservaPuntoSeleccionadoVotacion || null
      }
      this._eventoService.notificarWhatsVotacion(datos).subscribe({
        next: (response: any) => {

          Swal.close();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Notificación enviada correctamente',
            timer: 3000,
            showConfirmButton: false
          });
        },

        error: (e: HttpErrorResponse) => {
          console.error('Error al notificar:', e);

          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo enviar la notificación',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
      });

    } else {
      this._eventoService.notificarWhatsAsistencia(this.idComisionRuta).subscribe({
        next: (response: any) => {

          Swal.close();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Notificación enviada correctamente',
            timer: 3000,
            showConfirmButton: false
          });
        },

        error: (e: HttpErrorResponse) => {
          console.error('Error al notificar:', e);

          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo enviar la notificación',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
      });
    }

  }


  private cargarDatosResumen(): void {

  }

  obtenerTextoPunto(idPunto: number | null): string {
    if (!idPunto) return '';

    const punto = this.listaPuntosVotacion.find(p => p.id === idPunto);
    if (!punto) return `Punto #${idPunto}`;

    // Mostrar número y descripción del punto
    return `${punto.nopunto ? 'Punto ' + punto.nopunto : 'Punto'}: ${punto.punto}`;
  }

  obtenerTextoReserva(idReserva: string | null): string {
    if (!idReserva) return '';

    const reserva = this.listaReservasPunto.find(r => r.id === idReserva);
    if (!reserva) return `Reserva #${idReserva}`;

    return reserva.tema_votacion || 'Sin descripción';
  }


  agregarPuntoTurnado(): void {
    const valor = this.formPunto.get('id_punto_turnado')?.value;
    if (!valor) return;

    const yaAgregado = this.puntosTurnadosSeleccionados.find(p => p.id === valor);
    if (yaAgregado) return;

    const opcion = this.slcPuntosTurnados?.find((p: any) => p.id === valor);
    if (opcion) {
      this.puntosTurnadosSeleccionados.push({ ...opcion });
      this.formPunto.get('id_punto_turnado')?.setValue(null);
    }
  }

  quitarPuntoTurnado(index: number): void {
    this.puntosTurnadosSeleccionados.splice(index, 1);
  }


  // ACCORDION (punto existente)
  agregarPuntoTurnadoPunto(punto: any): void {
    const valor = punto.form.get('id_punto_turnado')?.value;
    if (!valor) return;

    if (!punto.puntosTurnadosSeleccionados) punto.puntosTurnadosSeleccionados = [];

    const yaAgregado = punto.puntosTurnadosSeleccionados.find((p: any) => p.id === valor);
    if (yaAgregado) return;

    const opcion = this.slcPuntosTurnados?.find((p: any) => p.id === valor);
    if (opcion) {
      punto.puntosTurnadosSeleccionados.push({ ...opcion });
      punto.form.get('id_punto_turnado')?.setValue(null);
    }
  }

  quitarPuntoTurnadoPunto(punto: any, index: number): void {
    punto.puntosTurnadosSeleccionados.splice(index, 1);
  }

}