import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthenticationService } from "./authentication.service";


export const AuthGaurdService: CanActivateFn = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.isAuthenticated()){
    return true;
  } else {
    router.navigate(['/login']);
    // router.navigate(['']);
    return false;
  }

}
