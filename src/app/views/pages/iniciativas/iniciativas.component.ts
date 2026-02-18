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
  // Agrega las propiedades que necesites mostrar en el timeline
}

interface TimelineItem {
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'aprobacion' | 'rechazo';
  usuario?: string;
}


@Component({
  selector: 'app-iniciativas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './iniciativas.component.html',
  styleUrl: './iniciativas.component.scss'
})
export class IniciativasComponent implements OnInit{
  private _eventoService = inject(EventoService);
  cargando: boolean = false;
  listaIniciativas: Iniciativa[] = [];
  iniciativaSeleccionada: Iniciativa | null = null;
  timelineData: TimelineItem[] = [];

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
    // if (!iniciativa) {
    //   this.timelineData = [];
    //   return;
    // }

    // this.iniciativaSeleccionada = iniciativa;
    // this.cargarTimelineIniciativa(iniciativa.id);
  }

}
