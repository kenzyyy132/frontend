import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ApiErrorBody } from '../models/api.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as ApiErrorBody | undefined;
      let message = body?.message ?? 'Something went wrong. Please try again.';

      if (error.status === 0) {
        message = 'Cannot reach the server. Is the backend running on port 5000?';
      }

      if (error.status === 401) {
        const isLoginAttempt = req.url.includes('/auth/login') || req.url.includes('/auth/signin');

        if (!isLoginAttempt && auth.isLoggedIn()) {
          auth.logout();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
          message = 'Your session has expired. Please sign in again.';
        }
      }

      if (error.status === 403) {
        message = body?.message ?? 'You do not have permission to do that.';
      }

      
      toast.error(message);

      return throwError(() => error);
    }),
  );
};
