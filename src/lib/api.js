import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("API request interceptor - token:", token ? "Present" : "Missing");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Authorization header set:", config.headers.Authorization);
  }
  return config;
});

// Auto-handle auth errors: clear creds and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    if (status === 401 && message.toLowerCase().includes("invalid token")) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {}
      // Redirect to login to refresh token
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
