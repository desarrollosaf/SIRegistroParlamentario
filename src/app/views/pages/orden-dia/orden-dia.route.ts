import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./orden-dia.component').then(c => c.OrdenDiaComponent)
    }
] as Routes;
