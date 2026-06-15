import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../ApiResponse";
import { ProfileResponse } from "./header.model";

@Injectable({
    providedIn: 'root'
})
export default class HeaderService {
    BASE_URL = 'http://localhost:3000/api/auth';
    constructor(private http: HttpClient) { }
    getProfile() {
        return this.http.get<ApiResponse<ProfileResponse>>(`${this.BASE_URL}/me`);
    }
}