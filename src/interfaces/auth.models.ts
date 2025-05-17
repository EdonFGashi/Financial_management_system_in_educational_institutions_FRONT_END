// auth.models.ts

export interface UserInfoDto {
    email: string;
    fullName: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ApiResponse<T> {
    succeeded: boolean;
    statusCode: number;
    message: string;
    data: T;
}