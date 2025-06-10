import { HttpInterceptorFn } from '@angular/common/http';
import { LocalSaveService, JwtToken } from '../services/local-save.service';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { SnackbarService } from '../services/snackbar.service';
import { AuthenticationService } from '../services/authentication.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localSaveService = inject(LocalSaveService);
  const snackbarService = inject(SnackbarService);
  const authService = inject(AuthenticationService);
  const tokenStr = localSaveService.get(JwtToken);


  if (tokenStr) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenStr}`
      }
    });
    return next(authReq).pipe(
      catchError((error) => {
        if (error.status <= 400) {
          authService.logout();
          snackbarService.openSnackbar("Session Expired!!! Please login again.");
        } else {
          return from(authService.refreshToken()).pipe(
            switchMap((response) => {
              if (response?.responseCode != 200 || !response.data) {
                authService.logout();
                snackbarService.openSnackbar("Session Expired!!! Please login again.");
                return throwError(() => error);
              }
              authService.saveTokens(response?.data);
              const cloned = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokenStr}`
                }
              });
              return next(cloned);
            }),
            catchError(() => {
              authService.logout();
              return throwError(() => error);
            })
          )
        }
        return throwError(() => error);
        }))
  }
  return next(req);
};
