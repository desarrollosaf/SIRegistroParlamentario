import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoService } from '../../../service/evento.service';
import Swal from 'sweetalert2';

interface TotalesAsistencia {
  presencial: number;
  zoom: number;
  justificada: number;
  pendiente: number;
  sin_registro: number;
  total: number;
}

interface EventoAsistencia {
  id: string;
  fecha: string;
  fecha_display: string;
  descripcion: string;
  tipo_evento: string;
  asistencia: string;
  sentido_voto: number | null;
  es_evento_unido: boolean;
  otras_comisiones: string[];
}

interface ComisionAsistencia {
  id: string;
  nombre: string;
  abierta: boolean;
  eventos: EventoAsistencia[];
  totales: TotalesAsistencia;
}

@Component({
  selector: 'app-asistencia-diputado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-diputado.component.html',
  styleUrls: ['./asistencia-diputado.component.scss']
})
export class AsistenciaDiputadoComponent implements OnInit {

  listaDiputados: any[] = [];
  diputadoSeleccionado: any | null = null;

  cargandoDiputados = false;
  cargandoDatos = false;
  generandoExcel = false;

  diputadoActual: { id: string; nombre: string } | null = null;
  comisiones: ComisionAsistencia[] = [];

  totalesGlobales: TotalesAsistencia = {
    presencial: 0, zoom: 0, justificada: 0, pendiente: 0, sin_registro: 0, total: 0
  };

  constructor(private _eventoService: EventoService) {}

  ngOnInit(): void {
    this.cargarDiputados();
  }

  cargarDiputados(): void {
    this.cargandoDiputados = true;
    this._eventoService.getDiputadosAsistencia().subscribe({
      next: (res: any) => {
        this.listaDiputados = res.data || [];
        this.cargandoDiputados = false;
      },
      error: () => { this.cargandoDiputados = false; }
    });
  }

  onDiputadoChange(): void {
    if (!this.diputadoSeleccionado) {
      this.diputadoActual = null;
      this.comisiones = [];
      return;
    }
    this.cargandoDatos = true;
    this.comisiones = [];
    this.diputadoActual = null;

    this._eventoService.getDatosAsistenciaDiputado({ diputado_id: this.diputadoSeleccionado.id }).subscribe({
      next: (res: any) => {
        this.diputadoActual = res.diputado;
        this.comisiones = (res.comisiones || []).map((c: any, i: number) => ({
          ...c,
          abierta: i === 0
        }));
        this.calcularTotalesGlobales();
        this.cargandoDatos = false;
      },
      error: () => {
        this.cargandoDatos = false;
        Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No se encontraron eventos o comisiones para este diputado.', confirmButtonColor: '#800048', confirmButtonText: 'Aceptar' });
      }
    });
  }

  calcularTotalesGlobales(): void {
    this.totalesGlobales = { presencial: 0, zoom: 0, justificada: 0, pendiente: 0, sin_registro: 0, total: 0 };
    for (const c of this.comisiones) {
      this.totalesGlobales.presencial   += c.totales.presencial;
      this.totalesGlobales.zoom         += c.totales.zoom;
      this.totalesGlobales.justificada  += c.totales.justificada;
      this.totalesGlobales.pendiente    += c.totales.pendiente;
      this.totalesGlobales.sin_registro += c.totales.sin_registro;
      this.totalesGlobales.total        += c.totales.total;
    }
  }

  toggleComision(comision: ComisionAsistencia): void {
    comision.abierta = !comision.abierta;
  }

  abrirTodas(): void {
    this.comisiones.forEach(c => c.abierta = true);
  }

  cerrarTodas(): void {
    this.comisiones.forEach(c => c.abierta = false);
  }

  descargarExcel(): void {
    if (!this.diputadoSeleccionado) return;
    this.generandoExcel = true;
    const dip = this.diputadoSeleccionado;
    this._eventoService.generarReporteAsistenciaDiputado({ diputado_id: dip.id }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${dip.apaterno}_${dip.nombres}.xlsx`.replace(/\s+/g, '_');
        a.click();
        window.URL.revokeObjectURL(url);
        this.generandoExcel = false;
      },
      error: () => {
        this.generandoExcel = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el archivo Excel.', confirmButtonColor: '#800048' });
      }
    });
  }

  claseAsistencia(sentido: number | null): string {
    switch (sentido) {
      case 1:  return 'badge-presencial';
      case 2:  return 'badge-zoom';
      case 3:  return 'badge-justificada';
      case 0:  return 'badge-pendiente';
      default: return 'badge-sin-registro';
    }
  }

  iconoAsistencia(sentido: number | null): string {
    switch (sentido) {
      case 1:  return 'bi-check-circle-fill';
      case 2:  return 'bi-camera-video-fill';
      case 3:  return 'bi-patch-check-fill';
      case 0:  return 'bi-clock-fill';
      default: return 'bi-dash-circle';
    }
  }

  porcentaje(valor: number, total: number): number {
    return total === 0 ? 0 : Math.round((valor / total) * 100);
  }
}
