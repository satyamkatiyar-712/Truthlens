import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react'; 
import api from './axiosConfig';   
import Homepage from './pages/Homepage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/Forgotpassword';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoutes';

const App = () => {

  useEffect(() => {
    const verifySession = async () => {
      try {
         await api.get(`/api/user/check-auth?t=${new Date().getTime()}`); 
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("isAuthenticated");
          
          const currentPath = window.location.pathname;
          console.log(currentPath)
          const publicPages = ["/login", "/signup", "/forgot-password"];
          
          // Agar user public page par NAHI hai, tabhi login par phekna hai
          if (!publicPages.includes(currentPath)) {
            window.location.href = "/login";
          }
        }
      }
    };

    verifySession();
    const interval = setInterval(verifySession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);


  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px',
            padding: '12px 24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          }
        }}
      />

      <div className='bg-black max-w-7xl mx-auto min-h-screen'>
        <Routes>
          <Route path='/' element={
               <ProtectedRoute>
                  <Homepage/>
               </ProtectedRoute>
            } />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </>
  )
}

export default App;