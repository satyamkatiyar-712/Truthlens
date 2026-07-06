import ClaimHistory from "../components/ClaimHistory";
import { useState } from "react";
import Wholerightsec from "../components/Wholerightsec";
import { RxHamburgerMenu } from "react-icons/rx";

const Homepage = () => {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [resetSignal, setresetSignal] = useState(0);
  const [showHistory, setshowHistory] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null); // Focus track karne wali state

  const [refreshHistory, setRefreshHistory] = useState(0);

  // Jab 'New Chat' pe click ho
  const handleNewChat = () => {
    setSelectedHistoryItem(null);
    setActiveChatId(null); // New chat pe purana focus hata do
    setresetSignal((prev) => prev + 1);
  };

  // Jab koi specific history item click ho
  const handleSelectHistory = (item) => {
    setSelectedHistoryItem(item); // Data bhej do right section ko
    setActiveChatId(item._id); // Sidebar mein isko highlight karne ke liye ID set kar do
  };

  const handleClaimHistoryBox = () => {
    setshowHistory(!showHistory);
  };

  const handleTriggerRefresh = () => {
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
          onSelectHistory={handleSelectHistory} // Naya function lagaya
          onNewChat={handleNewChat}
          onCrossclick={setshowHistory}
          selectedHistoryId={activeChatId}
          refreshTrigger={refreshHistory} // YAHAN PROP BHEJA JIS SE BACKGROUND CHANGE HOGA
        />
      </div>
      <Wholerightsec
        selectedHistoryItem={selectedHistoryItem}
        resetSignal={resetSignal}
        onSearchSuccess={handleTriggerRefresh}
      />
    </div>
  );
};

export default Homepage;