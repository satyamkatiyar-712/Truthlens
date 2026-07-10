import axios from "axios";
import toast from "react-hot-toast";


const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, 
});

// Interceptor lagao
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const { code } = error.response.data;
      
      const currentPath = window.location.pathname;
      const publicPages = ["/login", "/signup", "/forgot-password"];

      if (!publicPages.includes(currentPath)) {
        
        if (code === "TOKEN_EXPIRED") {
          toast.error("Session expired! Please login again.");
          localStorage.removeItem("isAuthenticated");
          window.location.href = "/login";
          
        } else if (code === "NO_TOKEN") {
          localStorage.removeItem("isAuthenticated"); // Safe side
          window.location.href = "/login";
          
        } else {
          toast.error(error.response.data.message || "You don't have permission for this!");
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;