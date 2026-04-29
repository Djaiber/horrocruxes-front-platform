import { inject } from '@angular/core';
import {
  type HttpErrorResponse,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(withBearer(req, auth.getAccessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRoute(req)) {
        return throwError(() => error);
      }

      // Token expirado: intenta refresh y reintenta la request original
      return from(auth.refreshSession()).pipe(
        switchMap(() => next(withBearer(req, auth.getAccessToken()))),
        catchError((refreshError) => {
          console.error('[authInterceptor] token refresh failed:', refreshError);
          auth.signOut();
          router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function withBearer(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isAuthRoute(req: HttpRequest<unknown>): boolean {
  return req.url.includes('/auth/');
}
