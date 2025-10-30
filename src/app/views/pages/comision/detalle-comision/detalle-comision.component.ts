
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
interface Miembro {
  id: number;
  nombre: string;
  asistencia: 'presente' | 'remota' | 'ausente' | null;
}

@Component({
  selector: 'app-detalle-comision',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './detalle-comision.component.html',
  styleUrl: './detalle-comision.component.scss'
})
export class DetalleComisionComponent implements OnInit {
  step = 1;
  miembros: Miembro[] = [];
  columna1: Miembro[] = [];
  columna2: Miembro[] = [];

  datosAsistencia: any = {};
  datosDetalle: any = {};
  datosConfiguracion: any = {};
  datosResumen: any = {};
  private _eventoService = inject(EventoService);
  idComision: string;


  constructor(
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private router: Router
  ) {

     this.idComision = String(aRouter.snapshot.paramMap.get('id'));
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
    switch(seccion) {
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

  // Métodos para cargar datos de cada sección
  private cargardatosAsistencia(): void {



  this._eventoService.getEvento(this.idComision).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });


























      this.miembros = [
      { id: 1, nombre: 'Juan Pérez García', asistencia: null },
      { id: 2, nombre: 'María González López', asistencia: null },
      { id: 3, nombre: 'Carlos Rodríguez Martínez', asistencia: null },
      { id: 4, nombre: 'Ana Fernández Sánchez', asistencia: null },
      { id: 5, nombre: 'Luis Martínez Hernández', asistencia: null },
      { id: 6, nombre: 'Carmen Díaz Moreno', asistencia: null },
      { id: 7, nombre: 'José López Jiménez', asistencia: null },
      { id: 8, nombre: 'Laura Torres Ruiz', asistencia: null },
      { id: 9, nombre: 'Pedro Ramírez Castro', asistencia: null },
      { id: 10, nombre: 'Isabel Flores Ortiz', asistencia: null },
      { id: 11, nombre: 'Miguel Ángel Vargas Silva', asistencia: null },
      { id: 12, nombre: 'Patricia Méndez Reyes', asistencia: null },
      { id: 13, nombre: 'Roberto Castillo Ramos', asistencia: null },
      { id: 14, nombre: 'Sofía Herrera Domínguez', asistencia: null },
      { id: 15, nombre: 'Fernando Gutiérrez Cruz', asistencia: null },
      { id: 16, nombre: 'Gabriela Morales Santos', asistencia: null },
      { id: 17, nombre: 'Alejandro Núñez Vega', asistencia: null },
      { id: 18, nombre: 'Verónica Romero Medina', asistencia: null },
      { id: 19, nombre: 'Diego Aguilar Peña', asistencia: null },
      { id: 20, nombre: 'Claudia Silva Contreras', asistencia: null },
      { id: 21, nombre: 'Ricardo Mendoza Luna', asistencia: null },
      { id: 22, nombre: 'Daniela Castro Guerrero', asistencia: null },
      { id: 23, nombre: 'Jorge Delgado Paredes', asistencia: null },
      { id: 24, nombre: 'Adriana Ríos Campos', asistencia: null },
      { id: 25, nombre: 'Héctor Valenzuela Soto', asistencia: null }
    ];

    this.dividirEnColumnas();
  }

    private dividirEnColumnas(): void {
    const mitad = Math.ceil(this.miembros.length / 2);
    this.columna1 = this.miembros.slice(0, mitad);
    this.columna2 = this.miembros.slice(mitad);
  }



  marcarAsistencia(miembro: Miembro, tipo: 'presente' | 'remota' | 'ausente'): void {
    miembro.asistencia = tipo;
  }

  getClaseAsistencia(asistencia: string | null): string {
    switch(asistencia) {
      case 'presente':
        return 'asistencia-presente';
      case 'remota':
        return 'asistencia-remota';
      case 'ausente':
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