import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, LOCALE_ID, NgModule } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import localeEs from '@angular/common/locales/es-MX';
import { registerLocaleData } from '@angular/common';

import { authInterceptor } from './views/pages/auth/auth.interceptor';


const highlightOptions = {
  coreLibraryLoader: () => import('highlight.js/lib/core'),
  languages: {
    typescript: () => import('highlight.js/lib/languages/typescript'),
    scss: () => import('highlight.js/lib/languages/scss'),
    xml: () => import('highlight.js/lib/languages/xml')
  },
};

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })), 
    provideAnimationsAsync(),
    importProvidersFrom([SweetAlert2Module.forRoot(), HttpClientModule, NgModule, FormsModule, ReactiveFormsModule]),
    provideHighlightOptions(highlightOptions),
    { provide: LOCALE_ID, useValue: 'es-MX' },  // 👈 Corregido (tenías la sintaxis mal)
  ],
};