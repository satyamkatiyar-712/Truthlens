import React, { useState, useEffect  } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResultCard({ data }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!data?.explanation) return;

    if(data.isHistory){
       setDisplayedText(data.explanation);
       setIsTyping(false);
       return;
    }
    
    setDisplayedText("");
    setIsTyping(true);
    
    // AI kabhi kabhi shuru me extra spaces/newlines bhejta hai, unhe hata do
    const fullText = data.explanation.trimStart(); 
    let i = 0;
    
    const typingInterval = setInterval(() => {
      // Humesha 0 se lekar current index tak ka hissa kaat kar dikhao
      // Isse 'prev' state wali galti nahi hogi
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      
      if (i >= fullText.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15); // 15ms gives a very smooth ChatGPT-like typing feel

    return () => clearInterval(typingInterval);
  }, [data]);

  if (!data) return null;

  // Verdict Colors Logic
  const getVerdictStyle = (verdict) => {
    if (verdict === "True") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (verdict === "False") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (verdict === "Chat") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"; // Misleading/Not Enough Evidence
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-black rounded-2xl p-6 shadow-2xl animate-fade-in-up">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
        <div className={`px-4 py-1.5 rounded-full border font-bold text-sm tracking-wide uppercase ${getVerdictStyle(data.verdict)}`}>
          {data.verdict === "True" && "✅ "}
          {data.verdict === "False" && "🚨 "}
          {data.verdict === "Misleading" && "⚠️"}
          {data.verdict}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Confidence:</span>
          <span className="text-white font-bold">{data.confidenceScore}%</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none 
          prose-p:leading-relaxed prose-p:mb-4 prose-p:mt-0
          prose-ul:my-2 prose-ul:list-disc prose-li:my-0.5 
          prose-ol:my-2 prose-ol:list-decimal
          prose-headings:text-white prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3
          prose-strong:text-white prose-strong:font-bold
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
          
          /* 📊 PREMIUM TABLE STYLING */
          prose-table:w-full prose-table:border-collapse prose-table:my-5 prose-table:text-sm
          prose-th:border prose-th:border-slate-600 prose-th:bg-slate-800/80 prose-th:p-3 prose-th:text-left prose-th:text-slate-200
          prose-td:border prose-td:border-slate-700/50 prose-td:p-3 prose-td:text-slate-300 hover:prose-tr:bg-slate-800/30 transition-colors
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>
      </div>

      {/* 🔵 BOTTOM: Sources (Links) - Sirf tab dikhega jab typing khatam ho jaye */}
      {!isTyping && data.sources?.length > 0 && (
        <div className="mt-8 pt-4 border-t border-slate-700/50 animate-fade-in">
          <p className="text-slate-400 text-sm mb-3 font-semibold">🔍 Verified Sources:</p>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-blue-300 transition-colors"
              >
                🌐 {source.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
