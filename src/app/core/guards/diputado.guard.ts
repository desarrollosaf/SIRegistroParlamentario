import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const diputadoGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.getCurrentUser().pipe(
    map((user: any) => {
      const role = user?.role || 'admin';
      if (role !== 'diputado') {
        router.navigate(['/agenda-comision/sesiones']);
        return false;
      }
      userService.setCurrentUser({ ...userService.currentUserValue, role } as any);
      return true;
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
