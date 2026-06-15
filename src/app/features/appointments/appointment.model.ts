export interface AppointmentResponse {

    _id: string;

    appointmentId: string;

    appointmentDate: string;

    appointmentTime: string;

    status: string;

    patientId: {

        _id: string;

        UHID: string;

        userId: {

            firstName: string;

            lastName: string;

            email: string;

            phone: string;

        };

    };

    doctorId: {

        _id: string;

        specialization: string;

        employeeId: {

            _id: string;

            employeeCode: string;

            designation: string;

            userId: {

                firstName: string;

                lastName: string;

            };

        };

    };

    createdBy?: {

        _id: string;

        firstName: string;

        lastName: string;

        email: string;

    };

}