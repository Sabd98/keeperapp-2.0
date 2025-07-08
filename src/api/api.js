import axios from "axios";

const baseUrl = "http://94.74.86.174:8080/api/";
const axiosInstance = axios.create({
  baseURL: baseUrl,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("[AXIOS] Using token:", token); // Debugging

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[AXIOS] Request headers:", config.headers); // Debugging
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("[AXIOS] Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("[AXIOS] Error:", error.config?.url, error.response?.status);

    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;