import { Routes } from "@angular/router";
import { Layout } from "../../core/layout/layout/layout";
import { Dashboard } from "./dashboard/dashboard";
import { Patient } from "../patient/patient";
import { Approvals } from "./approvals/approvals";
import { Doctor } from "../doctor/doctor";
import { Employee } from "../employee/employee";
import { Appointments } from "../appointments/appointments";

export const ADMIN_ROUTES: Routes = [
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'patients',
        component: Patient
    },
    {
        path: 'approvals',
        component: Approvals
    },
    {
        path: 'doctors',
        component: Doctor
    },
    {
        path: 'employees',
        component: Employee
    },
    {
        path: 'appointments',
        component: Appointments
    }
]