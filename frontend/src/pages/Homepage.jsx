import ClaimHistory from "../components/ClaimHistory";
import { useState } from "react";
import Wholerightsec from "../components/Wholerightsec";
import { RxHamburgerMenu } from "react-icons/rx";

const Homepage = () => {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [resetSignal, setresetSignal] = useState(0);
  const [showHistory, setshowHistory] = useState(false);
  
  
  const [activeChatId, setActiveChatId] = useState(null); 
  const [refreshHistory, setRefreshHistory] = useState(0);

 
  const handleNewChat = () => {
    setSelectedHistoryItem(null);
    setActiveChatId(null); 
    setresetSignal((prev) => prev + 1);
  };

  // Jab koi specific history item click ho
  const handleSelectHistory = (item) => {
    setSelectedHistoryItem(item); 
    setActiveChatId(item._id); 
  };

  const handleClaimHistoryBox = () => {
    setshowHistory(!showHistory);
  };
  const handleSearchSuccess = (newChatId) => {
    if (!activeChatId && newChatId) {
      setActiveChatId(newChatId);
    }
    setRefreshHistory((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-black">
      <div
        className="text-white fixed top-4 left-4 md:hidden"
        onClick={handleClaimHistoryBox}
      >
        <RxHamburgerMenu size={25} />
      </div>
      
      <div className={`
          fixed md:static top-0 left-0 h-full z-40
          transform ${showHistory ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-300
        `}>
        <ClaimHistory
          onSelectHistory={handleSelectHistory} 
          onNewChat={handleNewChat}
          onCrossclick={setshowHistory}
          selectedHistoryId={activeChatId}
          refreshTrigger={refreshHistory} 
        />
      </div>
      
      <Wholerightsec
        selectedHistoryItem={selectedHistoryItem}
        selectedHistoryId={activeChatId}
        resetSignal={resetSignal}
        onSearchSuccess={handleSearchSuccess} 
      />
    </div>
  );
};

export default Homepage;