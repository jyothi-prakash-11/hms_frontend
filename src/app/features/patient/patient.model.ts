export interface Patient {

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