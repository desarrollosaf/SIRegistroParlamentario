import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';


interface Iniciativa {
  id: string;
  iniciativa: string;
  descripcion?: string;
  fecha_creacion?: string;
  proponente?: string;
  estatus?: string;
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




  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.cargarIniciativas();
  }

  cargarIniciativas(): void {
    this.cargando = true;
    this._eventoService.getIniciativasList().subscribe({
      next: (response: any) => {
        this.listaIniciativas = response.data || response.iniciativas || [];
        console.log('Iniciativas cargadas:', this.listaIniciativas);
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
        console.log('Respuesta del historial:', response);

        if (response.data && response.data.length > 0) {
          this.procesarTimeline(response.data[0]);
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

  procesarTimeline(data: any): void {
    this.timelineData = [];
    this.isCollapsed = {};
    // 1. NACIÓ (donde se presentó)
    if (data.nacio) {
      this.timelineData.push({
        fecha: data.nacio.fecha,
        titulo: '📝 Iniciativa Presentada',
        descripcion: data.nacio.descripcion_evento,
        tipo: 'nacio',
        numpunto: data.nacio.numpunto,
        punto: data.nacio.punto,
        tipo_evento: data.nacio.tipo_evento,
        turnado: data.nacio.turnado,
        comisiones_turnado: data.nacio.comisiones_turnado,
        evento: data.nacio.evento,
        liga: data.nacio.liga
      });
    }

    // 2. ESTUDIO (turnada a comisión)
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

    // 3. DICTAMEN (dictaminada)
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
          liga: item.liga
        });
      });
    }

    // 4. CIERRE (aprobada/rechazada)
    if (data.cierre) {
      this.timelineData.push({
        fecha: data.cierre.fecha,
        titulo: '⚖️ Resolución ',
        descripcion: data.cierre.descripcion_evento,
        tipo: 'cierre',
        numpunto: data.cierre.numpunto,
        punto: data.cierre.punto,
        tipo_evento: data.cierre.tipo_evento,
        evento: data.cierre.evento,
        liga: data.cierre.liga
      });
    }
    this.timelineData.forEach((_, index) => {
      this.isCollapsed[index] = true;
    });
    // console.log('Timeline procesado:', this.timelineData);
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

  getTipoColor(tipo: string): string {
    switch (tipo) {
      case 'nacio': return 'timeline-primary';
      case 'estudio': return 'timeline-info';
      case 'dictamen': return 'timeline-warning';
      case 'cierre': return 'timeline-success';
      default: return 'timeline-secondary';
    }
  }


  descargarAsistencia(item: TimelineItem, tipo: string): void {
    const key = `asistencia_${tipo}_${item.fecha}`;
    this.descargando[key] = true;
    console.log(item.evento);
    const evento = item.evento;
    this._eventoService.generarPDFVotacionPunto(item.evento!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${tipo}_${item.fecha}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargando[key] = false;
      },
      error: (e) => {
        console.error('Error al descargar asistencia:', e);
        this.descargando[key] = false;
      }
    });


  }

  descargarVotacion(item: TimelineItem, tipo: string): void {
    const key = `votacion_${tipo}_${item.fecha}`;
    this.descargando[key] = true;

    // this._eventoService.descargarVotacion(this.iniciativaSeleccionada!.id, tipo).subscribe({
    //   next: (blob: Blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `votacion_${tipo}_${item.fecha}.pdf`;
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     this.descargando[key] = false;
    //   },
    //   error: (e) => {
    //     console.error('Error al descargar votación:', e);
    //     this.descargando[key] = false;
    //   }
    // });
  }












}
