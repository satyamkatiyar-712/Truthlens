import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0); 
  const stepRefs = useRef([]); 

  const flowSteps = [
    { title: "Ingestion", desc: "Drop any viral text, news headline, or dubious image directly into the engine." },
    { title: "Context Mapping", desc: "Our Gatekeeper AI strips the noise, detecting the core intent and language of the claim." },
    { title: "Global Cross-Reference", desc: "Instantly scans thousands of verified news outlets, databases, and fact-checkers." },
    { title: "The Verdict", desc: "A definitive, source-backed breakdown of exactly what's true and what's fabricated." }
  ];

  // 🚨 SCROLL ANIMATION LOGIC (Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.dataset.index));
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 } 
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden relative">
      
    
      <div className="absolute top-[-10%] right-[-5%] w-200 h-200 bg-white/10 blur-[200px] rounded-full pointer-events-none z-0" />

     
      <nav className="fixed top-0 w-full max-w-7xl z-50 bg-white/0.5 backdrop-blur-2xl">
        <div className="px-8 h-20 flex items-center justify-between relative z-10">
          <div className="text-2xl font-bold tracking-tight text-white">
            TruthLens
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* 🎬 HERO & VIDEO SECTION */}
      <main className="pt-40 pb-20 px-6 flex flex-col items-center text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-16 bg-linear-to-b from-white to-neutral-600 bg-clip-text text-transparent relative z-10">
          See ThrouGh the Noise.
        </h1>
        
        <div className="relative w-[95%] aspect-16/10 bg-black cursor-crosshair rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 rounded-2xl border-t border-l border-white z-20 pointer-events-none opacity-40" 
            style={{ 
              WebkitMaskImage: 'radial-gradient(ellipse 80% 90% at top left, black 10%, transparent 80%)', 
              maskImage: 'radial-gradient(ellipse 40% 90% at top left, black 10%, transparent 80%)' 
            }} 
          />
          <div className="relative w-full h-full rounded-xl flex items-start justify-center">
            <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-b from-transparent from-0% via-[#0a0a0a]/80 via-60% to-[#0a0a0a] to-90%"></div>
            <img 
              src="/images/truthlens.webp" 
              alt="truthlens"  
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </main>

      {/* 🧠 WHAT TRUTHLENS DOES */}
      <section className="py-24 px-6 max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-medium text-white mb-6">The definitive truth engine.</h2>
        <p className="text-neutral-400 leading-relaxed text-lg">
          The internet is saturated with deepfakes, manipulated news, and context-twisted media. TruthLens operates as your personal verification layer. Input any claim, and our engine breaks it down, cross-references global databases, and delivers the absolute truth in seconds. No biases, just data.
        </p>
      </section>

      {/* 🔄 THE PIPELINE FLOW */}
      <section className="pt-24 pb-8 px-6 max-w-4xl mx-auto border-t border-neutral-900 relative z-10">
        <h3 className="text-xl text-neutral-500 font-medium mb-16 tracking-wide text-center md:text-left">SYSTEM WORKFLOW</h3>
        
        <div className="flex flex-col relative max-w-2xl mx-auto md:mx-0">
          {flowSteps.map((step, index) => (
            <div 
              key={index}
              ref={(el) => (stepRefs.current[index] = el)} 
              data-index={index}
              className={`relative flex gap-8 md:gap-12 pb-24 transition-all duration-700 ${activeStep === index ? 'opacity-100' : 'opacity-30'}`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border transition-all duration-700 z-10 bg-black ${activeStep === index ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-125' : 'border-neutral-700'}`} />
                {index !== flowSteps.length - 1 && (
                  <div className="w-px h-full absolute top-3 bg-neutral-900">
                    <div className={`w-full bg-linear-to-b from-white to-transparent transition-all duration-1000 ${activeStep >= index ? 'h-full opacity-100' : 'h-0 opacity-0'}`} />
                  </div>
                )}
              </div>
              <div className={`-mt-1 transition-transform duration-700 ${activeStep === index ? 'translate-x-2' : ''}`}>
                <div className="text-xs text-neutral-500 font-mono mb-2 tracking-widest uppercase">
                  PHASE 0{index + 1}
                </div>
                <h4 className={`text-2xl font-medium mb-3 transition-colors duration-700 ${activeStep === index ? 'text-white' : 'text-neutral-500'}`}>
                  {step.title}
                </h4>
                <p className="text-neutral-500 max-w-md leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full">
    
        <div className="relative w-full flex justify-center overflow-hidden -mt-[30%] sm:-mt-[20%] md:-mt-[30%] lg:-mt-[23%]">
          
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            preload="auto"
            className="w-[140%] md:w-[110%] lg:w-[95%] max-w-7xl h-auto mix-blend-screen opacity-90 block translate-y-[26%] sm:translate-y-[28%] md:translate-y-[27%] lg:translate-y-[27%]"
          >
            <source src="/vedio/saturn.webm" type="video/webm" />

            <source src="/vedio/saturn.mp4" type="video/mp4" />
          </video>

          {/* 2. THE CURVE (Absolute Bottom) */}
          <div className="absolute bottom-0 left-0 w-full leading-none translate-y-px z-10">
            <svg 
              viewBox="0 0 1440 100" 
              fill="none" 
              preserveAspectRatio="none" 
              className="w-full h-8 md:h-12 lg:h-16 pointer-events-none"
            >
              <path d="M0 0 Q720 100 1440 0 V100 H0 V0Z" fill="black" />
              <path d="M0 0 Q720 100 1440 0" stroke="#262626" strokeWidth="1" />
            </svg>
          </div>
          
        </div>

        {/* 🦶 THE FOOTER TEXT */}
        <footer className="w-full bg-black pt-10 pb-10 px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              TruthLens
            </h2>
            
            <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
              The definitive truth engine. Revealing facts, eliminating noise, and mapping context with absolute precision.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-neutral-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <div className="w-full h-px bg-neutral-900 my-6"></div>
            
            <p className="text-xs text-neutral-600">
              © {new Date().getFullYear()} TruthLens Inc. All rights reserved.
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
}