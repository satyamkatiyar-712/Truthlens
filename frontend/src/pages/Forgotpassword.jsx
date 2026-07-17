import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import toast from "react-hot-toast";
import { Loader2, Sparkles, ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // ==========================================
  // STEP 1: SEND OTP
  // ==========================================
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email format! 📧");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/user/forgot-password-otp", {
        email: formData.email,
      });
      
      if (response.data.success) {
        toast.success(`OTP sent to ${formData.email} 📩`);
        setStep(2); // OTP wale form par bhej do
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "User not found or failed to send OTP!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY OTP & RESET PASSWORD
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.otp.length < 4) {
      toast.error("Please enter a valid OTP!");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/user/reset-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        toast.success("Password reset successfully! 🎉 Please log in.");
        navigate("/login"); // Reset hone ke baad login pe phek do
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Invalid OTP or request expired!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#000000] relative overflow-hidden font-sans text-gray-200">
      
      {/* Spotlight Effect (Same as Login/Signup) */}
      <div className="absolute top-[-10%] right-[10%] w-125 h-125 bg-white opacity-5 blur-[120px] rounded-full pointer-events-none" />
      <div 
        className="absolute top-[-50%] right-[15%] w-100 h-[200vh] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(40deg)',
          filter: 'blur(40px)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 50%, transparent)'
        }}
      />

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 relative z-10 h-full">
        
       
        <div className="hidden lg:flex w-full lg:w-1/2 pr-12 h-full flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Sparkles className="text-black" size={16} />
             </div>
             <span className="font-bold tracking-widest text-white text-sm uppercase">Truthlens</span>
          </div>
          <h1 className="text-5xl font-serif text-white mb-8 leading-tight">
            Regain Access to <br/> The Truth
          </h1>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            Don't let a forgotten password stop you. Verify your identity and get back to fact-checking in seconds.
          </p>
        </div>

        
        <div className="lg:hidden flex flex-col items-center justify-center w-full mb-8 mt-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                 <Sparkles className="text-black" size={20} />
              </div>
              <span className="font-bold tracking-widest text-white text-lg uppercase">Truthlens</span>
           </div>
        </div>

    
        <div className="w-full sm:w-105 lg:mt-16 lg:mr-20 mx-auto lg:mx-0">
          <div className="relative bg-[#111111]/40 backdrop-blur-xl rounded-4xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-r border-t-white/10 border-r-white/10 border-b border-l border-b-white/5 border-l-white/5 overflow-hidden min-h-100 flex flex-col justify-center">
            
            <div className="absolute top-0 right-0 w-75 h-75 bg-white/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full">
              
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  // ================= STEP 1: ENTER EMAIL =================
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full flex flex-col items-center"
                  >
                    <div className="w-12 h-12 mb-4 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner">
                       <KeyRound size={24} className="text-white opacity-80" />
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
                      <p className="text-[11px] text-gray-400">Enter your email to receive an OTP.</p>
                    </div>

                    <form onSubmit={handleSendOTP} className="space-y-4 w-full">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                          type="email" name="email" placeholder="Enter your email address"
                          value={formData.email} onChange={handleChange} required
                          className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                        />
                      </div>

                      <button
                        type="submit" disabled={loading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)] mt-4"
                      >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send OTP"}
                      </button>
                    </form>

                    <Link to="/login" className="mt-6 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                      <ArrowLeft size={12} /> Back to Login
                    </Link>
                  </motion.div>
                ) : (
                  // ================= STEP 2: ENTER OTP & NEW PASSWORD =================
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full flex flex-col items-center"
                  >
                    <button 
                      onClick={() => setStep(1)} 
                      className="self-start mb-2 text-gray-400 hover:text-white flex items-center gap-1 text-xs transition-colors"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <div className="text-center mb-6 w-full mt-2">
                      <h2 className="text-xl font-bold text-white mb-2">Secure your account</h2>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Enter the code sent to <span className="text-white font-medium">{formData.email}</span>
                      </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-4 w-full">
                      <div>
                        <input
                          type="text" name="otp" placeholder="Enter 6-digit OTP"
                          value={formData.otp} onChange={handleChange} required maxLength="6"
                          className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white text-center tracking-[0.5em] font-mono text-lg rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-600 placeholder:tracking-normal shadow-inner"
                        />
                      </div>
                      
                      <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                          type="password" name="newPassword" placeholder="Enter new password"
                          value={formData.newPassword} onChange={handleChange} required
                          className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                        />
                      </div>

                      <button
                        type="submit" disabled={loading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Reset Password"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;