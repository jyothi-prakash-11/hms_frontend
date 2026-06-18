import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../ApiResponse";
import { AppointmentDoctorResponse, AppointmentPatientResponse, CreateAppointmentRequest } from "./appointmentForm.model";
import { AppointmentResponse } from "../../../features/appointments/appointment.model";

@Injectable({
    providedIn: 'root'
})
export default class AppointmentFormService {
    constructor(private http: HttpClient) { }
    BASE_URL = 'http://localhost:3000/api';

    searchPatient(search: string) {
        return this.http.get<ApiResponse<AppointmentPatientResponse[]>>(`${this.BASE_URL}/patients/search`, { params: { search } });
    }
    searchDoctor(query: string) {
        return this.http.get<ApiResponse<AppointmentDoctorResponse[]>>(`${this.BASE_URL}/doctors/search/`, { params: { query } });
    }
    getDoctorSlots(doctorId: string, date: string) {
        return this.http.get<ApiResponse<string[]>>(`${this.BASE_URL}/doctors/${doctorId}/slots?date=${date}`);
    }
    createAppointment(Payload: CreateAppointmentRequest) {
        return this.http.post<ApiResponse<AppointmentResponse>>(`${this.BASE_URL}/appointments/`, Payload);
    }
}