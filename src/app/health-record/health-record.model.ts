export interface HealthRecordRow {
    _id: string;              // Mongoose tracking document ID
    healthrecordId: string;   // Your custom generated ID string (e.g., 'HR-10024')
    diagnosis: string;
    prescription: string;
    notes?: string;
    createdAt: string;

    patientId: {
        _id: string;
        userId: {
            firstName: string;
            lastName: string;
            email: string;
        };
    };

    doctorId: {
        _id: string;
        employeeId: {
            _id: string;
            department: string;
            designation: string;
            userId: {
                firstName: string;
                lastName: string;
            };
        };
    };
}
/*
* Response for mapping all health records 
*/
export interface HealthRecordResponse {
    records: HealthRecordRow[];
    pagination: {
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}
/**
 * Base wrapper layout matching your backend utility response standard.
 */
export interface SingleHealthRecordResponse {
    statusCode: number;
    data: DetailedHealthRecord;
    success: boolean;
    message?: string;
}

/**
 * Main Health Record Schema layout structure.
 */
export interface DetailedHealthRecord {
    _id: string;
    healthrecordId: string; // e.g., "HRXAZ11"
    diagnosis: string;
    prescription: string;
    notes?: string;
    createdBy: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    __v: number;

    // Relational sub-object dependencies maps
    appointmentId?: AppointmentMeta;
    patientId: PatientProfile;
    doctorId: DoctorProfile;
}

/**
 * Unified Account Structural Identity Base Template.
 */
interface BaseUserIdentity {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

/**
 * Patient demographic details container schema mapping.
 */
export interface PatientProfile {
    _id: string;
    userId: BaseUserIdentity;
    UHID: string; // e.g., "PAT-000024"
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dob: string | Date;
    bloodGroup: string; // e.g., "A+"
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    __v: number;
}

/**
 * Doctor specialization and professional baseline settings mapper.
 */
export interface DoctorProfile {
    _id: string;
    employeeId: EmployeeRegistryRecord;
    specialization: string; // e.g., "Cardiology"
    qualification: string; // e.g., "MBBS, MD"
    consultationFee: number;
    medicalRegistrationNo: string;
    availabilityStartTime: string;
    availabilityEndTime: string;
    experienceYears: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    __v: number;
}

/**
 * Core clinical employee directory registry parameters record.
 */
export interface EmployeeRegistryRecord {
    _id: string;
    userId: Pick<BaseUserIdentity, '_id' | 'firstName' | 'lastName'>;
    employeeCode: string; // e.g., "DOC-000010"
    department: string; // e.g., "OPD"
    designation: string; // e.g., "Cardiologist"
    status: boolean;
    joiningDate: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
    __v: number;
}

/**
 * Appointment tracking meta information timeline payload link.
 */
export interface AppointmentMeta {
    _id: string;
    appointmentId: string; // e.g., "APTNBILZ"
    appointmentDate: string | Date;
    appointmentTime: string; // e.g., "09:30"
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}