import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./iniciativas.component').then(c => c.IniciativasComponent)
    }
] as Routes;