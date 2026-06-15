import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../../shared/ApiResponse";
import { Approval } from "./approvals.models";

@Injectable({
    providedIn: 'root'
})
export class ApprovalService {
    BASE_URL = 'http://localhost:3000/api/approvals';
    constructor(private http: HttpClient) { }
    getAllApproval() {
        return this.http.get<ApiResponse<Approval[]>>(`${this.BASE_URL}`);
    }
    approveRequest(id: string) {
        return this.http.post(`${this.BASE_URL}/${id}/approve`, {});
    }
    rejectApproval(id: string) {
        return this.http.post(`${this.BASE_URL}/approvals/${id}/reject`, {});
    }
}