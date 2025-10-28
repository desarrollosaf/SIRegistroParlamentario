import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./agenda.component').then(c => c.AgendaComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./add-edit-agenda/add-edit-agenda.component').then(c => c.AddEditAgendaComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./add-edit-agenda/add-edit-agenda.component').then(c => c.AddEditAgendaComponent)
    }
    ,
    {
        path: 'sesion/:id',
        loadComponent: () => import('./sesion/sesion.component').then(c => c.SesionComponent)
    }
] as Routes;