import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { RolesResponse } from "../auth/auth.model";
import { ApprovalStatusResponse, CreateApprovalRequest, DepartmentResponse } from "./joinus.model";


@Injectable({
    providedIn: 'root'
})
export class JoinusService {
    BASE_URL = 'http://localhost:3000/api';
    constructor(private http: HttpClient) { }
    getRoles() {
        return this.http.get<ApiResponse<RolesResponse[]>>('http://localhost:3000/api/meta/roles');
    }
    getDepartments(){
        return this.http.get<ApiResponse<DepartmentResponse[]>>('http://localhost:3000/api/meta/departments');
    }
    checkApprovalStatus(email: string) {
        return this.http.post<ApiResponse<ApprovalStatusResponse>>(`${this.BASE_URL}/approvals/status`, {email});
    }
    createApproval(payload:CreateApprovalRequest){
        console.log('joinService :  sending req to create approvals')
        return this.http.post<ApiResponse<any>>(`${this.BASE_URL}/approvals/`,payload);
    }
}