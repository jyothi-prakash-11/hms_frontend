import { ROLE } from "../../shared/Role";

export interface LoginRequest {
    email: string,
    password: string
}
export interface LoginResponse {
    token: string;
    role: ROLE;
    expiresIn: string
}
export interface RolesResponse {
    name: string;
}