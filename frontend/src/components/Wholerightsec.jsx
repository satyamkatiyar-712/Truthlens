import Searchbox from "./Searchbox";
import ResultCard from "./ResultEXplanation";
import { useState, useEffect, useRef } from "react"; 
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // 🚨 1. Sirf Lottie import add kiya

// 🚨 2. Premium messages ke liye chota function (Bahar rakha hai taaki tere main code ko na chhede)
const FactLoadingMessages = () => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Extracting core claim...",
    "Scanning global databases...",
    "Cross-referencing sources...",
    "Analyzing context...",
    "Preparing final verdict..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="mt-1 ml-2 text-slate-400 text-xs font-medium tracking-widest animate-pulse uppercase">
      {messages[index]}
    </p>
  );
};

const Wholerightsec = ({selectedHistoryItem, selectedHistoryId, resetSignal, onSearchSuccess}) => {
  const [loading, setLoading] = useState(false)
  const [messagesList, setMessagesList] = useState([])
  const [mode, setMode] = useState("chat")
  
  const [tempUserClaim, setTempUserClaim] = useState("") 
  const latestClaimRef = useRef("") 
  const messagesEndRef = useRef(null)

  // 🚨 CHANGED: Scroll logic ab smart ho gaya hai (Tera hi logic hai)
  useEffect(() => {
    // Agar naya claim type ho raha hai ya AI soch raha hai -> Smooth scroll
    if (tempUserClaim || loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } else {
      // History kholne par -> Turant (Instant) scroll
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    }
  }, [messagesList, tempUserClaim, loading])

  useEffect(() => {
    if (selectedHistoryItem) {
      const historyMessages = (selectedHistoryItem.messages || []).map(msg => ({
        ...msg,
        isHistory: true 
      }));
      setMessagesList(historyMessages);
      if (selectedHistoryItem.mode) setMode(selectedHistoryItem.mode);
    }
  }, [selectedHistoryItem])

  useEffect(() => {
    if (resetSignal > 0) {
      setMessagesList([]) 
      setMode("chat")
      setTempUserClaim("") 
      latestClaimRef.current = "" 
    }
  }, [resetSignal])

  const handleSearchStart = (text) => {
    setTempUserClaim(text);
    latestClaimRef.current = text; 
  };

  const handleReceiveNewData = (newData) => {
    if (newData) {
      // 🚨 FIX: Yahan se ref ko clear (empty) karne ka code hata diya hai taaki text gayab na ho
      setMessagesList(prev => [...prev, { ...newData, userClaim: latestClaimRef.current }]);
      setTempUserClaim(""); 
    }
  };

  return (
    <div className=" w-full h-screen flex-1 flex flex-col ">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6 pb-20 text-white relative">
          
          {messagesList.length === 0 && !loading && !tempUserClaim && (
            <>
              <div className="text-center mt-20 text-slate-400">
                <h2 className="text-lg sm:text-xl font-bold text-slate-200 mb-2 text-center transition-all duration-300">
                  {mode === "chat"
                    ? "⚡ Get lightning-fast responses in Chat Mode!"
                    : "🕵️‍♂️ Verify claims and debunk rumors in Fact-Check Mode!"}
                </h2>
                <p className="text-slate-400 text-sm text-center mb-6">
                  {mode === "chat"
                    ? "Ask me anything, write code, or just chat normally."
                    : "Attach a screenshot or type a viral claim below to find the truth."}
                </p>
              </div>
              <div className="text-center mt-16">
                <button className="py-3 px-5 bg-white/20 rounded-2xl backdrop-blur-lg mr-4 hover:bg-white/30 transform duration-200 ease-in-out">
                  {mode === "chat" ? "Build Roadmap" : "Bust Myth"}
                </button>
                <button className="py-3 px-5 bg-white/20 rounded-2xl backdrop-blur-lg mr-4  hover:bg-white/30 transform duration-200 ease-in-out">
                  {mode === "chat" ? "Plan Routine" : "Verify Leak"}
                </button>
                <button className="py-3 px-5 bg-white/20 rounded-2xl backdrop-blur-lg  hover:bg-white/30 transform duration-200 ease-in-out">
                  {mode === "chat" ? "Explain Simply" : "Spot Scam"}
                </button>
              </div>
              <div className="text-center">
                <button className="py-3 px-5 bg-white/20 rounded-2xl backdrop-blur-lg mr-4  hover:bg-white/30 transform duration-200 ease-in-out">
                  {mode === "chat" ? "Debug Code" : "Real/Fake?"}
                </button>
                <button className="py-3 px-5 bg-white/20 rounded-2xl backdrop-blur-lg mr-4  hover:bg-white/30 transform duration-200 ease-in-out">
                  {mode === "chat" ? "Write Email" : "Check History"}
                </button>
              </div>
            </>
          )}

          {/* PURANE MESSAGES */}
          {messagesList.length > 0 && (
            <div className="space-y-8">
              {messagesList.map((msg, index) => (
                <div key={index} className="flex flex-col space-y-4">
                  {msg.userClaim && (
                    <div className="flex justify-end">
                      <div className="bg-[#2f2f2f] text-slate-100 px-5 py-3 text-sm md:text-base rounded-3xl max-w-[85%] shadow-sm whitespace-pre-wrap">
                        {msg.userClaim}
                      </div>
                    </div>
                  )}
                  <ResultCard data={msg}  />
                </div>
              ))}
            </div>
          )}

          {/* TURANT BUBBLE AUR CHOTA LOADER */}
          {loading && (
            <div className={`flex flex-col space-y-4 ${messagesList.length === 0 ? 'mt-8' : 'mt-8'}`}>
              
              {tempUserClaim && (
                <div className="flex justify-end animate-fade-in">
                  <div className="bg-[#2f2f2f] text-slate-100 px-5 py-3 text-sm md:text-base rounded-3xl max-w-[85%] shadow-sm whitespace-pre-wrap">
                    {tempUserClaim}
                  </div>
                </div>
              )}

              {/* 🚨 3. SIRF YAHI DIV CHANGE KIYA HAI (Purane spinner ko hatakar Lottie lagaya) */}
              <div className="flex justify-start animate-fade-in pl-2">
                <div className="flex flex-col items-start">
                  <div className="w-20 h-20 -ml-2 -mt-2"> 
                    <DotLottieReact
                      src="https://lottie.host/1a93449f-6199-483c-ae56-9a20a07e1636/l5moj6frIA.lottie"
                      loop
                      autoplay
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </div>
                  {/* Custom messages sirf mode === "fact" me ayenge */}
                  {mode === "fact" && <FactLoadingMessages />}
                </div>
              </div>

            </div>
          )}

          {/* Invisible anchor target for scrolling */}
          <div ref={messagesEndRef} className="h-1" />
          
        </div>
      </div>

      <div className="shrink-0 p-4 bg-linear-to-t from-[#2f2f2f] via-[#161616] to-transparent">
        <div className="max-w-3xl mx-auto">
          <Searchbox
            onReceiveData={handleReceiveNewData} 
            onSearchStart={handleSearchStart} 
            loading={loading}
            setLoading={setLoading}
            mode={mode}
            setMode={setMode}
            selectedHistoryId={selectedHistoryId}
            onSearchSuccess={onSearchSuccess}
          />
        </div>
        <p className="text-center text-xs text-white/80 mt-3">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default Wholerightsec;