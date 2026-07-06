import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { IoIosClose } from "react-icons/io";
import { LuFilePen } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import { BsPinAngle } from "react-icons/bs";
import { LuPen } from "react-icons/lu";
import { AiOutlineDelete } from "react-icons/ai";
import { TbPinned } from "react-icons/tb";
import { RiUnpinFill } from "react-icons/ri";

const ClaimHistory = ({ onSelectHistory, onNewChat, onCrossclick, selectedHistoryId, refreshTrigger }) => {
  const [claimsArray, setClaimsArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Menu Dropdown states
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuButtonRect, setMenuButtonRect] = useState(null);
  const [finalMenuCoords, setFinalMenuCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  // Rename Modal states
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [renameItemId, setRenameItemId] = useState(null);

  // Outside click handle karne ka logic (Dropdown ke liye)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
        setMenuButtonRect(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dropdown position calculate
  useLayoutEffect(() => {
    if (activeMenuId && dropdownRef.current && menuButtonRect) {
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const dropdownWidth = dropdownRef.current.offsetWidth;
      const buttonRect = menuButtonRect;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = buttonRect.bottom + 5;
      let left = buttonRect.right - dropdownWidth;

      if (top + dropdownHeight > viewportHeight) top = buttonRect.top - dropdownHeight - 5;
      if (top < 0) top = 5;
      if (left + dropdownWidth > viewportWidth) left = viewportWidth - dropdownWidth - 5;
      if (left < 0) left = 5;

      if (finalMenuCoords.top !== top || finalMenuCoords.left !== left) {
        setFinalMenuCoords({ top, left });
      }
    }
  }, [activeMenuId, menuButtonRect, finalMenuCoords]);

  // History fetch logic
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await fetch("http://localhost:3000/api/user/claims", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const historyData = await result.json();
        
        // Data aate hi Pinned items ko upar sort kar rahe hain
        const sortedData = (historyData.data || []).sort((a, b) => {
          if (a.isPinned === b.isPinned) return 0;
          return a.isPinned ? -1 : 1;
        });
        
        setClaimsArray(sortedData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Bhai, server se data laane mein dikkat aa gayi.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [refreshTrigger]);


  
  const handleDelete = async (id) => {
    setActiveMenuId(null); // Menu band karo
    try {
      const response = await fetch(`http://localhost:3000/api/user/claim/delete/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (data.success) {
        setClaimsArray((prev) => prev.filter((item) => item._id !== id));
        
        if (selectedHistoryId === id) {
          onNewChat();
        }
      } else {
        alert(data.message || "Delete nahi ho paya bhai!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server error during delete.");
    }
  };

  // 2. Open Rename Modal
  const openRenameModal = (id) => {
    const item = claimsArray.find((c) => c._id === id);
    if (item) {
      setRenameText(item.userClaim || "");
      setRenameItemId(id);
      setActiveMenuId(null); // Menu band karo
      setIsRenameModalOpen(true); // Modal kholo
    }
  };

  // 3. Submit Rename
  const handleRenameSubmit = async () => {
    if (!renameText.trim()) return alert("Naam khali nahi chhod sakte!");
    
    try {
      const response = await fetch(`http://localhost:3000/api/user/claim/update/${renameItemId}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userClaim: renameText }),
      });
      const data = await response.json();

      if (data.success) {
        // UI Update karo
        setClaimsArray((prev) =>
          prev.map((item) =>
            item._id === renameItemId ? { ...item, userClaim: renameText } : item
          )
        );
        
        // Agar yahi history focus mein hai, toh parent component ko bhi updated data bhej do
        if (selectedHistoryId === renameItemId) {
          const updatedItem = claimsArray.find(c => c._id === renameItemId);
          onSelectHistory({ ...updatedItem, userClaim: renameText });
        }
        
        setIsRenameModalOpen(false); // Modal band
      } else {
        alert(data.message || "Rename fail ho gaya.");
      }
    } catch (error) {
      console.error("Rename error:", error);
      alert("Server error during rename.");
    }
  };

  // 4. Pin/Unpin Handler (NAYA ADD KIYA HAI)
  const handlePinToggle = async (id) => {
    setActiveMenuId(null); // Menu band karo
    try {
      const response = await fetch(`http://localhost:3000/api/user/claim/pin/${id}`, {
        method: "PUT",
      });
      const data = await response.json();

      if (data.success) {
        setClaimsArray((prev) => {
          const updatedArray = prev.map((item) =>
            item._id === id ? { ...item, isPinned: data.isPinned } : item
          );
          
          // Sort logic: Pinned items upar aa jayenge turant
          return updatedArray.sort((a, b) => {
            if (a.isPinned === b.isPinned) return 0;
            return a.isPinned ? -1 : 1;
          });
        });
      } else {
        alert(data.message || "Pin nahi ho paya bhai!");
      }
    } catch (error) {
      console.error("Pin error:", error);
      alert("Server error during pin toggle.");
    }
  };

  // =====================
  // UI RENDERING
  // =====================

  if (loading) {
    return (
      <div className="w-64 md:w-72 h-screen bg-[#0B1120] border-r border-slate-800/60 flex flex-col shrink-0 items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold animate-pulse text-slate-500 uppercase tracking-wider">
          Loading History...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 md:w-72 h-screen bg-[#0B1120] border-r border-slate-800/60 flex flex-col shrink-0 p-6 text-center justify-center text-red-400">
        <span className="text-2xl mb-2">⚠️</span>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-64 md:w-72 h-screen bg-[#0B1120] border-r border-slate-800/60 md:flex flex-col shrink-0 transition-all duration-300 relative">
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold text-slate-200 mb-6 px-2 tracking-wide">
            Truthlens
          </h1>
          <div onClick={() => onCrossclick(false)} className="md:hidden cursor-pointer">
            <IoIosClose size={30} color="white" />
          </div>
        </div>
        <button
          onClick={() => {
            onNewChat();
            setActiveMenuId(null);
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition duration-400 border border-slate-700 hover:border-slate-600 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">
              <LuFilePen />
            </span>{" "}
            New Chat
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        <div className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">
          Recent History
        </div>

        <div className="flex flex-col gap-1">
          {claimsArray.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 text-sm">
              <span className="text-2xl block mb-2 opacity-50">📭</span>
              No chat history found. Start a new conversation!
            </div>
          ) : (
            claimsArray.map((item) => {
              const isSelected = item._id === selectedHistoryId;
              return (
                <div
                  key={item._id || Math.random()}
                  className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition duration-200 text-left cursor-pointer ${
                    isSelected ? "bg-slate-700 shadow-inner" : "hover:bg-slate-800/60"
                  }`}
                  onClick={() => {
                    onSelectHistory(item);
                    setActiveMenuId(null);
                  }}
                >
                  {/* YAHAN PIN ICON ADD KIYA HAI */}
                  <div className="flex-1 truncate text-white text-sm font-medium group-hover:text-slate-100 transition-colors flex items-center gap-2 capitalize">
                    {item.isPinned && <TbPinned className="text-white shrink-0" size={16} />}
                    <span className="truncate">{item.userClaim || "Unknown Search"}</span>
                  </div>

                  <button
                    className="hover:bg-gray-600 rounded-2xl p-1 transition-colors duration-100 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuButtonRect(rect);
                      if (activeMenuId === item._id) {
                        setActiveMenuId(null);
                        setMenuButtonRect(null);
                      } else {
                        setActiveMenuId(item._id);
                      }
                    }}
                  >
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-xs">
                      <HiDotsVertical size={20} />
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* THREE-DOT MENU PORTAL */}
      {activeMenuId &&
        createPortal(
          <div
            ref={(node) => {
              menuRef.current = node;
              dropdownRef.current = node;
            }}
            style={{ top: finalMenuCoords.top, left: finalMenuCoords.left, position: "fixed" }}
            className="fixed bg-[#202638] w-36 rounded-2xl py-2 px-3 z-50 shadow-2xl border border-slate-700"
          >
            {/* PIN CLICK LOGIC ADDED HERE */}
            <div 
              onClick={() => handlePinToggle(activeMenuId)}
              className="flex justify-start items-center gap-2 mb-2 cursor-pointer hover:bg-slate-700 p-1.5 rounded-md transition-colors"
            >
              <span>{claimsArray.find(c => c._id === activeMenuId)?.isPinned ?(<RiUnpinFill className="text-white" size={16} />):(<BsPinAngle className="text-white" size={16}/>)}</span>
              <h2 className="text-white text-sm capitalize">
                {claimsArray.find(c => c._id === activeMenuId)?.isPinned ? "unpin" : "pin"}
              </h2>
            </div>
            {/* RENAME CLICK LOGIC */}
            <div 
              onClick={() => openRenameModal(activeMenuId)}
              className="flex justify-start items-center gap-2 mb-2 cursor-pointer hover:bg-slate-700 p-1.5 rounded-md transition-colors"
            >
              <span><LuPen className="text-white" size={16} /></span>
              <h2 className="text-white text-sm capitalize">rename</h2>
            </div>
            {/* DELETE CLICK LOGIC */}
            <div 
              onClick={() => handleDelete(activeMenuId)}
              className="flex justify-start items-center gap-2 cursor-pointer hover:bg-red-500/20 hover:text-red-400 p-1.5 rounded-md transition-colors"
            >
              <span><AiOutlineDelete className="text-white hover:text-red-400" size={16} /></span>
              <h2 className="text-white text-sm capitalize">delete</h2>
            </div>
          </div>,
          document.body
        )}

      {/* RENAME MODAL PORTAL */}
      {isRenameModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9999 flex items-center justify-center">
            <div className="bg-[#1A2234] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
              <h2 className="text-white text-lg font-bold mb-4">Rename Chat</h2>
              <input
                type="text"
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                }}
                className="w-full bg-[#0B1120] border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-white transition-colors"
                placeholder="Enter new name..."
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameSubmit}
                  className="px-4 py-2 rounded-lg bg-white/80 hover:bg-white text-black transition-colors text-sm font-medium shadow-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* USER PROFILE BOTTOM */}
      <div className="p-4 border-t border-slate-800/60">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-800/60 rounded-lg transition duration-200">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            SK
          </div>
          <div className="flex-1 text-left">
            <div className="text-slate-200 text-sm font-medium truncate">
              Satyam Katiyar
            </div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
              Pro Plan
            </div>
          </div>
          <span className="text-slate-500 hover:text-slate-300 transition-colors">
            ⚙️
          </span>
        </button>
      </div>
    </div>
  );
};

export default ClaimHistory;