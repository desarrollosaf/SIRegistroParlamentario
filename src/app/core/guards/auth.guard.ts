import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);
  return userService.getCurrentUser().pipe(
    map((user: any) => {
      userService.setCurrentUser(user);
      // Los diputados no usan la app admin: su pantalla es el panel de sesión.
      if (user?.role === 'diputado') {
        router.navigate(['/diputado']);
        return false;
      }
      // Comunicación Social solo puede ver la pantalla de Transmisión.
      if (user?.role === 'comunicacion' && !state.url.startsWith('/transmision')) {
        router.navigate(['/transmision']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};