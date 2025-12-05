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
  listaPuntosVotacion: any[] = [];
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

  listaPuntos: any[] = [];
  mostrarFormularioPunto = false;
  formPunto!: FormGroup;

  modalRef!: NgbModalRef;
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
      id_comision: [[]] // <-- NUEVO (array vacío para multi-select)
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
      destacada: [false]
    });

  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
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
    this._eventoService.getIntegrantesVotosPunto(this.idpto).subscribe({
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
        // console.log('Respuesta completa:', response.evento.id);
        this.idEvento = response.evento.id;
        this.tituloC = response.titulo;
        this.fechaC = response.evento.fecha;

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
        console.log('Response completo:', response);
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
                // Convertir a string sin importar si es UUID o número
                const id = p.id; //id_presenta
                return id !== null && id !== undefined ? String(id) : null;
              })
              .filter((id: string | null) => id !== null && id !== '' && id !== 'null' && id !== 'undefined')
            : [];

          console.log(presentanIds);
          
          // Extraer los id_comision del array turnocomision
          let comisionesIds: string[] = [];
          if (punto.turnocomision && Array.isArray(punto.turnocomision) && punto.turnocomision.length > 0) {
            comisionesIds = punto.turnocomision
              .map((tc: any) => tc.id_comision)
              .filter((id: any) => id !== null && id !== undefined);
          }

          // Determinar si se turna a comisión basado en si hay comisiones
          const seTurnaComision = comisionesIds.length > 0;
          
    
          const puntoMapeado = {
            ...punto,
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
              id_comision: [comisionesIds] 
            })
          };

          // Suscribirse a cambios en cada form de punto
          puntoMapeado.form.get('se_turna_comision')?.valueChanges.subscribe((value: boolean) => {
            const comisionControl = puntoMapeado.form.get('id_comision');
            if (value === true) {
              // Validar que el array tenga al menos 1 elemento
              comisionControl?.setValidators([Validators.required, Validators.minLength(1)]);
            } else {
              comisionControl?.clearValidators();
              comisionControl?.setValue([]); // Limpiar con array vacío
            }
            comisionControl?.updateValueAndValidity();
          });

          // Cargar tipos UNA SOLA VEZ con el array completo de proponentes
          if (proponentesIds.length > 0) {
            this.cargarTiposParaPunto(puntoMapeado, proponentesIds);
          } else {
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
        console.log('estos son los RESPONSE presneta: ', response);
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

        console.log('estos son los presneta: ', punto.presentaDisponibles);
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
        this._eventoService.deletePunto(punto.id).subscribe({
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
        destacada: false
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
  // ==================== FIN DEL MODAL ====================
  notificar(punto: any) {

  }


  getTipoP(id?: any): void {
    this.formPunto.get('tipo')?.setValue(null);
    this.formPunto.get('presenta')?.setValue(null);

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
    this.documentos['docPunto'] = null;
    this.formPunto.reset({
      se_turna_comision: false // <-- Resetear a false cuando se cierra
    });
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

    // formData.forEach((valor, clave) => {
    //   console.log(clave, valor);
    // });
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

        this.documentos['docPunto'] = null;
        this.formPunto.reset({
          se_turna_comision: false
        });
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

  private cargarDatosVotacion(): void {
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

  private cargarVotantes(punto: any): void {
    this.idpto = punto;
    this._eventoService.getIntegrantesVotosPunto(punto).subscribe({
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
      idpunto: this.agendaPunto,
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
        this.puntoSeleccionadoVotacion = null;

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
          idpunto: this.idpto,
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
    Swal.fire({
      position: 'center',
      icon: 'info',
      title: 'Generando reporte...',
      text: 'Se descargará el reporte de votación',
      showConfirmButton: false,
      timer: 2000
    });

    // Aquí va la lógica para imprimir/descargar
    setTimeout(() => {
      console.log('Imprimir votación del punto:', this.puntoSeleccionadoVotacion);
    }, 2000);
  }




  //este es opcional
  private cargarDatosResumen(): void {

  }



}