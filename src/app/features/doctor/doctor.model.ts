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
export interface DoctorResponse {

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