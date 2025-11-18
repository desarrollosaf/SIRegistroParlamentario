import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./comision.component').then(c => c.ComisionComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('../agenda/add-edit-agenda/add-edit-agenda.component').then(c => c.AddEditAgendaComponent)
    },
    {
        path: 'detalle-comision/:id',
        loadComponent: () => import('./detalle-comision/detalle-comision.component').then(c => c.DetalleComisionComponent)
    }
] as Routes;