import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoginRequest, LoginResponse, RolesResponse } from "./auth.model";
import { ApiResponse } from "../../shared/ApiResponse";
import { Subject, tap } from "rxjs";
import { ROLE } from "../../shared/Role";
import { ROLE_ROUTE_MAP } from "../../shared/Role_Map";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient, private router: Router) { }
    private isAuthenticated: boolean = false;
    private authStatusListner = new Subject<boolean>();
    private tokenTimer!: number;

    private setAuthTimer(duration: number) {
        console.log("setAuthTimer : i am getting exec");
        this.tokenTimer = window.setTimeout(() => {
            console.log("setAuthTimer : loggin out session");
            this.logoutUser();
        }, duration)
    }
    getIsUserAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
    getAuthStatusListner() {
        return this.authStatusListner.asObservable();
    }
    autoAuthUser() {
        console.log("executing autoauthuser")
        const token = localStorage.getItem('token');
        const expiration = Number(localStorage.getItem('expiration'));
        if (!token || !expiration) {
            console.log('return from here no token and expiration')
            return;
        }
        const expiresIn = expiration - Date.now();
        if (expiresIn > 0) {
            this.isAuthenticated = true;
            this.authStatusListner.next(true);
            this.setAuthTimer(expiresIn);
        }
        else {
            console.log('in autoAuthUser else block');
            this.router.navigateByUrl('/auth/login');
        }
    }
    loginUser(authData: LoginRequest) {
        return this.http.post<ApiResponse<LoginResponse>>("http://localhost:3000/api/auth/login", authData)
            .pipe(
                tap((res) => {
                    console.log("Login tap - response received:", res);
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("role", res.data.role);
                    console.log("Token stored in localStorage:", localStorage.getItem("token"));
                    const expiresIn = this.getExpirationDuration(res.data.expiresIn);
                    console.log("expires in ", expiresIn);
                    const expirationTime = Date.now() + expiresIn;
                    localStorage.setItem('expiration', expirationTime.toString());
                    this.setAuthTimer(expirationTime - Date.now());
                    this.isAuthenticated = true;
                    this.authStatusListner.next(true);
                }
                )
            )
    }
    logoutUser() {
        this.isAuthenticated = false;
        this.authStatusListner.next(false);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('expiration');
        clearTimeout(this.tokenTimer);
        this.router.navigateByUrl('/auth/login');
    }
    getDashboardByRole(role: ROLE) {
        return ROLE_ROUTE_MAP[role] || '/login';
    }
    private getExpirationDuration(
        expiresIn: string
    ): number {

        const timeValue =
            parseInt(expiresIn);

        const timeUnit =
            expiresIn.slice(-1);

        switch (timeUnit) {

            case 's':
                return timeValue * 1000;

            case 'm':
                return timeValue * 60 * 1000;

            case 'h':
                return timeValue * 60 * 60 * 1000;

            case 'd':
                return timeValue * 24 * 60 * 60 * 1000;

            default:
                return 0;

        }

    }
    getCurrentModuleByRole() {
        const roleCode = localStorage.getItem('role') as ROLE;
        const route = ROLE_ROUTE_MAP[roleCode];
        console.log("Role:", roleCode);
        console.log("Route:", route);
        return route
    }
    hasAccess(allowedRoles: ROLE[]): boolean {
        const roleCode = localStorage.getItem('role') as ROLE;
        return allowedRoles.includes(roleCode);
    }
}