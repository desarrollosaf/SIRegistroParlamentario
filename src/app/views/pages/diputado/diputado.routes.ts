import { Routes } from '@angular/router';
import { diputadoGuard } from '../../../core/guards/diputado.guard';

export default [
  {
    path: 'panel',
    loadComponent: () => import('./panel/panel.component').then(c => c.PanelDiputadoComponent),
    canActivate: [diputadoGuard],
  },
] as Routes;
