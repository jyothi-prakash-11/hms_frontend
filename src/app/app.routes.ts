import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { AuthGuard } from './core/guards/auth.guard';
import { NotFound } from './core/error/not-found/not-found';

export const routes: Routes = [
    {
        path: 'auth',
        children: AUTH_ROUTES
    },
    {
        path: 'admin',
        children: ADMIN_ROUTES,
        canActivate: [AuthGuard]
    },
    {
        path:'**',
        component:NotFound
    }
];
