import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../../shared/ApiResponse";
import { DashboardResponse } from "./dashboard.model";

@Injectable({
    providedIn:'root'
})
export default class DashboardService{
    BASE_URL = 'http://localhost:3000/api/dashboard';
    constructor(private http:HttpClient){}
    getDashboardStats(){
        return this.http.get<ApiResponse<DashboardResponse>>(`${this.BASE_URL}/admin`);
    }
}