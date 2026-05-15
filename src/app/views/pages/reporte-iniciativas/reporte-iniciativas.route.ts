import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reporte-iniciativas.component').then(c => c.ReporteIniciativasComponent)
  }
];

export default routes;
