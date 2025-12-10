import axios, {
	AxiosResponse,
	AxiosError,
	InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

// 🔐 Request Interceptor
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem("authToken");
		if (token && config.headers) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error)
);

// ⚠️ Response Interceptor
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("authToken");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
