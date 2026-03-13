import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Iniciativa {
  id: string;
  iniciativa: string;
  descripcion?: string;
  fecha_creacion?: string;
  proponente?: string;
  estatus?: string;
  presentaString?: string;
  proponentesString?: string;
}

interface TimelineItem {
  fecha: string;
  titulo: string;
  evento?: string;
  descripcion: string;
  tipo: 'nacio' | 'estudio' | 'dictamen' | 'cierre';
  numpunto?: number;
  punto?: string;
  comisiones?: string;
  tipo_evento?: string;
  turnado?: boolean;
  comisiones_turnado?: string;
  liga?: string;
  votacionid?: string;
  dispensa?: boolean;
}

interface GrupoParlamentario {
  id: string;
  siglas: string;
}

interface Diputado {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-iniciativas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './iniciativas.component.html',
  styleUrl: './iniciativas.component.scss'
})
export class IniciativasComponent implements OnInit {
  private _eventoService = inject(EventoService);

  cargando: boolean = false;
  listaIniciativas: Iniciativa[] = [];
  iniciativaSeleccionada: Iniciativa | null = null;
  timelineData: TimelineItem[] = [];
  isCollapsed: { [key: number]: boolean } = {};
  descargando: { [key: string]: boolean } = {};
  descargandoReporte: boolean = false;

  // Dropdown exportar
  exportMenuOpen: boolean = false;

