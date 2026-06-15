import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { CreateDoctorRequest, createDoctorResponse, DoctorExistsResponse, DoctorResponse } from "./doctor.model";
import { AuthService } from "../auth/auth.service";
import { DOCTOR_ACTIONS } from "./doctor.permissions";

@Injectable({
    providedIn:'root'
})
export class DoctorService{
    BASE_URL = "http://localhost:3000/api/doctors";
    constructor(private http:HttpClient,private authService: AuthService){}
    getDoctors(){
        return this.http.get<ApiResponse<DoctorResponse[]>>(`${this.BASE_URL}`);
    }
    canEditDoctor(){
        return this.authService.hasAccess(DOCTOR_ACTIONS.EDIT);
    }
    canAddDoctor(){
        return this.authService.hasAccess(DOCTOR_ACTIONS.CREATE);
    }
    checkDoctorExists(email:string){
        return this.http.get<ApiResponse<DoctorExistsResponse>>(`${this.BASE_URL}/email/${email}`);
    }
    createDoctor(payload: CreateDoctorRequest){
        console.log("payload : ",payload);
        return this.http.post<ApiResponse<createDoctorResponse>>(`${this.BASE_URL}`,payload);
    }
}