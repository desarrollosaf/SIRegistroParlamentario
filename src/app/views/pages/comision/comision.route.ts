import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./comision.component').then(c => c.ComisionComponent)
    },
        {
        path: 'detalle-comision/:id',
        loadComponent: () => import('./detalle-comision/detalle-comision.component').then(c => c.DetalleComisionComponent)
    }
] as Routes;