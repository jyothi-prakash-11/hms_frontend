import { PaginationMetadata } from "../../shared/ApiResponse";
// detailed patient info
export interface PatientDetails {
    userId: {

        firstName: string;

        lastName: string;

        email: string;

        phone: string;

    };

    UHID: string;

    gender: string;

    dob: string;

    bloodGroup: string;

    address: string;

    emergencyContactName: string;

    emergencyContactPhone: string;

}
// patient details outlining
export interface PatientSummary {

    _id: string;

    UHID: string;

    userId: {

        _id: string;

        firstName: string;

        lastName: string;

        email: string;

        phone: string;

    };

}
export interface PatientExistsResponse {
    exist: boolean;
}
export interface CreatePatientRequest {

    firstName: string;

    lastName: string;

    email: string;

    phone: string;

    gender: string;

    dob: string;

    bloodGroup: string;

    address: string;

    emergencyContactName: string;

    emergencyContactPhone: string;

}
// maps initial load compiling pagination
export interface PatientSummaryResponse {
    patientData: PatientSummary[];
    pagination: PaginationMetadata;
}