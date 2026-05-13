import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./asistencia-diputado.component').then(c => c.AsistenciaDiputadoComponent)
  }
] as Routes;
