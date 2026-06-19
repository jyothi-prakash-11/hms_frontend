import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HealthRecordResponse, SingleHealthRecordResponse } from "./health-record.model";
import { ApiResponse } from "../shared/ApiResponse";

@Injectable({
    providedIn:'root'
})
export default class HealthRecordService{
    BASE_URL = 'http://localhost:3000/api/healthrecords';
    constructor(private http:HttpClient){}

    getAllHealthRecords(filters: any, page: number = 1, limit: number = 10){
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
                params = params.set(key, value.toString());
            }
        });
        return this.http.get<ApiResponse<HealthRecordResponse>>(`${this.BASE_URL}`,{params});
    }
    getRecordById(recordId:string){
        return this.http.get<ApiResponse<SingleHealthRecordResponse>>(`${this.BASE_URL}/${recordId}`);
    }

}