  // Modal con filtros (pendiente de nombre definitivo)
  modalFiltrosOpen: boolean = false;
  listaGrupos: GrupoParlamentario[] = [];
  listaDiputados: Diputado[] = [];
  grupoSeleccionado: GrupoParlamentario | null = null;
  diputadoSeleccionado: Diputado | null = null;
  cargandoModal: boolean = false;
  generandoReporte: boolean = false;

  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarIniciativas();
  }

  // ─── Iniciativas ────────────────────────────────────────────────────────────

  cargarIniciativas(): void {
    this.cargando = true;
    this._eventoService.getIniciativasList().subscribe({
      next: (response: any) => {
        this.listaIniciativas = response.data || response.iniciativas || [];
        this.cargando = false;
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar iniciativas:', e);
        this.cargando = false;
      }
    });
  }

  onIniciativaChange(iniciativa: Iniciativa): void {
    if (!iniciativa) {
      this.timelineData = [];
      this.iniciativaSeleccionada = null;
      return;
    }
    this.iniciativaSeleccionada = iniciativa;
    this.cargarTimelineIniciativa(iniciativa.id);
  }

  cargarTimelineIniciativa(idIniciativa: string): void {
    this.cargando = true;
    this.timelineData = [];
    this._eventoService.getInfinIciativa(idIniciativa).subscribe({
      next: (response: any) => {
        console.log('cargarTimelineIniciativa', response);
        if (response.data && response.data.length > 0) {
          this.procesarTimeline(response.data[0], response);
        } else {
          this.timelineData = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar timeline:', e);
        this.cargando = false;
        this.timelineData = [];
      }
    });
  }

  procesarTimeline(data: any, data1: any): void {
    this.timelineData = [];
    this.isCollapsed = {};

    if (this.iniciativaSeleccionada) {
      this.iniciativaSeleccionada.presentaString = data1.presentaString || '';
      this.iniciativaSeleccionada.proponentesString = data1.proponentesString || '';
    }

    if (data.nacio) {
      this.timelineData.push({
        fecha: data.nacio.fecha,
        titulo: '📝 Iniciativa Presentada',
        descripcion: data.nacio.descripcion_evento,
        tipo: 'nacio',
        dispensa: data.nacio.dispensa,
        numpunto: data.nacio.numpunto,
        punto: data.nacio.punto,
        tipo_evento: data.nacio.tipo_evento,
        turnado: data.nacio.turnado,
        comisiones_turnado: data.nacio.comisiones_turnado,
        evento: data.nacio.evento,
        liga: data.nacio.liga,
        votacionid: data.nacio.votacionid
      });
    }

    if (data.estudio && Array.isArray(data.estudio)) {
      data.estudio.forEach((item: any) => {
        this.timelineData.push({
          fecha: item.fecha_evento,
          titulo: '🔍 En Estudio',
          descripcion: item.descripcion_evento,
          tipo: 'estudio',
          numpunto: item.numpunto,
          punto: item.punto,
          comisiones: item.comisiones,
          tipo_evento: item.tipo_evento,
          evento: item.evento,
          liga: item.liga
        });
      });
    }

    if (data.dictamen && Array.isArray(data.dictamen)) {
      data.dictamen.forEach((item: any) => {
        this.timelineData.push({
          fecha: item.fecha_evento,
          titulo: '📋 Dictamen Emitido',
          descripcion: item.descripcion_evento,
          tipo: 'dictamen',
          numpunto: item.numpunto,
          punto: item.punto,
          comisiones: item.comisiones,
          tipo_evento: item.tipo_evento,
          evento: item.evento,
          liga: item.liga,
          votacionid: item.votacionid
        });
      });
    }

    if (data.cierre) {
      this.timelineData.push({
        fecha: data.cierre.fecha,
        titulo: '⚖️ Resolución',
        descripcion: data.cierre.descripcion_evento,
        tipo: 'cierre',
        numpunto: data.cierre.numpunto,
        punto: data.cierre.punto,
        tipo_evento: data.cierre.tipo_evento,
        evento: data.cierre.evento,
        liga: data.cierre.liga,
        votacionid: data.cierre.votacionid
      });
    }

    this.timelineData.forEach((_, index) => {
      this.isCollapsed[index] = true;
    });
  }

  toggleCollapse(index: number): void {
    this.isCollapsed[index] = !this.isCollapsed[index];
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'nacio': return 'bi-plus-circle-fill';
      case 'estudio': return 'bi-search';
      case 'dictamen': return 'bi-file-earmark-text-fill';
      case 'cierre': return 'bi-check-circle-fill';
      default: return 'bi-circle-fill';
    }
  }

  getTipoColor(item: TimelineItem): string {
    if (item.tipo === 'nacio') {
      return item.dispensa ? 'timeline-success' : 'timeline-primary';
    }
    switch (item.tipo) {
      case 'estudio': return 'timeline-info';
      case 'dictamen': return 'timeline-warning';
      case 'cierre': return 'timeline-success';
      default: return 'timeline-secondary';
    }
  }

  // ─── Dropdown Exportar ───────────────────────────────────────────────────────

  toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  closeExportMenu(): void {
    this.exportMenuOpen = false;
  }

  // ─── Reportes directos (sin modal) ──────────────────────────────────────────

  descargarReporte(tipo: 'general' | 'estudio' | 'aprobadas' | 'grupo-diputado' | 'totales-periodo'): void {
    this.closeExportMenu();
    this.descargandoReporte = true;

    const request$ = (() => {
      switch (tipo) {
        case 'general': return this._eventoService.generarReporteIniciativas();
        case 'estudio': return this._eventoService.generarReporteEnEstudio();
        case 'aprobadas': return this._eventoService.generarReporteAprobadas();
        case 'grupo-diputado': return this._eventoService.generarReporteGrupoDiputado();
        case 'totales-periodo': return this._eventoService.generarReporteTotalesPeriodo();
      }
    })();

    request$.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iniciativas_${tipo}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargandoReporte = false;
      },
      error: (e: HttpErrorResponse) => {
        this.descargandoReporte = false;
        this.mostrarErrorDescarga(e);
      }
    });
  }

  // ─── Modal con filtros (pendiente de nombre) ────────────────────────────────

  abrirModalFiltros(): void {
    this.closeExportMenu();
    this.grupoSeleccionado = null;
    this.diputadoSeleccionado = null;
    this.cargarGruposYDiputados();
    this.modalFiltrosOpen = true;
  }

  cerrarModalFiltros(): void {
    this.modalFiltrosOpen = false;
    this.grupoSeleccionado = null;
    this.diputadoSeleccionado = null;
  }

  cargarGruposYDiputados(): void {
    this.cargandoModal = true;
    this._eventoService.getCatalogos().subscribe({
      next: (response: any) => {
        this.listaGrupos = [
          { id: '0', siglas: 'Todos los grupos' },
          ...response.partidos
        ];
        this.listaDiputados = [
          { id: '0', nombre: 'Todos los diputados' },
          ...response.diputados
        ];
        this.cargandoModal = false;
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error del servidor:', e.error?.msg);
      }
    });
  }


  get tieneSeleccion(): boolean {
    return !!this.grupoSeleccionado || !!this.diputadoSeleccionado;
  }

  onGrupoChange(grupo: any): void {
    if (grupo) this.diputadoSeleccionado = null;
  }

  onDiputadoChange(diputado: any): void {
    if (diputado) this.grupoSeleccionado = null;
  }

  generarReporteFiltros(): void {
    if (!this.grupoSeleccionado && !this.diputadoSeleccionado) {
      Swal.fire({
        icon: 'warning', title: 'Selección requerida',
        text: 'Debes seleccionar un grupo parlamentario o un diputado.',
        confirmButtonText: 'Aceptar', confirmButtonColor: '#800048'
      });
      return;
    }

    this.generandoReporte = true;

    const data = this.grupoSeleccionado
      ? { id_tipo: 1, id: this.grupoSeleccionado.id }
      : { id_tipo: 2, id: this.diputadoSeleccionado!.id };

    this._eventoService.generarReporteIntegrantes(data).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `_integrantes.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.generandoReporte = false;
        this.cerrarModalFiltros();
      },
      error: (e: HttpErrorResponse) => {
        this.generandoReporte = false;
        this.mostrarErrorDescarga(e);
      }
    });
  }

  // ─── Descargas de sesión ─────────────────────────────────────────────────────

  descargarAsistencia(item: TimelineItem, tipo: string): void {
    const key = `asistencia_${tipo}_${item.fecha}`;
    this.descargando[key] = true;

    this._eventoService.generarPDFAsistenciaPunto(item.evento!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${tipo}_${item.fecha}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargando[key] = false;
      },
      error: (e: HttpErrorResponse) => {
        this.descargando[key] = false;
        if (e.status === 404) {
          Swal.fire({ icon: 'info', title: 'Sin registros', text: 'No se encontraron registros de asistencia para esta sesión.', confirmButtonText: 'Aceptar', confirmButtonColor: '#800048' });
        } else {
          this.mostrarErrorDescarga(e);
        }
      }
    });
  }

  descargarVotacion(item: TimelineItem, tipo: string): void {
    const key = `votacion_${tipo}_${item.fecha}`;
    this.descargando[key] = true;

    this._eventoService.generarPDFVotacion(item.votacionid!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `votacion_${tipo}_${item.fecha}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargando[key] = false;
      },
      error: (e: HttpErrorResponse) => {
        this.descargando[key] = false;
        if (e.status === 404) {
          Swal.fire({ icon: 'info', title: 'Sin registros', text: 'No se encontraron registros de votación para esta sesión.', confirmButtonText: 'Aceptar', confirmButtonColor: '#800048' });
        } else {
          this.mostrarErrorDescarga(e);
        }
      }
    });
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────

  private mostrarErrorDescarga(e: HttpErrorResponse): void {
    console.error('Error al descargar:', e);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al descargar el archivo. Intenta de nuevo.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#800048',
    });
  }
}