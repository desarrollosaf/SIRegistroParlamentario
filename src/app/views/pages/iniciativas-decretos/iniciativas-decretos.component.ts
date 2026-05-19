import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { enviroment } from '../../../../enviroments/enviroment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// AG Grid
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClassParams,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from 'ag-grid-community';

// Registrar módulos de AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

export interface Iniciativa {
  id: string;
  no: number;
  iniciativa: string;
  tipo: number | string | null;   // viene como 1, 2 o 3 del backend
  presentac: string;
  observac: string;
  materia: string;
  expedicion: string;
  periodo: string;
  comisiones: string;
  fecha_evento_raw: string;
  publico: number;
}

// Catálogo central de tipos — un solo lugar para cambiar etiquetas/colores
export const TIPO_MAP: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: 'Iniciativa',        bg: '#dbeafe', color: '#1d4ed8' },
  2: { label: 'Punto de acuerdo',  bg: '#d1fae5', color: '#065f46' },
  3: { label: 'Minuta',            bg: '#fef3c7', color: '#92400e' },
};

export interface ArchivoExistente {
  id: number;
  nombre_decreto: string;
  decreto: string;       // ruta relativa: "storage/agendas/archivo.pdf"
  id_iniciativa: string;
}

export interface EditPresentante {
  id_tipo_presenta: number | null;
  tipo_nombre: string;
  id_presenta: string | null;
  presenta_nombre?: string;
}

@Component({
  selector: 'app-iniciativas-decretos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterLink,
    AgGridAngular,
  ],
  templateUrl: './iniciativas-decretos.component.html',
  styleUrl: './iniciativas-decretos.component.scss',
})
export class IniciativasDecretosComponent implements OnInit, OnDestroy {
  private _eventoService = inject(EventoService);
  private destroy$ = new Subject<void>();

  enviro = enviroment.endpoint;
  cargando = false;

  // --- Datos ---
  listaIniciativas: Iniciativa[] = [];
  rowData: Iniciativa[] = [];

  // --- Búsqueda y filtros ---
  searchText = '';
  activeFilter: number | '' = '';

  // Expuesto al template
  readonly tipoMap = TIPO_MAP;
  readonly tiposDisponibles = [1, 2, 3] as const;

  // --- Modal carga ---
  modalVisible = false;
  iniciativaSeleccionada: Iniciativa | null = null;
  descripcionInput = '';
  archivoSeleccionado: File | null = null;

  // Archivos consultados del backend (lazy por id)
  archivosExistentes: ArchivoExistente[] = [];
  cargandoArchivos = false;

  // Archivos nuevos subidos en esta sesión (antes de guardar en backend)
  archivosNuevos: { descripcion: string; archivo: File; urlPreview: string }[] = [];

  // --- Modal edición ---
  editModalVisible = false;
  editCargando = false;
  editGuardando = false;
  editIniciativaId: string | null = null;
  editIniciativaNombre = '';
  editSeTurna = false;
  editTurnoComisionIds: string[] = [];
  editPresentantes: EditPresentante[] = [];
  editCatalogos: { proponentes: any[]; diputados: any[]; partidos: any[]; comisiones: any[]; municipios: any[]; legislaturas: any[]; secretarias: any[]; catfundep: Record<string, any[]> } = {
    proponentes: [], diputados: [], partidos: [], comisiones: [], municipios: [], legislaturas: [], secretarias: [], catfundep: {}
  };

  // --- AG Grid ---
  private gridApi!: GridApi<Iniciativa>;

  theme = themeQuartz;

