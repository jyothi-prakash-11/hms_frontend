import { ROLE } from "../../shared/Role";

export const PATIENT_ACTIONS = {

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

    DELETE: [
        ROLE.ADMIN
    ]

};