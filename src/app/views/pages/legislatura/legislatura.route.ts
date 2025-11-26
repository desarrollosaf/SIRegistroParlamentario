import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./legislatura.component').then(c => c.LegislaturaComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('../legislatura/add-edit-legislatura/add-edit-legislatura.component').then(c => c.AddEditLegislaturaComponent)
    },
     {
        path: 'edit/:id',
        loadComponent: () => import('../legislatura/add-edit-legislatura/add-edit-legislatura.component').then(c => c.AddEditLegislaturaComponent)
    }
] as Routes;