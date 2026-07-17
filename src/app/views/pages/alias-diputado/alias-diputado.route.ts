import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./alias-diputado.component').then(c => c.AliasDiputadoComponent)
    }
] as Routes;
