import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastState {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface UIState {
    toast: ToastState;
}

const initialState: UIState = {
    toast: {
        visible: false,
        message: '',
        type: 'info',
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showToast: (state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' }>) => {
            state.toast.visible = true;
            state.toast.message = action.payload.message;
            state.toast.type = action.payload.type ?? 'info';
        },
        hideToast: (state) => {
            state.toast.visible = false;
        },
    },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
