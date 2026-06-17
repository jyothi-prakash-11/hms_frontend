import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { CreatePatientRequest, PatientDetails, PatientExistsResponse, PatientSummary, PatientSummaryResponse } from "./patient.model";
import { AuthService } from "../auth/auth.service";
import { PATIENT_ACTIONS } from "./patient.permissions";

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    BASE_URL = 'http://localhost:3000/api/patients'
    constructor(private http: HttpClient, private authService: AuthService) { }
    getPatientSummary(page: number = 1,search: string ) {
        let params = new HttpParams().set('page', page.toString());
        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }
        return this.http.get<ApiResponse<PatientSummaryResponse>>(`${this.BASE_URL}/`, { params });    
    }
    getPatientByUhid(id: string) {
        return this.http.get<ApiResponse<PatientDetails>>(`${this.BASE_URL}/${id}`);
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