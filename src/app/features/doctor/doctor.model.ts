import { PaginationMetadata } from "../../shared/ApiResponse";

export interface Doctor {

    _id: string;

    employeeId: string;

    specialization: string;

    qualification: string;

    consultationFee: number;

    medicalRegistrationNo: string;

    availabilityStartTime?: string;

    availabilityEndTime?: string;

    experienceYears: number;

    isActive: boolean;

    createdAt: string;

    updatedAt: string;

}
export interface DoctorExistsResponse {
    exist: boolean;
}
export interface UserSummary {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}
export interface EmployeeSummary {
    employeeCode: string;
    department: 'OPD' | 'IPD' | 'LAB' | 'PHARMACY' | 'ADMIN';
}
export interface DoctorListItem {
    _id: string;
    consultationFee: number;
    availabilityStartTime: string;
    availabilityEndTime: string;
    employeeId: EmployeeSummary;
    userId: UserSummary;
}
/*
* Response to map all doctors
*/
export interface DoctorResponse {
    doctors: DoctorListItem[];
    pagination: PaginationMetadata;
}
export interface FullUserDetail {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isVerified: boolean;
    lastLoginAt: string | null;
}

export interface FullEmployeeDetail {
    _id: string;
    userId: string;
    employeeCode: string;
    department: 'OPD' | 'IPD' | 'LAB' | 'PHARMACY' | 'ADMIN';
    designation: string;
    status: boolean;
    joiningDate: string;
}

export interface FullDoctorDetail {
    _id: string;
    employeeId: FullEmployeeDetail;
    userId: FullUserDetail;
    specialization: string;
    qualification: string;
    consultationFee: number;
    medicalRegistrationNo: string;
    availabilityStartTime: string;
    availabilityEndTime: string;
    experienceYears: number;
}
/*
* Payload for creating doctor  
*/
export interface CreateDoctorRequest {

    // User

    firstName: string;

    lastName: string;

    email: string;

    phone: string;

    // Employee

    department:
    | 'OPD'
    | 'IPD'
    | 'LAB'
    | 'PHARMACY'
    | 'ADMIN';

    designation: string;

    joiningDate: string;

    // Doctor

    specialization: string;

    qualification: string;

    consultationFee: number;

    medicalRegistrationNo: string;

    availabilityStartTime: string;

    availabilityEndTime: string;

    experienceYears: number;

}
export interface createDoctorResponse {
    _id: string;

    specialization: string;

    qualification: string;

    consultationFee: number;

    medicalRegistrationNo: string;

    availabilityStartTime?: string;

    availabilityEndTime?: string;

    experienceYears: number;

    isActive: boolean;

    employeeId: {

        employeeCode: string;
        _id: string;

        department: string;

        designation: string;

        userId: {

            _id: string;

            firstName: string;

            lastName: string;

            email: string;

            phone: string;

            roleId: {

                name: string;

            };

        };

    };


}