export interface CreateAppointmentRequest {

    patientId: string;

    doctorId: string;

    appointmentDate: string;

    appointmentTime: string;

}
export interface AppointmentPatientResponse {

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
export interface AppointmentDoctorResponse {

    _id: string;

    specialization: string;

    employeeId: {

        _id: string;

        employeeCode: string;

        department: string;

        designation: string;

        userId: {

            _id: string;

            firstName: string;

            lastName: string;

            email: string;

            phone: string;

        };

    };   
}
export interface CreateAppointmentRequest {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
}