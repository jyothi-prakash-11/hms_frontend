import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { CreateEmployeePayload, EmployeeExistsResponse, EmployeesResponse } from "./employee.model";

@Injectable({
    providedIn: 'root'
})
export default class EmployeeService {
    BASE_URL = 'http://localhost:3000/api/employees';
    constructor(private http: HttpClient) { }
    getAllEmployees() {
        return this.http.get<ApiResponse<EmployeesResponse[]>>(`${this.BASE_URL}`);
    }
    checkEmailStatus(email: string){
        return this.http.get<ApiResponse<EmployeeExistsResponse>>(`${this.BASE_URL}/email/${email}`);
    }
    createEmployee(payload: CreateEmployeePayload){
        return this.http.post<ApiResponse<EmployeesResponse>>(`${this.BASE_URL}`,payload);
    }
}