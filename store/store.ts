import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import doctorReducer from "./slices/doctorSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        doctor: doctorReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;