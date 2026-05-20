import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../features/auth/auth.service";


export const AuthGuard: CanActivateFn =
    (route, state) => {
        const authService = inject(AuthService);
        console.log(authService);
        const router = inject(Router);
        if (authService.getIsUserAuthenticated()) {
            console.log('in auth guard user is authenticated ', authService.getIsUserAuthenticated());
            return true;
        }
        console.log('in auth guard user not authenticated ');
        return router.createUrlTree(['/auth/login']);
    }