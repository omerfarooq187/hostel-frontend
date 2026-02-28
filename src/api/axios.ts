import axios from "axios";

const api = axios.create({
  baseURL: "https://api.offhostel.org",
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid token globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Dispatch a custom event – AuthProvider will listen and log out
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

export default api;