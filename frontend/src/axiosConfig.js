import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
  
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      const { code } = error.response.data;
      
      const currentPath = window.location.pathname;
      const publicPages = ["/login", "/signup", "/forgot-password","/"];

      if (!publicPages.includes(currentPath)) {
        
        if (code === "TOKEN_EXPIRED" && !originalRequest._retry) {
          originalRequest._retry = true; 

          try {
            await api.post("api/user/refresh-token"); 
            
            return api(originalRequest); 
            
          } catch (refreshError) {
            toast.error("Session expired! Please login again."); 
            localStorage.removeItem("isAuthenticated");
            window.location.href = "/login"; 
            
            return Promise.reject(refreshError);
          }
        } 
        
        
        else if (code === "NO_TOKEN" || code === "No_user") {
          localStorage.removeItem("isAuthenticated"); 
          window.location.href = "/login";
        } 
        else {
          toast.error(error.response.data.message || "You don't have permission for this!");
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;