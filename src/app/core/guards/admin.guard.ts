import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.getCurrentUser().pipe(
    map((user: any) => {
      const role = user?.role || 'admin';
      // Los diputados no usan esta app (usan la app de diputados aparte)
      if (role === 'diputado') {
        userService.clearSession();
        router.navigate(['/auth/login']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
