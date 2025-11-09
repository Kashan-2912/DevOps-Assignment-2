import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    // functions
    signup: async ({ name, email, password, confirmPassword }) => {
        // first of all put loading true bcz signup in progress...
        set({ loading: true })

        // kinda middleware which check for pw and confirm pw...
        if (password !== confirmPassword) {
            set({ loading: false })
            return toast.error("Passwords do not match")
        }

        // if pw and confirm pw match then move forward...
        try {
            const res = await axios.post("/auth/signup", { name, email, password })
            set({ user: res.data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "An error occured.")
        }
    },

    login: async (email, password) => {
        set({ loading: true })
        try {
            const res = await axios.post("/auth/login", { email, password })
            set({ user: res.data, loading: false })
        } catch (error) {
            console.log("Entered in catch block of login")
            set({ loading: false })
            toast.error(error.response.data.message || "An error occured.")
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout")
            set({ user: null })
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occured during logout.")
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true })
        try {
            const res = await axios.get("/auth/profile")
            set({ checkingAuth: false, user: res.data })
        } catch (error) {
            set({ checkingAuth: false, user: null })
        }
    },

    refreshToken: async () => {
        // Prevent multiple simultaneous refresh attempts
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const response = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },
}))

// Implementing axios interceptors for refreshing access token so that user dont have to login again and again after 15min

let refreshPromise = null;

axios.interceptors.response.use(

    // abi tk 15min ni h oe access token k
    (response) => response,

    // yaha tk 15min access token k pory hoe for example and wo expire hojata h....
    async (error) => {
        const originalRequest = error.config;

        if (
            originalRequest.url.includes("/auth/login") ||
            originalRequest.url.includes("/auth/signup")
        ) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);