  columnDefs: ColDef<Iniciativa>[] = [
    {
      field: 'no',
      headerName: 'No.',
      width: 70,
      sortable: true,
      pinned: 'left',
      cellStyle: { color: '#64748b', fontWeight: '500' },
    },
    {
      field: 'iniciativa',
      headerName: 'Iniciativa',
      flex: 3,
      sortable: true,
      filter: false,
      wrapText: true,
      autoHeight: true,
      cellStyle: { lineHeight: '1.5', paddingTop: '10px', paddingBottom: '10px' },
      tooltipField: 'iniciativa',
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 170,
      sortable: true,
      cellRenderer: (params: any) => {
        const entry = TIPO_MAP[params.value as number];
        const label = entry?.label ?? 'Sin tipo';
        const bg    = entry?.bg    ?? '#f1f5f9';
        const color = entry?.color ?? '#64748b';
        return `<span style="
          display:inline-block;padding:3px 10px;border-radius:20px;
          font-size:11px;font-weight:600;background:${bg};color:${color};white-space:nowrap;
        ">${label}</span>`;
      },
    },
    {
      field: 'presentac',
      headerName: 'Presentación',
      width: 130,
      sortable: true,
      cellStyle: { color: '#64748b' },
    },
    {
      field: 'observac',
      headerName: 'Observación',
      width: 140,
      sortable: true,
      cellRenderer: (params: any) => {
        const val = params.value || '—';
        const isAprobada = val.toLowerCase().includes('aprobad');
        const color = isAprobada ? '#059669' : '#64748b';
        return `<span style="color:${color};font-weight:${isAprobada ? '600' : '400'}">${val}</span>`;
      },
    },
    {
      headerName: 'Acción',
      width: 370,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '0 6px' },
      cellRenderer: (params: any) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;gap:5px;align-items:center;width:100%;';

        const btnStyle = (border: string, bg: string, color: string) =>
          `padding:5px 8px;border-radius:6px;border:1px solid ${border};background:${bg};color:${color};font-size:11px;cursor:pointer;white-space:nowrap;font-weight:500;flex:1;`;

        // Botón Editar
        const btnEditar = document.createElement('button');
        btnEditar.innerText = '✏ Editar';
        btnEditar.style.cssText = btnStyle('#fde68a', '#fefce8', '#a16207');
        btnEditar.addEventListener('mouseenter', () => { btnEditar.style.background = '#fef9c3'; });
        btnEditar.addEventListener('mouseleave', () => { btnEditar.style.background = '#fefce8'; });
        btnEditar.addEventListener('click', () => {
          this.abrirModalEditar(params.data);
          this.cdr.detectChanges();
        });

        // Botón Cargar
        const btnCargar = document.createElement('button');
        btnCargar.innerText = '+ Cargar';
        btnCargar.style.cssText = btnStyle('#bfdbfe', '#eff6ff', '#1d4ed8');
        btnCargar.addEventListener('mouseenter', () => { btnCargar.style.background = '#dbeafe'; });
        btnCargar.addEventListener('mouseleave', () => { btnCargar.style.background = '#eff6ff'; });
        btnCargar.addEventListener('click', () => {
          this.abrirModal(params.data);
          this.cdr.detectChanges();
        });

        // Botón Votación
        const btnVotacion = document.createElement('button');
        btnVotacion.innerText = '🗳 Voto';
        btnVotacion.style.cssText = btnStyle('#c4b5fd', '#f5f3ff', '#6d28d9');
        btnVotacion.addEventListener('mouseenter', () => { btnVotacion.style.background = '#ede9fe'; });
        btnVotacion.addEventListener('mouseleave', () => { btnVotacion.style.background = '#f5f3ff'; });
        btnVotacion.addEventListener('click', () => {
          this.abrirVotacion(params.data);
          this.cdr.detectChanges();
        });

        // Botón Publicar/Despublicar
        const esPublico = params.data.publico === 1;
        const btnPublico = document.createElement('button');
        btnPublico.innerText = esPublico ? '👁 Público' : '🚫 Priv.';
        btnPublico.style.cssText = btnStyle(
          esPublico ? '#bbf7d0' : '#fecaca',
          esPublico ? '#f0fdf4' : '#fff1f2',
          esPublico ? '#15803d' : '#dc2626'
        );
        btnPublico.addEventListener('mouseenter', () => {
          btnPublico.style.background = esPublico ? '#dcfce7' : '#ffe4e6';
        });
        btnPublico.addEventListener('mouseleave', () => {
          btnPublico.style.background = esPublico ? '#f0fdf4' : '#fff1f2';
        });
        btnPublico.addEventListener('click', () => {
          this.togglePublico(params.data);
          this.cdr.detectChanges();
        });

        wrapper.appendChild(btnEditar);
        wrapper.appendChild(btnCargar);
        wrapper.appendChild(btnPublico);
        wrapper.appendChild(btnVotacion);
        return wrapper;
      },
    },
  ];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: false,
  };

  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarIniciativas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Grid ───────────────────────────────────────────────────────────────────

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  // ─── Datos ──────────────────────────────────────────────────────────────────

  cargarIniciativas(): void {
    this.cargando = true;
    this._eventoService
      .getIniciativasDecretos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.listaIniciativas = response.data || response.iniciativas || response || [];
          console.log(response)
          this.aplicarFiltros();
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: (e: HttpErrorResponse) => {
          console.error('Error al cargar iniciativas:', e);
          this.cargando = false;
          Swal.fire('Error', 'No se pudieron cargar las iniciativas.', 'error');
        },
      });
  }

  // ─── Búsqueda y filtros ──────────────────────────────────────────────────────

  aplicarFiltros(): void {
    const q = this.searchText.toLowerCase().trim();
    this.rowData = this.listaIniciativas.filter((item) => {
      const tipoNum = Number(item.tipo);

      const matchTipo = this.activeFilter === '' || tipoNum === this.activeFilter;

      const tipoLabel = (TIPO_MAP[tipoNum]?.label ?? '').toLowerCase();
      const matchSearch =
        !q ||
        item.iniciativa?.toLowerCase().includes(q) ||
        item.observac?.toLowerCase().includes(q) ||
        tipoLabel.includes(q) ||
        item.presentac?.toLowerCase().includes(q);

      return matchTipo && matchSearch;
    });
  }

  setFiltro(tipo: number): void {
    this.activeFilter = this.activeFilter === tipo ? '' : tipo;
    this.aplicarFiltros();
  }

  limpiarFiltro(): void {
    this.activeFilter = '';
    this.aplicarFiltros();
  }

  onSearch(): void {
    this.aplicarFiltros();
  }

  // ─── Modal ───────────────────────────────────────────────────────────────────

  abrirModal(iniciativa: Iniciativa): void {
    this.iniciativaSeleccionada = iniciativa;
    this.limpiarForm();
    this.archivosNuevos = [];
    this.archivosExistentes = [];
    this.modalVisible = true;
    this.cargarArchivosExistentes(iniciativa.id);
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    // Liberar URLs temporales de preview para evitar memory leaks
    this.archivosNuevos.forEach(a => URL.revokeObjectURL(a.urlPreview));
    this.archivosNuevos = [];
    this.modalVisible = false;
    this.iniciativaSeleccionada = null;
    this.cdr.detectChanges();
  }

  limpiarForm(): void {
    this.descripcionInput = '';
    this.archivoSeleccionado = null;
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Carga lazy: solo se llama al abrir el modal
  cargarArchivosExistentes(id: string): void {
    this.cargandoArchivos = true;
    this._eventoService.getArchivosByIniciativa(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Acepta array directo, o envuelto en .data / .decretos
          const lista = response.data ?? response.decretos ?? response;
          this.archivosExistentes = Array.isArray(lista) ? lista : [lista];
          this.cargandoArchivos = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargandoArchivos = false;
          this.cdr.detectChanges();
        }
      });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoSeleccionado = input.files[0];
      this.cdr.detectChanges();
    }
  }

  guardarArchivo(): void {
    if (!this.descripcionInput.trim()) {
      Swal.fire('Atención', 'Por favor ingresa una descripción.', 'warning');
      return;
    }
    if (!this.archivoSeleccionado) {
      Swal.fire('Atención', 'Por favor selecciona un archivo.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('nombre_decreto', this.descripcionInput.trim());
    formData.append('path_doc',       this.archivoSeleccionado);
    formData.append('id_iniciativa',  this.iniciativaSeleccionada!.id);

    this._eventoService.subirArchivoIniciativa(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Preview local inmediato sin recargar la lista
          const urlPreview = URL.createObjectURL(this.archivoSeleccionado!);
          this.archivosNuevos.push({
            descripcion: this.descripcionInput.trim(),
            archivo:     this.archivoSeleccionado!,
            urlPreview,
          });

          this.limpiarForm();
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Archivo guardado',
            text: 'Puedes agregar otro o cerrar el modal.',
            timer: 1800,
            showConfirmButton: false,
          });
        },
        error: (e: HttpErrorResponse) => {
          console.error('Error al subir archivo:', e);
          Swal.fire('Error', 'No se pudo guardar el archivo, intenta de nuevo.', 'error');
        }
      });
  }

  verArchivo(url: string): void {
    window.open(url, '_blank');
  }

  eliminarArchivoNuevo(index: number): void {
    URL.revokeObjectURL(this.archivosNuevos[index].urlPreview);
    this.archivosNuevos.splice(index, 1);
    this.cdr.detectChanges();
  }

  eliminarArchivoExistente(index: number): void {
    const archivo = this.archivosExistentes[index];

    Swal.fire({
      title: '¿Eliminar archivo?',
      text: archivo.nombre_decreto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this._eventoService.eliminarArchivoIniciativa(String(archivo.id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.archivosExistentes.splice(index, 1);
            this.cdr.detectChanges();
            Swal.fire({
              icon: 'success',
              title: 'Archivo eliminado',
              timer: 1400,
              showConfirmButton: false,
            });
          },
          error: (e: HttpErrorResponse) => {
            console.error('Error al eliminar archivo:', e);
            Swal.fire('Error', 'No se pudo eliminar el archivo.', 'error');
          }
        });
    });
  }

  togglePublico(iniciativa: Iniciativa): void {
    const nuevoValor = iniciativa.publico === 1 ? 0 : 1;
    
    Swal.fire({
      title: nuevoValor === 1 ? '¿Publicar iniciativa?' : '¿Despublicar iniciativa?',
      text: iniciativa.iniciativa.substring(0, 80) + '...',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: nuevoValor === 1 ? 'Sí, publicar' : 'Sí, despublicar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: nuevoValor === 1 ? '#059669' : '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this._eventoService.togglePublicoIniciativa(iniciativa.id, nuevoValor)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Actualizar localmente sin recargar todo
            const item = this.listaIniciativas.find(i => i.id === iniciativa.id);
            if (item) (item as any).publico = nuevoValor;
            this.aplicarFiltros();
            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: nuevoValor === 1 ? 'Iniciativa publicada' : 'Iniciativa despublicada',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (e: HttpErrorResponse) => {
            console.error('Error al actualizar:', e);
            Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
          }
        });
    });
  }


  // ─── Modal edición ───────────────────────────────────────────────────────────

  abrirModalEditar(iniciativa: Iniciativa): void {
    this.editIniciativaId = iniciativa.id;
    this.editIniciativaNombre = iniciativa.iniciativa;
    this.editModalVisible = true;
    this.editCargando = true;
    this.editPresentantes = [];
    this.editTurnoComisionIds = [];
    this.editSeTurna = false;
    this.editCatalogos = { proponentes: [], diputados: [], partidos: [], comisiones: [], municipios: [], legislaturas: [], secretarias: [], catfundep: {} };
    this.cdr.detectChanges();

    this._eventoService.getEdicionIniciativa(iniciativa.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.editCatalogos = data.catalogos ?? { proponentes: [], diputados: [], partidos: [], comisiones: [], municipios: [], legislaturas: [], secretarias: [], catfundep: {} };
          this.editPresentantes = (data.presentantes ?? []).map((p: any) => ({
            id_tipo_presenta: p.id_tipo_presenta,
            tipo_nombre: p.tipo_nombre,
            id_presenta: p.id_presenta,
            presenta_nombre: p.presenta_nombre
          }));
          this.editSeTurna = !!data.seTurna;
          this.editTurnoComisionIds = (data.turnoComisiones ?? []).map((c: any) => c.id);
          this.editCargando = false;
          this.cdr.detectChanges();
        },
        error: (e: HttpErrorResponse) => {
          console.error('Error al cargar edición:', e);
          this.editCargando = false;
          Swal.fire('Error', 'No se pudo cargar la información.', 'error');
          this.cerrarModalEditar();
        }
      });
  }

  cerrarModalEditar(): void {
    this.editModalVisible = false;
    this.editIniciativaId = null;
    this.editPresentantes = [];
    this.editTurnoComisionIds = [];
    this.cdr.detectChanges();
  }

  guardarEdicion(): void {
    this.editGuardando = true;
    const body = {
      presentantes: this.editPresentantes.map(p => ({
        id_tipo_presenta: p.id_tipo_presenta,
        id_presenta: p.id_presenta
      })),
      seTurna: this.editSeTurna,
      turnoComisionIds: this.editSeTurna ? this.editTurnoComisionIds : []
    };
    this._eventoService.updateEdicionIniciativa(this.editIniciativaId!, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editGuardando = false;
          Swal.fire({ icon: 'success', title: 'Cambios guardados', timer: 1600, showConfirmButton: false });
          this.cerrarModalEditar();
        },
        error: (e: HttpErrorResponse) => {
          this.editGuardando = false;
          console.error('Error al guardar edición:', e);
          Swal.fire('Error', 'No se pudo guardar los cambios.', 'error');
        }
      });
  }

  agregarPresentante(): void {
    this.editPresentantes = [...this.editPresentantes, { id_tipo_presenta: null, tipo_nombre: '', id_presenta: null }];
    this.cdr.detectChanges();
  }

  eliminarPresentante(i: number): void {
    this.editPresentantes = this.editPresentantes.filter((_, idx) => idx !== i);
    this.cdr.detectChanges();
  }

  onTipoPresentaChange(i: number): void {
    const selectedId = this.editPresentantes[i].id_tipo_presenta;
    const proponente = this.editCatalogos.proponentes.find((p: any) => p.id === selectedId);
    this.editPresentantes[i].tipo_nombre = proponente?.valor ?? '';
    this.editPresentantes[i].id_presenta = null;
    this.cdr.detectChanges();
  }

  getEntidadesPorTipo(tipoNombre: string, proponenteId: number | null): any[] {
    switch (tipoNombre) {
      case 'Diputadas y Diputados': return this.editCatalogos.diputados;
      case 'Grupo Parlamentario':   return this.editCatalogos.partidos;
      case 'Comisiones Legislativas':
      case 'Mesa Directiva en turno':
      case 'Junta de Coordinación Politica':
      case 'Diputación Permanente': return this.editCatalogos.comisiones;
      case 'Ayuntamientos':
      case 'Municipios':
      case 'AYTO':                  return this.editCatalogos.municipios;
      case 'Legislatura':           return this.editCatalogos.legislaturas;
      case 'Secretarías del GEM':   return this.editCatalogos.secretarias;
      default:
        return proponenteId != null
          ? (this.editCatalogos.catfundep[String(proponenteId)] ?? [])
          : [];
    }
  }

abrirVotacion(iniciativa: Iniciativa): void {
  console.log(iniciativa);
  const urlActual = window.location.href.split('?')[0];
  const base = urlActual.endsWith('/') ? urlActual : urlActual + '/';
  window.open(`${base}votacion/${iniciativa.id}`, '_blank');
}
  // ─── Helpers ─────────────────────────────────────────────────────────────────

  get totalMostrados(): number {
    return this.rowData.length;
  }

  get totalRegistros(): number {
    return this.listaIniciativas.length;
  }
}