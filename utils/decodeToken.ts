import { jwtDecode } from "jwt-decode";

export interface UserPayload {
    publicId: string;
    role: string;
}

export const getDecodedToken = (token: string | null): UserPayload | null => {
    if (!token) return null;

    try {
        const decoded: any = jwtDecode(token);

        const publicId = 
            decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
            decoded["sub"] || 
            decoded["id"];
        
        let role = 
            decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
            decoded["role"] || 
            decoded["roles"];
            
        if (Array.isArray(role)) {
            role = role[1] || role[0];
        }

        if (!publicId || !role) {
            console.warn("Decoded token is missing publicId or role:", { publicId, role });
            return null;
        }

        return { publicId, role };
    } catch (error) {
        console.error("Token decoding failed:", error);
        return null;
    }
};