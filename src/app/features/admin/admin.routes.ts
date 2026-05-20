import { Routes } from "@angular/router";
import { Admin } from "./layout/admin";
import { Employees } from "./pages/employees/employees";
import { Doctor } from "./pages/doctor/doctor";
import { Patients } from "./pages/patients/patients";

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: Admin,
        children: [
            {
                path: 'employees',
                component: Employees
            },
            {
                path: 'doctors',
                component: Doctor
            },
            {
                path: 'patients',
                component: Patients
            }
        ]
    }
]