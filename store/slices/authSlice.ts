import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthData, User } from "../../types/types";
interface AuthState {
    user: User | null;
    token: string | null;
    role: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthData>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.roles[0];
            state.isAuthenticated = true;
        },
        setUserFromReload: (state, action: PayloadAction<{ user: User; role: string }>) => {
            state.user = action.payload.user;
            state.role = action.payload.role;
            state.isAuthenticated = !!action.payload.user;;
        }, logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
        },
    },
});
export const { login,
    setUserFromReload,
    logout
} = authSlice.actions;
export default authSlice.reducer;