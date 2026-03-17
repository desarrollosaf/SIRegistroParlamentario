import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./iniciativas-decretos.component').then(c => c.IniciativasDecretosComponent)
    }
] as Routes;