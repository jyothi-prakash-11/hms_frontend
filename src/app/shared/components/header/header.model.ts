export interface ProfileResponse {

    user: {

        _id: string;

        firstName: string;

        lastName: string;

        email: string;

        phone: string;

        roleId: string;

        isVerified: boolean;

        lastLoginAt: string | null;

        createdAt: string;

        updatedAt: string;

    };

    profile: {

        _id: string;

        userId: string;

        employeeCode: string;

        department: string;

        designation: string;

        status: boolean;

        joiningDate: string;

        createdAt: string;

        updatedAt: string;

    };

}