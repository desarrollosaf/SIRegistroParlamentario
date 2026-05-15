import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EventoService } from '../../../service/evento.service';

interface EstadisticasIniciativas {
  total: number;
  porTipo: { tipo: string; total: number }[];
  porEstatus: { estatus: string; total: number }[];
  porGenero: { genero: string; total: number }[];
  porGrupo: { nombre: string; total: number }[];
  porMes: { mes: string; total: number }[];
  porProponente: { tipo: string; total: number }[];
  porComision: { nombre: string; total: number }[];
}

@Component({
  selector: 'app-reporte-iniciativas',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './reporte-iniciativas.component.html',
  styleUrls: ['./reporte-iniciativas.component.scss']
})
export class ReporteIniciativasComponent implements OnInit {
  cargando = true;
  datos: EstadisticasIniciativas | null = null;

  generoChart: any = {};
  estatusChart: any = {};
  tipoChart: any = {};
  tendenciaChart: any = {};
  grupoChart: any = {};
  comisionChart: any = {};
  proponenteChart: any = {};

  constructor(private _eventoService: EventoService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this._eventoService.getEstadisticasIniciativas().subscribe({
      next: (res: EstadisticasIniciativas) => {
        this.datos = res;
        this.construirGraficas();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  private construirGraficas(): void {
    if (!this.datos) return;
    this.buildGenero();
    this.buildEstatus();
    this.buildTipo();
    this.buildTendencia();
    this.buildGrupo();
    this.buildComision();
    this.buildProponente();
  }

  private buildGenero(): void {
    const d = this.datos!;
    const orden = ['Mujeres', 'Hombres', 'Institucional'];
    const sorted = orden
      .map(g => d.porGenero.find(x => x.genero === g))
      .filter(Boolean) as { genero: string; total: number }[];
    const otros = d.porGenero.filter(x => !orden.includes(x.genero));
    const all = [...sorted, ...otros];

    this.generoChart = {
      series: all.map(g => g.total),
      chart: { type: 'donut', height: 290, fontFamily: 'inherit' },
      labels: all.map(g => g.genero),
      colors: ['#ec4899', '#3b82f6', '#94a3b8'],
      legend: { position: 'bottom', fontSize: '13px' },
      plotOptions: { pie: { donut: { size: '68%', labels: {
        show: true,
        total: { show: true, label: 'Total', color: '#374151', fontSize: '13px', fontWeight: 700,
          formatter: () => String(d.total) }
      } } } },
      dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: '12px', fontWeight: 600 }, dropShadow: { enabled: false } },
      stroke: { width: 0 },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } },
      responsive: [{ breakpoint: 480, options: { chart: { height: 250 } } }]
    };
  }

