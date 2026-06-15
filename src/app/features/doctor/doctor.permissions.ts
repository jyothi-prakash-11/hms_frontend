import { ROLE } from "../../shared/Role";

export const DOCTOR_ACTIONS = {

    VIEW: [

        ROLE.ADMIN,

        ROLE.RECEPTIONIST,

        ROLE.DOCTOR

    ],

    CREATE: [

        ROLE.ADMIN

    ],

    EDIT: [

        ROLE.ADMIN

    ],

    DELETE: [

        ROLE.ADMIN

    ],

    VIEW_SCHEDULE: [

        ROLE.ADMIN,

        ROLE.DOCTOR,

        ROLE.RECEPTIONIST

    ]

};