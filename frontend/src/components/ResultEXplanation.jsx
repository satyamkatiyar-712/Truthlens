import React, { useState, useEffect  } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from 'remark-breaks';

export default function ResultCard({ data , mode}) {


  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const verdict= data.verdict;
  const confidenceScore= data.confidenceScore


  useEffect(() => {
    if (!data?.explanation) return;

    if(data.isHistory){
       setDisplayedText(data.explanation);
       setIsTyping(false);
       return;
    }
    
    setDisplayedText("");
    setIsTyping(true);
    
    const fullText = data.explanation.trimStart(); 
    let i = 0;
    
    const typingInterval = setInterval(() => {
    
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      
      if (i >= fullText.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15); 

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
    <div className="w-full max-w-3xl mx-auto bg-black rounded-2xl p-6 shadow-2xl animate-fade-in-up text-lg">
      
<div className={`flex items-center justify-between  ${verdict != null && confidenceScore != null ? "border-b border-slate-600 mb-6 pb-4" : "mb-1 pb-1"}`}>
       {verdict!=null &&  <div className={`px-4 py-1.5 rounded-full border font-bold text-sm tracking-wide uppercase ${getVerdictStyle(data.verdict)}`}>
          {data.verdict === "True" && "✅ "}
          {data.verdict === "False" && "🚨 "}
          {data.verdict === "Misleading" && "⚠️ "}
          {data.verdict}
        </div>}
        
       {confidenceScore!=null &&  <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Confidence:</span>
          <span className="text-white font-bold">{data.confidenceScore}%</span>
        </div>}
      </div>

    {/* Tera div waisa ka waisa hi rahega (mb-6 ya mb-4 jo tujhe pasand tha) */}
{/* Yahan se prose ki classes hata di aur direct HTML tags pe style laga diya */}
<div className="text-slate-300 leading-relaxed 
          [&>p]:mb-6 
          [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-4 
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-4 [&>ol>li]:pl-1
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-4 
          [&>strong]:font-bold [&>strong]:text-white
          [&>table]:w-full [&>table]:border-collapse [&>table]:my-6 [&>table]:text-sm
          [&_th]:border [&_th]:border-slate-600 [&_th]:bg-slate-800/80 [&_th]:p-3 [&_th]:text-left [&_th]:text-slate-200
          [&_td]:border [&_td]:border-slate-700/50 [&_td]:p-3 hover:[&_tr]:bg-slate-800/30 transition-colors
      ">
      
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {displayedText}
  </ReactMarkdown>

</div>

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
