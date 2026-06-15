import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiResponse } from "../../shared/ApiResponse";
import { NavItems } from "./navigation.model";
import { AuthService } from "../../features/auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private authService = inject(AuthService);
    BASE_URL = 'http://localhost:3000/api';
    constructor(private http:HttpClient){}
    getNavgation(){
        return this.http.get<ApiResponse<NavItems[]>>(`${this.BASE_URL}/meta/nav`);
    }
    getCurrentModule(){
        return this.authService.getCurrentModuleByRole();
    }
}