  private buildEstatus(): void {
    const d = this.datos!;
    const orden = ['Aprobada', 'En estudio', 'Rechazada en sesión', 'Rechazada en comisión', 'Precluida', 'Pendiente'];
    const sorted = orden
      .map(e => d.porEstatus.find(x => x.estatus === e))
      .filter(Boolean) as { estatus: string; total: number }[];
    const otros = d.porEstatus.filter(x => !orden.includes(x.estatus));
    const all = [...sorted, ...otros];

    this.estatusChart = {
      series: all.map(e => e.total),
      chart: { type: 'donut', height: 290, fontFamily: 'inherit' },
      labels: all.map(e => e.estatus),
      colors: ['#10b981', '#f59e0b', '#ef4444', '#b91c1c', '#8b5cf6', '#94a3b8'],
      legend: { position: 'bottom', fontSize: '12px' },
      plotOptions: { pie: { donut: { size: '68%', labels: {
        show: true,
        total: { show: true, label: 'Total', color: '#374151', fontSize: '13px', fontWeight: 700,
          formatter: () => String(d.total) }
      } } } },
      dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: '11px', fontWeight: 600 }, dropShadow: { enabled: false } },
      stroke: { width: 0 },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } },
      responsive: [{ breakpoint: 480, options: { chart: { height: 250 } } }]
    };
  }

  private buildTipo(): void {
    const d = this.datos!;
    this.tipoChart = {
      series: d.porTipo.map(t => t.total),
      chart: { type: 'donut', height: 290, fontFamily: 'inherit' },
      labels: d.porTipo.map(t => t.tipo),
      colors: ['#6366f1', '#f97316', '#14b8a6', '#94a3b8'],
      legend: { position: 'bottom', fontSize: '13px' },
      plotOptions: { pie: { donut: { size: '68%', labels: {
        show: true,
        total: { show: true, label: 'Total', color: '#374151', fontSize: '13px', fontWeight: 700,
          formatter: () => String(d.total) }
      } } } },
      dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: '12px', fontWeight: 600 }, dropShadow: { enabled: false } },
      stroke: { width: 0 },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } },
      responsive: [{ breakpoint: 480, options: { chart: { height: 250 } } }]
    };
  }

  private buildTendencia(): void {
    const d = this.datos!;
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const labels = d.porMes.map(m => {
      const [anio, mes] = m.mes.split('-');
      return `${meses[parseInt(mes, 10) - 1]} ${anio.slice(2)}`;
    });

    this.tendenciaChart = {
      series: [{ name: 'Iniciativas', data: d.porMes.map(m => m.total) }],
      chart: { type: 'area', height: 240, fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { categories: labels, labels: { rotate: -45, style: { fontSize: '11px', colors: '#64748b' } }, tickAmount: Math.min(labels.length, 18) },
      yaxis: { labels: { formatter: (v: number) => String(Math.round(v)), style: { colors: '#64748b' } } },
      colors: ['#800048'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.02, stops: [0, 100] } },
      stroke: { curve: 'smooth', width: 2.5 },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      markers: { size: 3, colors: ['#800048'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 5 } },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } }
    };
  }

  private buildGrupo(): void {
    const d = this.datos!;
    const rev = [...d.porGrupo].reverse();
    const height = Math.max(260, rev.length * 38 + 60);

    this.grupoChart = {
      series: [{ name: 'Iniciativas', data: rev.map(g => g.total) }],
      chart: { type: 'bar', height, fontFamily: 'inherit', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' }, barHeight: '60%' } },
      xaxis: { categories: rev.map(g => g.nombre), labels: { style: { fontSize: '11px', colors: '#64748b' } } },
      yaxis: { labels: { style: { fontSize: '11px', colors: '#374151' }, maxWidth: 170 } },
      colors: ['#800048'],
      dataLabels: { enabled: true, offsetX: 8, style: { fontSize: '11px', colors: ['#374151'], fontWeight: 600 } },
      grid: { borderColor: '#f1f5f9', xaxis: { lines: { show: true } } },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } }
    };
  }

  private buildComision(): void {
    const d = this.datos!;
    const rev = [...d.porComision].reverse();
    const height = Math.max(260, rev.length * 38 + 60);

    this.comisionChart = {
      series: [{ name: 'Iniciativas', data: rev.map(c => c.total) }],
      chart: { type: 'bar', height, fontFamily: 'inherit', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' }, barHeight: '60%' } },
      xaxis: { categories: rev.map(c => c.nombre), labels: { style: { fontSize: '11px', colors: '#64748b' } } },
      yaxis: { labels: { style: { fontSize: '11px', colors: '#374151' }, maxWidth: 170 } },
      colors: ['#3b82f6'],
      dataLabels: { enabled: true, offsetX: 8, style: { fontSize: '11px', colors: ['#374151'], fontWeight: 600 } },
      grid: { borderColor: '#f1f5f9', xaxis: { lines: { show: true } } },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } }
    };
  }

  private buildProponente(): void {
    const d = this.datos!;
    this.proponenteChart = {
      series: [{ name: 'Iniciativas', data: d.porProponente.map(p => p.total) }],
      chart: { type: 'bar', height: 320, fontFamily: 'inherit', toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', dataLabels: { position: 'top' } } },
      xaxis: { categories: d.porProponente.map(p => p.tipo),
        labels: { rotate: -35, style: { fontSize: '11px', colors: '#64748b' }, trim: true, maxHeight: 80 } },
      yaxis: { labels: { formatter: (v: number) => String(Math.round(v)), style: { colors: '#64748b' } } },
      colors: ['#8b5cf6'],
      dataLabels: { enabled: true, offsetY: -18, style: { fontSize: '11px', colors: ['#374151'], fontWeight: 600 } },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      tooltip: { y: { formatter: (v: number) => `${v} iniciativas` } }
    };
  }

  get aprobadas(): number { return this.datos?.porEstatus.find(e => e.estatus === 'Aprobada')?.total ?? 0; }
  get enEstudio(): number { return this.datos?.porEstatus.find(e => e.estatus === 'En estudio')?.total ?? 0; }
  get rechazadas(): number {
    return (this.datos?.porEstatus.find(e => e.estatus === 'Rechazada en sesión')?.total ?? 0)
         + (this.datos?.porEstatus.find(e => e.estatus === 'Rechazada en comisión')?.total ?? 0);
  }
  get precluidas(): number { return this.datos?.porEstatus.find(e => e.estatus === 'Precluida')?.total ?? 0; }
  get pendientes(): number { return this.datos?.porEstatus.find(e => e.estatus === 'Pendiente')?.total ?? 0; }
  get mujeres(): number { return this.datos?.porGenero.find(g => g.genero === 'Mujeres')?.total ?? 0; }
  get hombres(): number { return this.datos?.porGenero.find(g => g.genero === 'Hombres')?.total ?? 0; }

  pct(val: number, total: number): number {
    return total === 0 ? 0 : Math.round((val / total) * 100);
  }
}
