import axios from "axios";

const isProd = process.env.NODE_ENV === "PROD";

const baseUrl = isProd ? process.env.API_URL_PROD : process.env.API_URL_DEV;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 5000,
  withCredentials: true,
});

export default axiosInstance;
