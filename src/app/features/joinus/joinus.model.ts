export interface ApprovalStatusResponse {
    approvalExists: boolean;
    verified: boolean;
    status?: boolean;
}
export interface DepartmentResponse {
    departmentName: string;
}
export interface CreateApprovalRequest {

    firstname: string;

    lastname: string;

    email: string;

    phone: string;

    password: string;

    roleCode: string;

    department: string;

    designation: string;

    joiningDate: string;

    specialization?: string;

    qualification?: string;

    consultationFee?: number;

    medicalRegistrationNo?: string;

    experienceYears?: number;

}