import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./iniciativas-decretos.component').then(c => c.IniciativasDecretosComponent)
    },
    {
        path: 'votacion/:id',
        loadComponent: () => import('./votacion-iniciativa/votacion-iniciativa.component').then(c => c.VotacionIniciativaComponent)
    }
] as Routes;