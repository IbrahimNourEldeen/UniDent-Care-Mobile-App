import axios from "axios";
import * as SecureStore from 'expo-secure-store';

const axiosInstance = axios.create({
    baseURL: "https://dental-hup1.runasp.net/api/",
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync("token");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;