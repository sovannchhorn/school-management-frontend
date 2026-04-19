import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] || [];
  const userRole = auth.user()?.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
