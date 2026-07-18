import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../axiosConfig";

import { IoIosClose } from "react-icons/io";
import { LuFilePen } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import { BsPinAngle } from "react-icons/bs";
import { LuPen } from "react-icons/lu";
import { AiOutlineDelete } from "react-icons/ai";
import { TbPinned } from "react-icons/tb";
import { RiUnpinFill } from "react-icons/ri";
import { FiLogOut, FiSettings, FiUser } from "react-icons/fi";

const ClaimHistory = ({ onSelectHistory, onNewChat, onCrossclick, selectedHistoryId, refreshTrigger }) => {
  const [claimsArray, setClaimsArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userData, setUserData] = useState({ name: "User"});
  const navigate = useNavigate();

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuButtonRect, setMenuButtonRect] = useState(null);
  const [finalMenuCoords, setFinalMenuCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [renameItemId, setRenameItemId] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
        setMenuButtonRect(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // User Profile fetch logic with Axios
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/api/user/profile");
        const data = res.data;
        if (data.success && data.user) {
          setUserData({ name: data.user.name });
        }else{
          setUserData({ name: "User" });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setUserData({ name: "User" });
      }
    };
    fetchUserProfile();
  }, []);

  // History fetch logic with Axios
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await api.get("/api/user/claims");
        const historyData = result.data;
        
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
    setActiveMenuId(null); 
    try {
      const response = await api.delete(`/api/user/claim/delete/${id}`);
      const data = response.data;
      
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
      alert(error.response?.data?.message || "Server error during delete.");
    }
  };

  const openRenameModal = (id) => {
    const item = claimsArray.find((c) => c._id === id);
    if (item) {
      setRenameText(item.userClaim || "");
      setRenameItemId(id);
      setActiveMenuId(null); 
      setIsRenameModalOpen(true); 
    }
  };

  const handleRenameSubmit = async () => {
    if (!renameText.trim()) return alert("Naam khali nahi chhod sakte!");
    
    try {
      const response = await api.put(`/api/user/claim/update/${renameItemId}`, 
        { userClaim: renameText }
      );
      const data = response.data;

      if (data.success) {
        setClaimsArray((prev) =>
          prev.map((item) =>
            item._id === renameItemId ? { ...item, userClaim: renameText } : item
          )
        );
        if (selectedHistoryId === renameItemId) {
          const updatedItem = claimsArray.find(c => c._id === renameItemId);
          onSelectHistory({ ...updatedItem, userClaim: renameText });
        }
        setIsRenameModalOpen(false); 
      } else {
        alert(data.message || "Rename failed.");
      }
    } catch (error) {
      console.error("Rename error:", error);
      alert(error.response?.data?.message || "Server error during rename.");
    }
  };

  const handlePinToggle = async (id) => {
    setActiveMenuId(null); 
    try {
      const response = await api.put(`/api/user/claim/pin/${id}`, 
        {}, // Empty body
      );
      const data = response.data;

      if (data.success) {
        setClaimsArray((prev) => {
          const updatedArray = prev.map((item) =>
            item._id === id ? { ...item, isPinned: data.isPinned } : item
          );
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
      alert(error.response?.data?.message || "Server error during pin toggle.");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await api.post("/api/user/logout", 
        {}
      );
      const data = res.data;
      
      if(data.success) {
        localStorage.removeItem("isAuthenticated");
        toast.success("Successfully logged out!");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Logout failed!");
    }
  };

  const getInitials = (name) => {
    if (!name || name === "Loading...") return "U";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="w-64 md:w-72 h-screen bg-[#272829] border-r border-slate-800/60 flex flex-col shrink-0 items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold animate-pulse text-slate-500 uppercase tracking-wider">
          Loading History...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 md:w-72 h-screen bg-[#272829] border-r border-slate-800/60 flex flex-col shrink-0 p-6 text-center justify-center text-red-400">
        <span className="text-2xl mb-2">⚠️</span>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-64 md:w-72 h-dvh bg-[#202122] border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 relative">
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
            if (typeof onCrossclick === 'function') {
              onCrossclick(false);
            }
          }}
          className="w-full flex items-center justify-between px-2 py-2.5  text-white text-sm font-medium rounded-xl hover:bg-[#303132]"
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
        <div className="text-sm font-semibold text-[#a7a8aa] mb-3 px-3 tracking-wider">
          Recents
        </div>

        <div className="flex flex-col gap-1">
          {claimsArray.length === 0 ? (
            <div className="text-center py-10 px-4 text-white text-sm">
              <span className="text-2xl block mb-2 opacity-50">📭</span>
              No chat history found. Start a new conversation!
            </div>
          ) : (
            claimsArray.map((item) => {
              const isSelected = item._id === selectedHistoryId;
              return (
                <div
                  key={item._id || Math.random()}
                  className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl transition duration-200 text-left cursor-pointer ${
                    isSelected ? "bg-[#121313] shadow-inner" : "hover:bg-[#303132]"
                  }`}
                  onClick={() => {
                    onSelectHistory(item);
                    setActiveMenuId(null);
                    if (typeof onCrossclick === 'function') {
                      onCrossclick(false);
                    }
                  }}
                >
                  <div className="flex-1 truncate text-white text-sm font-medium group-hover:text-slate-100 transition-colors flex items-center gap-2 capitalize">
                    {item.isPinned && <TbPinned className="text-white shrink-0" size={16} />}
                    <span className="truncate">{item.title || "Unknown Search"}</span>
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
            className="fixed bg-[#303131] w-36 rounded-2xl py-2 px-3 z-9999 shadow-2xl"
          >
            <div 
              onClick={() => handlePinToggle(activeMenuId)}
              className="flex justify-start items-center gap-2 mb-2 cursor-pointer  p-1.5 rounded-md transition-colors"
            >
              <span>{claimsArray.find(c => c._id === activeMenuId)?.isPinned ?(<RiUnpinFill className="text-white" size={16} />):(<BsPinAngle className="text-white" size={16}/>)}</span>
              <h2 className="text-white text-sm capitalize">
                {claimsArray.find(c => c._id === activeMenuId)?.isPinned ? "unpin" : "pin"}
              </h2>
            </div>
            <div 
              onClick={() => openRenameModal(activeMenuId)}
              className="flex justify-start items-center gap-2 mb-2 cursor-pointer hover:bg-slate-700 p-1.5 rounded-md transition-colors"
            >
              <span><LuPen className="text-white" size={16} /></span>
              <h2 className="text-white text-sm capitalize">rename</h2>
            </div>
            <div 
              onClick={() => handleDelete(activeMenuId)}
              className="flex justify-start items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors"
            >
              <span><AiOutlineDelete className="text-white" size={16} /></span>
              <h2 className="text-white text-sm capitalize">delete</h2>
            </div>
          </div>,
          document.body
        )}

      {/* RENAME MODAL PORTAL */}
      {isRenameModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9999 flex items-center justify-center">
            <div className="bg-[#202122] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
              <h2 className="text-white text-lg font-bold mb-4">Rename Chat</h2>
              <input
                type="text"
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                }}
                className="w-full bg-[#161717] border text-white rounded-lg px-4 py-2 focus:outline-none focus:border-white transition-colors"
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

      {/* ================================== */}
      {/* NAYA USER PROFILE & POPUP SECTION */}
      {/* ================================== */}
      <div className="relative p-4 border-t border-slate-800/60" ref={profileRef}>
        
        {/* Profile Popup Menu */}
        {isProfileOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#383838] rounded-2xl shadow-2xl overflow-hidden z-50">
            {/* Header (Photo, Name, Email fetched from DB) */}
            <div className="p-4 border-b border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#111010] flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {getInitials(userData.name)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-white font-semibold truncate capitalize">{userData.name}</h3>
                <p className="text-slate-400 text-xs truncate">{userData.email}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-[#262728] rounded-lg text-sm transition-colors">
                <FiUser size={16} /> My Account
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-[#262728] rounded-lg text-sm transition-colors">
                <FiSettings size={16} /> Settings
              </button>
              <div className="h-px bg-slate-700 my-1 mx-2"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-[#262728] rounded-lg text-sm transition-colors font-medium"
              >
                <FiLogOut size={16} /> Log out
              </button>
            </div>
          </div>
        )}

        {/* Bottom Clickable Profile Button (Data fetched from DB) */}
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`flex items-center gap-3 w-full p-2 rounded-lg transition duration-200 ${isProfileOpen ? "bg-[#202122]" : "bg-[#121313]"}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#313131] flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
            {getInitials(userData.name)}
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="text-slate-200 text-sm font-medium truncate capitalize">
              {userData.name}
            </div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
              Pro Plan
            </div>
          </div>
          <span className="text-slate-500 transition-colors">
            <HiDotsVertical size={16} />
          </span>
        </button>
      </div>

    </div>
  );
};

export default ClaimHistory;