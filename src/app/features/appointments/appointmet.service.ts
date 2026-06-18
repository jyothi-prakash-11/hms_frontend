import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { AppointmentResponse } from "./appointment.model";
import { AuthService } from "../auth/auth.service";
import { APPOINTMENT_ACTIONS } from "./appointment.permissions";

@Injectable({
    providedIn: 'root'
})
export default class AppointmentService {
    constructor(private http: HttpClient, private authService: AuthService) { }
    BASE_URL = 'http://localhost:3000/api/appointments';
    getAppointments(date: string = '') {
        const options = date ? { params: { date } } : {};
        return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.BASE_URL}`, options);
    }
    canAddAppointment() {
        return this.authService.hasAccess(APPOINTMENT_ACTIONS.CREATE);
    }
    canUpdateAppointment() {
        return this.authService.hasAccess(APPOINTMENT_ACTIONS.UPDATE_STATUS);
    }
    updateAppointmentStatus(appointmentId: string, status: string) {
        return this.http.patch<ApiResponse<AppointmentResponse>>(`${this.BASE_URL}/${appointmentId}/status`, { status });
    }
}