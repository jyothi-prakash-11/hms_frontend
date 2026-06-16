import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { CreatePatientRequest, PatientDetails, PatientExistsResponse, PatientSummary } from "./patient.model";
import { AuthService } from "../auth/auth.service";
import { PATIENT_ACTIONS } from "./patient.permissions";

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    BASE_URL = 'http://localhost:3000/api/patients'
    constructor(private http: HttpClient, private authService: AuthService) { }
    getPatientSummary() {
        return this.http.get<ApiResponse<PatientSummary[]>>(`${this.BASE_URL}/`);
    }
    getPatientByEmail(email: string) {
        return this.http.get<ApiResponse<PatientDetails>>(`${this.BASE_URL}/search?query=${email}`);
    }
    canEditPatient(): boolean {
        return this.authService.hasAccess(PATIENT_ACTIONS.EDIT);
    }
    canAddPatient(): boolean {
        return this.authService.hasAccess(PATIENT_ACTIONS.CREATE);
    }
    checkPatientExists(email:string){
        return this.http.get<ApiResponse<PatientExistsResponse>>(`${this.BASE_URL}/email/${email}`);
    }
    createPatient(payload: CreatePatientRequest){
        return this.http.post<ApiResponse<PatientSummary>>(`${this.BASE_URL}/`,payload);
    }
}