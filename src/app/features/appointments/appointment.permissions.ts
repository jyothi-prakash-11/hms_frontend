import { ROLE } from "../../shared/Role";

export const APPOINTMENT_ACTIONS = {

    VIEW: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST,

        ROLE.DOCTOR

    ],

    CREATE: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST

    ],

    EDIT: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST

    ],

    CANCEL: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST

    ],

    UPDATE_STATUS: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST,

        ROLE.DOCTOR

    ],

    VIEW_DOCTOR_SCHEDULE: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST,

        ROLE.DOCTOR

    ],

    VIEW_PATIENT_HISTORY: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST,

        ROLE.DOCTOR

    ]

};