export interface Approval {
_id: string;
firstName: string;

lastName: string;

email: string;

phone: string;

roleId: {
    name: string;
};

isVerified: boolean;

department: string;

designation: string;

joiningDate: string;

approvalStatus:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';

createdAt: string;

updatedAt: string;

/* Doctor Fields */

specialization?: string;

qualification?: string;

consultationFee?: number;

medicalRegistrationNo?: string;

experienceYears?: number;

}
