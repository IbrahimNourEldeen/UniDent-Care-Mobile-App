import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

const apiV2 = axios.create({
    baseURL: "https://dental-hup1.runasp.net/api/v2/",
});

apiV2.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error fetching token from SecureStore", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiV2.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn(`[API V2] 401 Unauthorized for: ${error.config?.url}`);
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("publicId");
            await SecureStore.deleteItemAsync("role");
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

export default apiV2;
