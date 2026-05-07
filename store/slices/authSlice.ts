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
            state.user = action.payload.user || null;
            state.token = action.payload.token;
            state.role = action.payload.roles[0];
            state.isAuthenticated = true;
        },
        setUserFromReload: (state, action: PayloadAction<{ user: User | null; role: string; token: string }>) => {
            state.user = action.payload.user;
            state.role = action.payload.role;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        }, updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
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
    updateUser,
    logout
} = authSlice.actions;
export default authSlice.reducer;