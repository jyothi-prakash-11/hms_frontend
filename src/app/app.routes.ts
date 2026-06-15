import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { AuthGuard } from './core/guards/auth.guard';
import { NotFound } from './core/error/not-found/not-found';
import { Layout } from './core/layout/layout/layout';

export const routes: Routes = [
    {
        path: 'auth',
        children: AUTH_ROUTES
    },
    {
        path: '',
        component: Layout,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'admin',
                children: ADMIN_ROUTES
            }

        ]
    },
    {
        path: '**',
        component: NotFound
    }
];
