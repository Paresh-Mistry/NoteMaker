import axios from "axios";

export const apiInstance = axios.create({
  baseURL: "/api", // your backend base path
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Response interceptor for global error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
