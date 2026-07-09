import Searchbox from "./Searchbox";
import ResultCard from "./ResultEXplanation";
import { useState ,useEffect } from "react";



const Wholerightsec = ({selectedHistoryItem,resetSignal,onSearchSuccess}) => {
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [mode, setMode] = useState("chat")

  useEffect(() => {
    if (selectedHistoryItem) {
      setResultData({...selectedHistoryItem,isHistory:true});
      if (selectedHistoryItem.mode) setMode(selectedHistoryItem.mode);
    }
  }, [selectedHistoryItem])

  useEffect(() => {
    if (resetSignal > 0) {
      setResultData(null)
      setMode("chat")
    }
  }, [resetSignal])

  return (
    <div className=" w-full h-screen flex-1 flex flex-col ">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6 pb-20 text-white">
          {!resultData && !loading && (
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

          {loading && (
            <div className="flex flex-col items-center justify-center w-full mt-32 animate-fade-in">
              {mode === "chat" ? (
                // ⚡ Fast Chat Mode Loading
                <div className="flex flex-col items-center gap-6">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
                    {/* Muted White/Silver Spinner */}
                    <div className="absolute inset-0 border-r-2 border-b-2 border-slate-400 rounded-full animate-spin opacity-70 duration-1000"></div>
                    {/* Muted Core */}
                    <div className="w-4 h-4 bg-slate-300 rounded-full shadow-[0_0_12px_rgba(203,213,225,0.3)] animate-pulse z-10"></div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1.5">
                      <p className="text-lg font-bold tracking-[0.2em] uppercase text-slate-300">
                        Thinking
                      </p>
                      <span className="flex gap-1 mb-1.5">
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Consulting the digital oracle...
                    </p>
                  </div>
                </div>
              ) : (
                
                <div className="flex flex-col items-center gap-6">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>

                    <div className="absolute inset-0 rounded-full border-t-2 border-slate-400 animate-spin duration-700 shadow-[0_-3px_10px_rgba(203,213,225,0.2)]"></div>
                    <div className="w-3 h-3 bg-slate-400/30 rounded-full animate-ping absolute"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full z-10"></div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1.5">
                      <p className="text-lg font-bold tracking-[0.2em] uppercase text-slate-300">
                        Verifying
                      </p>
                      <span className="flex gap-1 mb-1.5">
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Scanning sources for truth...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {resultData && !loading && <ResultCard data={resultData} />}
        </div>
      </div>

      <div className="shrink-0 p-4 bg-linear-to-t from-[#2f2f2f] via-[#161616] to-transparent">
        <div className="max-w-3xl mx-auto">
          <Searchbox
            onReceiveData={setResultData}
            loading={loading}
            setLoading={setLoading}
            mode={mode}
            setMode={setMode}
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
