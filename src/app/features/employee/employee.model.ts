export interface EmployeesResponse{
    employeeCode: string;
    department: string;
    designation: string;
    joiningDate: string;
    userId:{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        roleId:{
            name: string;
        }
    }
}
export interface EmployeeExistsResponse {
    exist: boolean;
}

// Sub-model for User Core Data
export interface UserInfoModel {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roleName: string;
    password?: string;
}

// Sub-model for professional employment metadata
export interface EmployeeInfoModel {
    department: string;
    designation: string;
    joiningDate: string ;
}

// Unified Top-Level Payload Model
export interface CreateEmployeePayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roleName: string;
    department: string;
    designation: string;
    joiningDate: string;
}