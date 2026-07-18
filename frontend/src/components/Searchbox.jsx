import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaMicrophone } from "react-icons/fa6";
import { IoSendSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import api from "../axiosConfig";

const Searchbox = ({ onReceiveData,onSearchStart, loading, setLoading, mode, setMode , onSearchSuccess, selectedHistoryId }) => {
  const [claim, setClaim] = useState("");
  const [SelectedImage, setSelectedImage] = useState(null);
  const [PreviewUrl, setPreviewUrl] = useState(null);
  const [showModeList, setShowModeList] = useState(false);

  const fileInputRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
 
  useEffect(() => {
    if (transcript) {
      setClaim(transcript);
    }
  }, [transcript]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = null;
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleVerify = async () => {
    if(listening){
       SpeechRecognition.stopListening();
    }
    
    if (!claim && !SelectedImage){
       toast.error("Please enter a claim or attach an image first.");
       return;
    }

    if(onSearchStart) onSearchStart(claim.trim() || "Image Attached");

    setLoading(true);
    onReceiveData(null);
    
    const currentClaim = claim;
    const currentImage = SelectedImage;
    const currentClaimText = currentClaim.trim(); 
    
    setClaim("");
    setPreviewUrl(null);
    setSelectedImage(null);
    resetTranscript();

    const isAnyUrl = /^(https?:\/\/[^\s]+)/.test(currentClaimText);
    const isVideoLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be|instagram\.com)\/.+$/.test(currentClaimText);
    
    if (isAnyUrl && !isVideoLink) {
      setLoading(false); 
      toast.error("Only YouTube or Instagram video links are supported.");
      return; 
    }
    
    const formdata = new FormData();
    if (currentClaim) formdata.append("claim", currentClaimText);
    if (currentImage) formdata.append("image", currentImage);

    formdata.append("mode", mode);

    if (isVideoLink && !currentImage) {
      formdata.append("inputType", "videoUrl");  
    } else {
      formdata.append("inputType", "text");   
    }

    
    if (selectedHistoryId) {
      formdata.append("chatId", selectedHistoryId);
    }

    try {
      // PRO TIP: baseUrl already axiosConfig mein hai, toh sirf route likho
     const response = await api.post("/api/user/verify", formdata);

      const data = response.data;

      if (data.success) {
        onReceiveData(data.data);
        
    
        if(onSearchSuccess) {
          onSearchSuccess(data.chatId); 
        }
      } else {
        toast.error(data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Server Error!");
      } else {
        toast.error("Network error. Please check if backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {

    console.log("Browser Support:", browserSupportsSpeechRecognition, "Mic Available:", isMicrophoneAvailable);
    
    if (!browserSupportsSpeechRecognition) {
      toast.error("Your browser doesn't support voice search. Please use Chrome or Edge.");
      return; 
    }

    if (!isMicrophoneAvailable) {
    toast.error("Microphone access denied! Please allow mic permissions in the address bar");
    return;
  }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript(); 
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  const hasInput = claim.trim().length > 0 || SelectedImage !== null;

  return (
    <div>
      <div className="w-full border border-gray-300 rounded-4xl shadow-sm focus-within:shadow-md transition-shadow duration-200 p-4 bg-white/10 backdrop-blur-lg">
        
        {PreviewUrl && (
          <div className="pb-0 relative inline-block">
            <div className="relative group">
              <img
                src={PreviewUrl}
                alt="Upload preview"
                className="h-24 w-24 object-cover rounded-xl border border-gray-200"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-white text-gray-500 backdrop-blur-2xl rounded-full p-1 text-xs shadow-md hover:bg-gray-200"
              >
                <RxCross2 size={16} className="text-black"/>
              </button>
            </div>
          </div>
        )}

        {listening ? (
          <div className="w-full h-12 sm:h-10 max-h-40 flex items-center gap-3 overflow-hidden text-white bg-transparent px-2">
            <div className="flex items-center gap-1 h-full pt-1">
              <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: "12px", animationDelay: "0ms" }}></div>
              <div className="w-1 bg-white/70 rounded-full animate-bounce" style={{ height: "24px", animationDelay: "150ms" }}></div>
              <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: "16px", animationDelay: "300ms" }}></div>
              <div className="w-1 bg-white/80 rounded-full animate-bounce" style={{ height: "20px", animationDelay: "450ms" }}></div>
            </div>
            <span className="truncate opacity-80 text-sm md:text-base">
              {transcript ? transcript : "Listening to your voice..."}
            </span>
          </div>
        ) : (
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Ask anything or attach a screenshot to fact-check..."
            className="w-full h-12 sm:h-10 max-h-40 outline-none text-white resize-none bg-transparent px-2"
            rows="3"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex space-x-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="p-2 text-white/70 hover:text-white hover:bg-black rounded-full transition-colors"
              title="Attach Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 items-center h-10">
            <div className="relative flex items-center justify-center h-full">
              <button
                onClick={() => setShowModeList(!showModeList)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all"
              >
                {mode === "fact" ? "🕵️‍♂️ Fact-Check" : "⚡ Fast Chat"}
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-200 ${showModeList ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showModeList && (
                <div className="absolute bottom-full mb-2 right-0 sm:left-0 w-44 bg-[#464545] border border-black/50 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                  <button onClick={() => { setMode("chat"); setShowModeList(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors">Fast Chat</button>
                  <button onClick={() => { setMode("fact"); setShowModeList(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors border-t border-slate-700">Deep Fact-Check</button>
                </div>
              )}
            </div>

            <button
              onClick={handleMicClick}
              className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center
                ${listening 
                  ? "bg-white text-black animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]" 
                  : "bg-black/30 text-white/70 hover:bg-black hover:text-white"
                }`}
            >
              <FaMicrophone size={18} />
            </button>

            <div
              className={`transition-all duration-100 ease-out flex items-center justify-center overflow-hidden
                ${hasInput && !loading 
                  ? "w-10 opacity-100 ml-1" 
                  : "w-0 opacity-0 ml-0"
                }`}
            >
              <button
                onClick={handleVerify}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
              >
                <IoSendSharp size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Searchbox;