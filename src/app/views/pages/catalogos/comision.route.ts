import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./catalogos.component').then(c => c.CatalogosComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./edit-catalogos/edit-catalogos').then(c => c.EditCatalogos)
    }
] as Routes;