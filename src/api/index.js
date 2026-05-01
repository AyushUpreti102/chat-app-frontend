import axios from "axios";

const isProd = import.meta.env.VITE_NODE_ENV === "PROD";

const baseUrl = isProd
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 5000,
  withCredentials: true,
});

export default axiosInstance;
