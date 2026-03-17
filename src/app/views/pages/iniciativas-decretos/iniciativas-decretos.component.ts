import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventoService } from '../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { enviroment } from '../../../../enviroments/enviroment';

@Component({
  selector: 'app-iniciativas-decretos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './iniciativas-decretos.component.html',
  styleUrl: './iniciativas-decretos.component.scss'
})
export class IniciativasDecretosComponent {
  private _eventoService = inject(EventoService);
  enviro = enviroment.endpoint;
  cargando: boolean = false;
  listaIniciativas: [] = [];

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
    this._eventoService.getIniciativasDecretos().subscribe({
      next: (response: any) => {
        // this.listaIniciativas = response.data || response.iniciativas || [];
        this.cargando = false;
        console.log('INICIATIVAS DECRETOS', response);
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar iniciativas:', e);
        this.cargando = false;
      }
    });
  }



}
