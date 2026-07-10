import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import toast from "react-hot-toast";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Step 1: Request OTP from Backend
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email format! 📧");
      return;
    }

    setLoading(true);
    try {
      // 🚨 TERA BACKEND ROUTE: Yahan Node.js se user ki email par OTP bhejna
      const response = await api.post("http://localhost:3000/api/user/send-otp", {
        email: formData.email,
        name: formData.name
      });
      
      if (response.data.success) {
        toast.success(`OTP sent to ${formData.email} 📩`);
        setStep(2); // Move to OTP screen
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to send OTP!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Account
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    
    if (formData.otp.length < 4) {
      toast.error("Please enter a valid OTP!");
      return;
    }

    setLoading(true);
    try {
      // 🚨 TERA BACKEND ROUTE: Yahan OTP verify karke DB me save karna
      const response = await api.post("http://localhost:3000/api/user/signup", formData);
      
      if (response.data.success) {
        toast.success("Account verified & created successfully! 🎉");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Invalid OTP or Signup failed!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#000000] relative overflow-hidden font-sans text-gray-200">
      
      {/* Spotlight Effect */}
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
        
        {/* Left Side: Truthlens branding */}
        <div className="hidden lg:flex w-full lg:w-1/2 pr-12 h-full flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Sparkles className="text-black" size={16} />
             </div>
             <span className="font-bold tracking-widest text-white text-sm uppercase">Truthlens</span>
          </div>
          <h1 className="text-5xl font-serif text-white mb-8 leading-tight">
            Join the Truthlens <br/> community today
          </h1>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            Create an account to start verifying claims and accessing advanced AI insights. Your journey toward truth starts here.
          </p>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex flex-col items-center justify-center w-full mb-8 mt-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                 <Sparkles className="text-black" size={20} />
              </div>
              <span className="font-bold tracking-widest text-white text-lg uppercase">Truthlens</span>
           </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full sm:w-105 lg:mt-16 lg:mr-20 mx-auto lg:mx-0">
          <div className="relative bg-[#111111]/40 backdrop-blur-xl rounded-4xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-r border-t-white/10 border-r-white/10 border-b border-l border-b-white/5 border-l-white/5 overflow-hidden min-h-112.5 flex flex-col justify-center">
            
            <div className="absolute top-0 right-0 w-75 h-75 bg-white/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full">
              
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  // ================= STEP 1: INITIAL DETAILS =================
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
                      <p className="text-[11px] text-gray-400">Join us to start fact-checking.</p>
                    </div>

                    <form onSubmit={handleSendOTP} className="space-y-3 w-full">
                      <input
                        type="text" name="name" placeholder="Full Name"
                        value={formData.name} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                      />
                      <input
                        type="email" name="email" placeholder="Enter your email address"
                        value={formData.email} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                      />
                      <input
                        type="password" name="password" placeholder="Create a password"
                        value={formData.password} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                      />

                      <button
                        type="submit" disabled={loading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)] mt-4"
                      >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify Email"}
                      </button>
                    </form>

                    <div className="flex items-center gap-3 w-full my-5 opacity-60">
                      <div className="h-px bg-gray-700 flex-1" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">OR</span>
                      <div className="h-px bg-gray-700 flex-1" />
                    </div>

                    <p className="text-center text-gray-500 text-[11px] mt-2">
                      Already have an account?{" "}
                      <Link to="/login" className="text-white hover:text-gray-300 font-medium transition-colors">
                        Log in
                      </Link>
                    </p>
                  </motion.div>
                ) : (
                  // ================= STEP 2: OTP VERIFICATION =================
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full flex flex-col items-center"
                  >
                    <button 
                      onClick={() => setStep(1)} 
                      className="self-start mb-4 text-gray-400 hover:text-white flex items-center gap-1 text-xs transition-colors"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <div className="w-12 h-12 mb-4 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                       <span className="text-2xl">✉️</span>
                    </div>

                    <div className="text-center mb-6 w-full">
                      <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        We've sent a 6-digit verification code to <br/>
                        <span className="text-white font-medium">{formData.email}</span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyAndSignup} className="space-y-4 w-full">
                      <input
                        type="text" name="otp" placeholder="Enter OTP"
                        value={formData.otp} onChange={handleChange} required
                        maxLength="6"
                        className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white text-center tracking-[0.5em] font-mono text-lg rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-600 placeholder:tracking-normal shadow-inner"
                      />

                      <button
                        type="submit" disabled={loading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify & Create Account"}
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

export default Signup;