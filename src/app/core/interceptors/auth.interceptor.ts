import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const token = localStorage.getItem('token');

  // Check if token is expired before sending request
  if (token && userService.isTokenExpired()) {
    userService.logout();
    return throwError(() => new Error('Token expired'));
  }

  // Clone the request and add the authorization header if the token exists
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          userService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
