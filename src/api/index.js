import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL_PROD || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 5000,
  withCredentials: true,
});

export default axiosInstance;
