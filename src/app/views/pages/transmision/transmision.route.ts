import { Routes } from "@angular/router";

export default [
  {
    path: '',
    loadComponent: () => import('./transmision.component').then(c => c.TransmisionComponent)
  }
] as Routes;
