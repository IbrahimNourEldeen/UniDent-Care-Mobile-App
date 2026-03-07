import { jwtDecode } from "jwt-decode";

export interface UserPayload {
    publicId: string;
    role: string;
}

export const getDecodedToken = (token: string | null): UserPayload | null => {
    if (!token) return null;

    try {
        const decoded: any = jwtDecode(token);

        return {
            publicId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        };
    } catch (error) {
        console.error("Token decoding failed:", error);
        return null;
    }
};