import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoutes';

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          // Global styling for all toasts
          style: {
            background: '#ffffff',     // White background
            color: '#0f172a',          // Dark slate (almost black, looks more premium)
            border: '1px solid #e2e8f0',
            borderRadius: '100px',     // Pill shape (like Apple notifications)
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px',         // Lamba text wrap hone se rokega
            padding: '12px 24px',      // Extra breathing room
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', // Smooth 3D shadow
          },
          // Customizing Error icon colors specifically
          error: {
            iconTheme: {
              primary: '#ef4444', // Red icon background
              secondary: '#ffffff', // White icon symbol
            },
          },
          // Customizing Success icon colors specifically
          success: {
            iconTheme: {
              primary: '#10b981', // Elegant green
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
        </Routes>
      </div>
    </>
  )
}

export default App;