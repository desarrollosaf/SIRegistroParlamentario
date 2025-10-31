
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
interface Integrante {
  id: number;
  id_diputado: string;
  diputado: string;
  partido: string;
  sentido_voto: number; // 0: sin selección, 1: presente, 2: remota, 3: ausente
}

@Component({
  selector: 'app-detalle-comision',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './detalle-comision.component.html',
  styleUrl: './detalle-comision.component.scss'
})
export class DetalleComisionComponent implements OnInit {
  step = 1;
  integrantes: Integrante[] = [];
  columna1: Integrante[] = [];
  columna2: Integrante[] = [];
  idComision: string; // Obtén este ID de tu ruta o como lo necesites

  datosAsistencia: any = {};
  datosDetalle: any = {};
  datosConfiguracion: any = {};
  datosResumen: any = {};
  private _eventoService = inject(EventoService);
  idComisionRuta: string;


  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router
  ) {

    this.idComisionRuta = String(aRouter.snapshot.paramMap.get('id'));
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
    // Carga inicial si necesitas algo al montar el componente
    this.cargarDatosSeccion(1);
  }

  private cargarDatosSeccion(seccion: number): void {
    switch (seccion) {
      case 1:
        this.cargardatosAsistencia();
        break;
      case 2:
        this.cargarDatosDetalle();
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
        console.log(response);
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
    // Aquí haces tu petición al backend
    // this._eventoService.guardarSentidoVoto(idIntegrante, sentido).subscribe({
    //   next: (response) => {
    //     console.log('Sentido guardado correctamente', response);
    //   },
    //   error: (e: HttpErrorResponse) => {
    //     console.error('Error al guardar sentido:', e.error?.msg);
    //   }
    // });

    console.log(`Guardando sentido: id_duputado ${idIntegrante}, Sentido ${sentido}, id_agenda ${idAgenda}`);
  }

  getClaseAsistencia(sentido_voto: number): string {
    switch (sentido_voto) {
      case 1:
        return 'asistencia-presente';
      case 2:
        return 'asistencia-remota';
      case 3:
        return 'asistencia-ausente';
      default:
        return '';
    }
  }







  private cargarDatosDetalle(): void {
    // Consulta para sección 2
  }

  private cargarDatosConfiguracion(): void {
    // Consulta para sección 3
  }

  private cargarDatosResumen(): void {
    // Consulta para sección 4
  }
}