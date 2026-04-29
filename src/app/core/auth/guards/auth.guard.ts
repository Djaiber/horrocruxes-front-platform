import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // Solo intentar refresh si hay un refresh token guardado — evita llamadas innecesarias a Cognito
  if (!auth.hasRefreshToken()) return router.createUrlTree(['/auth/login']);

  try {
    await auth.refreshSession();
    return true;
  } catch (err) {
    console.error('[authGuard] refresh failed:', err);
    return router.createUrlTree(['/auth/login']);
  }
};
