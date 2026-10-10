import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const isOurApi = req.url.startsWith(environment.apiBaseUrl) || req.url.startsWith('/api/');

  if (!token || !isOurApi || req.headers.has('Authorization')) {
    return next(req);
  }

 
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
