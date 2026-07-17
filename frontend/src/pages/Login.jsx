import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import toast from "react-hot-toast";
import { Loader2, Sparkles, Mic, UploadCloud, Link as LinkIcon, Play, Camera, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/user/signin", formData);
      if (response.data.success) {
        toast.success("Welcome back! 🚀");
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Network error!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // MAIN BACKGROUND: Pure Black for the whole page
    <div className="min-h-screen flex bg-[#000000] relative overflow-hidden font-sans text-gray-200">
      
      {/* ================================== */}
      {/* 1. THE SPOTLIGHT BEAM EFFECT */}
      {/* ================================== */}
      <div className="absolute top-[-10%] right-[10%] w-125 h-125 bg-white opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div 
        className="absolute top-[-50%] right-[15%] w-100 h-[200vh] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(40deg)',
          transformOrigin: 'top center',
          filter: 'blur(40px)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 50%, transparent)'
        }}
      />

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 relative z-10 h-full">
        
        {/* ================================== */}
        {/* LEFT SECTION (Truthlens Content) */}
        {/* ================================== */}
        {/* 'hidden lg:flex' ensures it disappears below 1024px */}
        <div className="hidden lg:flex w-full lg:w-1/2 pr-0 lg:pr-12 mb-12 lg:mb-0 h-full flex-col justify-center">
          
          {/* Top Logo */}
          <div className="flex items-center gap-3 mb-10">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Sparkles className="text-black" size={16} />
             </div>
             <span className="font-bold tracking-widest text-white text-sm uppercase">Truthlens</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
            One Click Away from <br/> Verified Truth
          </h1>

          {/* THE PREMIUM WHITE FLOATING CARD */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(255,255,255,0.1)] relative"
          >
            {/* Top Tabs inside card */}
            <div className="flex gap-4 mb-5 border-b border-gray-100 pb-3">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
                <Mic size={16} /> Speak to Search
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 text-gray-400 hover:text-gray-600 rounded-full text-sm font-medium transition-colors">
                <UploadCloud size={16} /> Upload File
              </button>
            </div>

            {/* Content Text */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Unlock the power of intelligent fact-checking. Paste an article, record a claim, or provide a video link. Our AI cross-references millions of verified sources instantly to expose misinformation.
            </p>

            {/* Bottom Option Pills */}
            <div className="flex flex-wrap items-center gap-3">
               <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold transition-colors shadow-sm border border-gray-200/80">
                 <LinkIcon size={14} className="text-blue-500" /> Upload Links
               </button>
                <ArrowRight size={16} className="text-gray-400 ml-1" />
               <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold transition-colors shadow-sm border border-gray-200/80">
                 <Play size={14} className="text-red-500" /> YouTube
               </button>
               <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold transition-colors shadow-sm border border-gray-200/80">
                 <Camera size={14} className="text-pink-500" /> Instagram
               </button>
            </div>
          </motion.div>

        </div>

        {/* MOBILE ONLY LOGO (Shows below 1024px) */}
        <div className="lg:hidden flex flex-col items-center justify-center w-full mb-8 mt-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                 <Sparkles className="text-black" size={20} />
              </div>
              <span className="font-bold tracking-widest text-white text-lg uppercase">Truthlens</span>
           </div>
        </div>


        <div className="w-full sm:w-105 lg:mt-8 lg:mr-8 mx-auto lg:mx-0">
          
          <div className="relative bg-[#111111]/40 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-r border-t-white/10 border-r-white/10 border-b border-l border-b-white/5 border-l-white/5 overflow-hidden">
            
            {/* INCREASED INNER GLOW */}
            <div className="absolute top-0 right-0 w-75 h-75 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[15%] w-37.5 h-62.5 bg-white/5 blur-[50px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              
              <div className="w-10 h-10 mb-3 rounded-2xl flex items-center justify-center opacity-80">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" strokeDasharray="3 3"/>
                  <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-[11px] text-gray-400">Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 w-full">
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-white/5 text-white rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all placeholder:text-gray-500 text-sm shadow-inner"
                  />
                </div>

                <div className="flex justify-end pt-1 pb-1">
                  <Link to="/forgot-password" className="text-[11px] text-gray-500 hover:text-white transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign in"}
                </button>
              </form>

              <div className="flex items-center gap-3 w-full my-5 opacity-60">
                <div className="h-px bg-gray-700 flex-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">OR</span>
                <div className="h-px bg-gray-700 flex-1" />
              </div>

              <button 
                type="button" 
                className="w-full bg-[#1a1a1a]/60 hover:bg-[#222] border border-white/5 text-gray-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-gray-500 text-[11px] mt-5">
                Don't have an account?{" "}
                <Link to="/signup" className="text-white hover:text-gray-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;