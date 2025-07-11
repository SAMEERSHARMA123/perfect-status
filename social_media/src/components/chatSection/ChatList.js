// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import {
//   PhoneIcon,
//   VideoCameraIcon,
//   EllipsisVerticalIcon,
//   PaperClipIcon,
//   PaperAirplaneIcon
// } from '@heroicons/react/24/outline';
// import { GetTokenFromCookie } from '../getToken/GetToken';
// import socket from "../socket_io/Socket";
// import moment from 'moment';

// const ChatList = ({ activeTab }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [sender, setSender] = useState();
//   const [text, setText] = useState("");
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [showAttachmentBar, setShowAttachmentBar] = useState(false);
//   const attachmentBarRef = useRef(null);
//   const photoInputRef = useRef(null);
//   const [hoveredMsgId, setHoveredMsgId] = useState(null);
//   const [openMenuMsgId, setOpenMenuMsgId] = useState(null);
//   const [replyToMsg, setReplyToMsg] = useState(null);
//   const [touchTimer, setTouchTimer] = useState(null);
//   const [mobileMenuMsgId, setMobileMenuMsgId] = useState(null);
//   const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
//   const headerMenuRef = useRef(null);

//   const sampleMessages = {
//     1: [
//       { id: 1, text: "Hey, how are you?", sender: "them", time: "10:30 AM" },
//       { id: 2, text: "I'm good, thanks! How about you?", sender: "me", time: "10:31 AM" },
//     ],
//     2: [
//       { id: 1, text: "See you tomorrow!", sender: "them", time: "9:45 AM" },
//       { id: 2, text: "Yes, looking forward to it!", sender: "me", time: "9:46 AM" }
//     ]
//   };

//   useEffect(() => {
//     socket.on("updateOnlineUsers", (users) => {
//       const onlineSet = new Set(users); // ✅ fast lookup set
//       setOnlineUsers(onlineSet);
//     });

//     return () => {
//       socket.off("updateOnlineUsers");
//     };
//   }, []);

//   useEffect(() => {
//     try {
//       const decodedUser = GetTokenFromCookie(); // JWT se user decode
//       if (decodedUser?.id) {
//         setSender({ ...decodedUser, id: decodedUser.id.toString() });
//         socket.emit("join", decodedUser?.id);
//       }
//     } catch (error) {
//       console.error("Error decoding token or joining socket:", error);
//     }
//   }, []);



//   const getUser = async () => {
//     try {
//       const query = `
//         query {
//           users {
//             id
//             name
//             profileImage
//           }
//         }
//       `;
//       const response = await axios.post(
//         "http://localhost:5000/graphql",
//         { query },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );
//       setUsers(response.data.data.users);
//     } catch (error) {
//       console.error(error.response?.data?.errors?.[0]?.message || "Unknown error");
//     }
//   };

//   useEffect(() => {
//     getUser();
//   }, []);

//   let receiverId = selectedChat?.id;
//   const getChat = async () => {
//     if (!sender?.id || !selectedChat?.id) {
//       alert("Sender ya Receiver select nahi hua");
//       return;
//     }

//     try {
//       const query = `
//       query {
//         getMessages(senderId: "${sender?.id}", receiverId: "${receiverId}") {
//         id
//       message
//       sender {
//         id
//       }
//       receiver {
//         id
//       }
//       createdAt
//         }
//       }
//     `;

//       const response = await axios.post(
//         "http://localhost:5000/graphql",
//         { query },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );
//       setMessages(response?.data?.data?.getMessages);
//     } catch (error) {
//       console.error(error.response?.data?.errors?.[0]?.message || "Unknown error");
//     }
//   };

//   useEffect(() => {
//     if (sender?.id && receiverId) {
//       getChat();
//     }
//   }, [sender, receiverId]);

//   const handleChatSelect = (user) => {
//     try {
//       setIsAnimating(true);
//       setSelectedChat(user);
//       setTimeout(() => setIsAnimating(false), 300);
//     } catch (error) {
//       console.error("Error selecting chat:", error);
//     }
//   };


//   const chat = async () => {
//     if (!sender?.id || !selectedChat?.id) {
//       alert("Sender ya Receiver select nahi hua");
//       return;
//     }
//     try {
//       let finalMessage = text;
//       let replyMeta = null;
//       if (replyToMsg) {
//         // Prepend quoted text for UI
//         finalMessage = `> ${replyToMsg.message}\n${text}`;
//         replyMeta = { replyToId: replyToMsg.id, replyToText: replyToMsg.message };
//       }
//       const query = `
//     mutation sendMessage($senderId: ID!, $receiverId: ID!, $message: String!) {
//     sendMessage(senderId: $senderId, receiverId: $receiverId, message: $message) {
//       id
//       message
//       createdAt
//       sender {
//         id
//         name
//       }
//       receiver {
//         id
//         name
//       }
//     }
//   }`
//       const variables = {
//         senderId: sender?.id,
//         receiverId: selectedChat?.id,
//         message: finalMessage,
//       }
//       const response = await axios.post(
//         "http://localhost:5000/graphql",
//         { query, variables },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );
//       if (response?.data?.data?.sendMessage) {
//         getChat();
//       }
//       setText(""); // Clear input after send
//       setReplyToMsg(null);
//     } catch (error) {
//       console.error(error.response?.data?.errors?.[0]?.message || "Unknown error");
//     }
//   }

//   useEffect(() => {
//     if (!socket || !selectedChat?.id) return;

//     const handleIncomingMessage = (msg) => {
//       // sirf wahi message show karo jo current selected chat se related ho
//       if (
//         msg.sender.id === selectedChat.id ||
//         msg.receiver.id === selectedChat.id
//       ) {
//         // setMessages(prev => [...prev, msg]);
//         console.log(msg);

//       }
//     };

//     socket.on("receiveMessage", handleIncomingMessage);

//     // Cleanup on unmount or chat change
//     return () => {
//       socket.off("receiveMessage", handleIncomingMessage);
//     };
//   }, [selectedChat]);

//   useEffect(() => {
//     if (!showAttachmentBar) return;
    
//     try {
//       function handleClickOutside(event) {
//         try {
//           if (attachmentBarRef.current && !attachmentBarRef.current.contains(event.target)) {
//             setShowAttachmentBar(false);
//           }
//         } catch (error) {
//           console.error("Error handling click outside attachment bar:", error);
//         }
//       }
      
//       document.addEventListener('mousedown', handleClickOutside);
      
//       return () => {
//         try {
//           document.removeEventListener('mousedown', handleClickOutside);
//         } catch (error) {
//           console.error("Error removing event listener:", error);
//         }
//       };
//     } catch (error) {
//       console.error("Error setting up attachment bar click handler:", error);
//     }
//   }, [showAttachmentBar]);

//   useEffect(() => {
//     if (!headerMenuOpen) return;
    
//     try {
//       function handleClickOutside(event) {
//         try {
//           if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
//             setHeaderMenuOpen(false);
//           }
//         } catch (error) {
//           console.error("Error handling click outside header menu:", error);
//         }
//       }
      
//       document.addEventListener('mousedown', handleClickOutside);
      
//       return () => {
//         try {
//           document.removeEventListener('mousedown', handleClickOutside);
//         } catch (error) {
//           console.error("Error removing event listener:", error);
//         }
//       };
//     } catch (error) {
//       console.error("Error setting up header menu click handler:", error);
//     }
//   }, [headerMenuOpen]);

//   return (
//     <div className="flex flex-col md:flex-row h-full w-full">
//       {/* Chat List */}
//       <div className={`w-full md:w-1/3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300 ease-in-out md:ml-8 ${selectedChat ? 'hidden md:block' : 'block'}`}>
//         <div className="overflow-y-auto h-full custom-scrollbar">
//           {users.map((user) => (
//             <div
//               key={user.id}
//               onClick={() => handleChatSelect(user)}
//               className={`flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50/80 ${selectedChat?.id === user.id ? 'bg-purple-50' : ''
//                 }`}
//             >
//               <div className="flex items-center w-full">
//                 <div className="relative flex-shrink-0">
//                   <img
//                     src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
//                     alt={user.name}
//                     className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
//                   />
//                   {onlineUsers.has(user.id) && <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-500"></span>}
//                 </div>
//                 <div className="ml-3 flex-1 min-w-0">
//                   <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
//                   <p className="text-sm text-gray-500 truncate">Tap to chat</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="flex-1 flex flex-col h-full min-h-0">
//         {selectedChat ? (
//           <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:ml-8 md:mr-4 overflow-hidden transform transition-all duration-300 ease-in-out">
//             {/* Header */}
//             <div className="flex-none border-b border-gray-100 p-4 flex items-center justify-between bg-white">
//               <div className="flex items-center">
//                 <button
//                   onClick={() => setSelectedChat(null)}
//                   className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//                 <img
//                   src={selectedChat.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}`}
//                   alt={selectedChat.name}
//                   className="w-12 h-12 rounded-full ring-2 ring-purple-100"
//                 />
//                 <div className="ml-3">
//                   <h2 className="text-lg font-semibold text-gray-900">{selectedChat.name}</h2>
//                   <p className={`text-xs ${onlineUsers.has(selectedChat?.id) ? 'text-green-500' : 'text-gray-400'}`}>{onlineUsers.has(selectedChat?.id) ? 'Online' : 'Offline'}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2 mb-[80px] md:mb-0 relative">
//                 <button className="p-2 hover:bg-gray-100 rounded-full"><PhoneIcon className="h-5 w-5 text-gray-600" /></button>
//                 <button className="p-2 hover:bg-gray-100 rounded-full"><VideoCameraIcon className="h-5 w-5 text-gray-600" /></button>
//                 <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setHeaderMenuOpen((v) => !v)} ref={headerMenuRef}>
//                   <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
//                 </button>
//                 {headerMenuOpen && (
//                   <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn">
//                     <button className="px-4 py-2 text-left text-sm hover:bg-red-100 text-red-600 font-semibold" type="button">Block</button>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 bg-gray-50">
//               <div className="space-y-4">
//                 {messages.map((msg) => {
//                   const isSent = msg?.sender?.id === sender?.id;
//                   let quoted = null;
//                   let mainText = msg.message;
//                   if (msg.message.startsWith('> ')) {
//                     const split = msg.message.split('\n');
//                     quoted = split[0].replace('> ', '');
//                     mainText = split.slice(1).join('\n');
//                   }
//                   // Mobile long-press handlers
//                   const handleTouchStart = () => {
//                     if (window.innerWidth < 768) {
//                       const timer = setTimeout(() => {
//                         setMobileMenuMsgId(msg.id);
//                       }, 500);
//                       setTouchTimer(timer);
//                     }
//                   };
//                   const handleTouchEnd = () => {
//                     if (window.innerWidth < 768 && touchTimer) {
//                       clearTimeout(touchTimer);
//                       setTouchTimer(null);
//                     }
//                   };
//                   return (
//                     <div
//                       key={msg.id}
//                       className={`flex ${isSent ? 'justify-end' : 'justify-start'} relative`}
//                       onMouseEnter={() => setHoveredMsgId(msg.id)}
//                       onMouseLeave={() => { setHoveredMsgId(null); setOpenMenuMsgId(null); }}
//                       onTouchStart={handleTouchStart}
//                       onTouchEnd={handleTouchEnd}
//                     >
//                       {/* For sent messages, arrow/menu on left; for received, on right (desktop only) */}
//                       {isSent && hoveredMsgId === msg.id && (
//                         <div className="hidden md:flex items-center mr-2 relative">
//                           <button
//                             className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-transform duration-200 ${openMenuMsgId === msg.id ? 'rotate-180' : ''}`}
//                             onClick={e => { e.stopPropagation(); setOpenMenuMsgId(msg.id); }}
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </button>
//                           {openMenuMsgId === msg.id && (
//                             <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn"
//                               style={{ right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px', animation: 'fadeInLeft 0.2s' }}
//                             >
//                               <button className="px-4 py-2 text-left text-sm hover:bg-gray-100" type="button" onClick={() => { setReplyToMsg(msg); setOpenMenuMsgId(null); }}>Reply</button>
//                               <button className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500" type="button">Delete</button>
//                               <button className="px-4 py-2 text-left text-sm hover:bg-red-100 text-red-600 font-semibold" type="button">Block</button>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                       <div className={`max-w-[70%] ${isSent ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2`}>
//                         {quoted && (
//                           <div className="text-xs text-purple-300 border-l-4 border-purple-400 pl-2 mb-1 whitespace-pre-line">{quoted}</div>
//                         )}
//                         <p className="text-sm whitespace-pre-line">{mainText}</p>
//                         <span className={`text-xs mt-1 block text-white ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>{moment(Number(msg.createdAt)).format('hh:mm A')}</span>
//                       </div>
//                       {!isSent && hoveredMsgId === msg.id && (
//                         <div className="hidden md:flex items-center ml-2 relative">
//                           <button
//                             className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-transform duration-200 ${openMenuMsgId === msg.id ? 'rotate-180' : ''}`}
//                             onClick={e => { e.stopPropagation(); setOpenMenuMsgId(msg.id); }}
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </button>
//                           {openMenuMsgId === msg.id && (
//                             <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn"
//                               style={{ left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px', animation: 'fadeInLeft 0.2s' }}
//                             >
//                               <button className="px-4 py-2 text-left text-sm hover:bg-gray-100" type="button" onClick={() => { setReplyToMsg(msg); setOpenMenuMsgId(null); }}>Reply</button>
//                               <button className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500" type="button">Delete</button>
//                               <button className="px-4 py-2 text-left text-sm hover:bg-red-100 text-red-600 font-semibold" type="button">Block</button>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                       {/* Mobile: show options on long press */}
//                       {mobileMenuMsgId === msg.id && (
//                         <div className="md:hidden absolute z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn"
//                           style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animation: 'fadeInLeft 0.2s' }}
//                         >
//                           <button className="px-4 py-2 text-left text-sm hover:bg-gray-100" type="button" onClick={() => { setReplyToMsg(msg); setMobileMenuMsgId(null); }}>Reply</button>
//                           <button className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500" type="button" onClick={() => setMobileMenuMsgId(null)}>Delete</button>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//             {/* Input - always at bottom, never scrolls */}
//             <div className="flex-none border-t border-gray-100 p-4 bg-white relative z-10">
//               {/* Reply mention UI */}
//               {replyToMsg && (
//                 <div className="flex items-center mb-2 px-3 py-1 rounded-lg bg-purple-50 border-l-4 border-purple-400">
//                   <div className="flex-1 min-w-0">
//                     <span className="text-xs text-purple-700 font-semibold">Replying to:</span>
//                     <span className="block text-xs text-gray-700 truncate max-w-xs">{replyToMsg.message}</span>
//                   </div>
//                   <button className="ml-2 p-1 rounded-full hover:bg-purple-100" onClick={() => setReplyToMsg(null)}>
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                   </button>
//                 </div>
//               )}
//               <div className="flex items-center gap-2">
//                 <button
//                   className="p-1.5 hover:bg-gray-100 rounded-full"
//                   onClick={() => setShowAttachmentBar((prev) => !prev)}
//                   type="button"
//                 >
//                   <PaperClipIcon className="h-5 w-5 text-gray-600" />
//                 </button>
//                 <div className="relative">
//                   {showAttachmentBar && (
//                     <div ref={attachmentBarRef} className="absolute" style={{ left: '-50px', bottom: '118%' }}>
//                       <div className="flex flex-col items-center bg-white/60 backdrop-blur-2xl border border-purple-100/40 shadow-2xl rounded-xl px-1.5 py-2 z-50 gap-2" style={{ minWidth: '36px', boxShadow: '0 4px 16px 0 rgba(168,139,250,0.12)' }}>
//                         <button
//                           className="group p-1 rounded-xl bg-gradient-to-br from-white/80 to-purple-50 transition-all duration-150 flex flex-col items-center gap-0.5 hover:bg-purple-100 hover:scale-105"
//                           type="button"
//                           onClick={() => {
//                             if (photoInputRef.current) photoInputRef.current.click();
//                           }}
//                         >
//                           <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-all duration-150">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 group-hover:text-purple-800 transition-all duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity=".08" />
//                               <circle cx="8" cy="9" r="1.5" fill="currentColor" />
//                               <path d="M21 19l-5.5-7-4.5 6-3-4L3 19" stroke="currentColor" strokeWidth="1.2" fill="none" />
//                             </svg>
//                           </span>
//                           <span className="text-[9px] font-semibold text-purple-700 group-hover:text-purple-900 tracking-wide transition-all duration-150">Photo</span>
//                         </button>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           ref={photoInputRef}
//                           style={{ display: 'none' }}
//                           onChange={() => { /* handle file selection here if needed */ }}
//                         />
//                         <button className="group p-1 rounded-xl bg-gradient-to-br from-white/80 to-purple-50 transition-all duration-150 flex flex-col items-center gap-0.5 hover:bg-purple-100 hover:scale-105" type="button">
//                           <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-all duration-150">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 group-hover:text-purple-800 transition-all duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity=".08" />
//                               <polygon points="10,9 16,12 10,15" fill="currentColor" />
//                               <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
//                             </svg>
//                           </span>
//                           <span className="text-[9px] font-semibold text-purple-700 group-hover:text-purple-900 tracking-wide transition-all duration-150">GIF</span>
//                         </button>
//                         <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-8px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid rgba(255,255,255,0.7)', filter: 'blur(0.5px) drop-shadow(0 2px 4px rgba(168,139,250,0.10)' }} />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <input
//                   type="text"
//                   value={text}
//                   onChange={(q) => { setText(q.target.value) }}
//                   onKeyDown={(e) => {
//                     try {
//                       if (e.key === 'Enter' && text.trim()) {
//                         e.preventDefault();
//                         chat();
//                       }
//                     } catch (error) {
//                       console.error("Error while sending message on Enter key:", error);
//                     }
//                   }}
//                   placeholder="Type a message..."
//                   className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   style={{ minWidth: 0 }}
//                 />

//                 <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center" type="button">
//                   {/* Modern, stylish mic icon */}
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <rect x="9" y="5" width="6" height="8" rx="3" fill="white" />
//                     <path d="M12 17v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//                     <path d="M8 13a4 4 0 008 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//                     <circle cx="12" cy="9" r="3" fill="white" />
//                   </svg>
//                 </button>
//                 <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center" type="button">
//                   <PaperAirplaneIcon onClick={chat} className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="hidden md:flex flex-1 items-center justify-center bg-white ml-8 mr-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
//             <div className="text-center animate-fadeIn">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-0.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//               </svg>
//               <h3 className="mt-2 text-sm font-semibold text-gray-900">No chat selected</h3>
//               <p className="mt-1 text-sm text-gray-500">Select a user to start messaging</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatList;














































import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { GetTokenFromCookie } from '../getToken/GetToken';
import socket from "../socket_io/Socket";
import moment from 'moment';

const ChatList = ({ activeTab }) => {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sender, setSender] = useState();
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showAttachmentBar, setShowAttachmentBar] = useState(false);
  const attachmentBarRef = useRef(null);
  const photoInputRef = useRef(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [openMenuMsgId, setOpenMenuMsgId] = useState(null);
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [touchTimer, setTouchTimer] = useState(null);
  const [mobileMenuMsgId, setMobileMenuMsgId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  const sampleMessages = {
    1: [
      { id: 1, text: "Hey, how are you?", sender: "them", time: "10:30 AM" },
      { id: 2, text: "I'm good, thanks! How about you?", sender: "me", time: "10:31 AM" },
    ],
    2: [
      { id: 1, text: "See you tomorrow!", sender: "them", time: "9:45 AM" },
      { id: 2, text: "Yes, looking forward to it!", sender: "me", time: "9:46 AM" }
    ]
  };

  useEffect(() => {
    try {
      const decodedUser = GetTokenFromCookie(); // JWT se user decode
      if (decodedUser?.id) {
        setSender({ ...decodedUser, id: decodedUser.id.toString() });
        
        // Only emit join event once with proper ID
        console.log("Joining socket with ID:", decodedUser.id.toString());
        socket.emit("join", decodedUser.id.toString());
      } else {
        console.warn("No user ID found in token for socket join");
      }
    } catch (error) {
      console.error("Error decoding token or joining socket:", error);
    }
  }, []);

  // Separate useEffect for socket events to avoid dependency issues
  useEffect(() => {
    // Listen for online users updates
    console.log("Setting up updateOnlineUsers listener");
    
    socket.on("updateOnlineUsers", (users) => {
      console.log("Received online users update:", users);
      // Create a Set for efficient lookups and avoid unnecessary re-renders
      setOnlineUsers(new Set(users));
    });

    return () => {
      // Clean up listener on component unmount
      socket.off("updateOnlineUsers");
    };
  }, []);



  const getUser = async () => {
    try {
      const query = `
        query {
          users {
            id
            name
            profileImage
          }
        }
      `;
      const response = await axios.post(
        "http://localhost:5000/graphql",
        { query },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setUsers(response.data.data.users);
    } catch (error) {
      console.error(error.response?.data?.errors?.[0]?.message || "Unknown error");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  let receiverId = selectedChat?.id;
  const getChat = async () => {
    if (!sender?.id || !selectedChat?.id) {
      alert("Sender ya Receiver select nahi hua");
      return;
    }

    try {
      const query = `
      query {
        getMessages(senderId: "${sender?.id}", receiverId: "${receiverId}") {
        id
      message
      sender {
        id
      }
      receiver {
        id
      }
      createdAt
        }
      }
    `;

      const response = await axios.post(
        "http://localhost:5000/graphql",
        { query },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setMessages(response?.data?.data?.getMessages);
    } catch (error) {
      console.error(error.response?.data?.errors?.[0]?.message || "Unknown error");
    }
  };

  useEffect(() => {
    if (sender?.id && receiverId) {
      getChat();
    }
  }, [sender, receiverId]);

  const handleChatSelect = (user) => {
    try {
      setIsAnimating(true);
      setSelectedChat(user);
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };


  const chat = async () => {
    if (!sender?.id || !selectedChat?.id) {
      alert("Sender ya Receiver select nahi hua");
      return;
    }
    try {
      let finalMessage = text;
      let replyMeta = null;
      if (replyToMsg) {
        // Prepend quoted text for UI
        finalMessage = `> ${replyToMsg.message}\n${text}`;
        replyMeta = { replyToId: replyToMsg.id, replyToText: replyToMsg.message };
      }
      const query = `
    mutation sendMessage($senderId: ID!, $receiverId: ID!, $message: String!) {
    sendMessage(senderId: $senderId, receiverId: $receiverId, message: $message) {
      id
      message
      createdAt
      sender {
        id
        name
      }
      receiver {
        id
        name
      }
    }
  }`
      const variables = {
        senderId: sender?.id,
        receiverId: selectedChat?.id,
        message: finalMessage,
      }
      const response = await axios.post(
        "http://localhost:5000/graphql",
        { query, variables },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response?.data?.data?.sendMessage) {
        getChat();
      }
      setText(""); // Clear input after send
      setReplyToMsg(null);
    } catch (error) {
      console.error(error.response?.data?.errors?.[0]?.message || "Unknown error");
    }
  }

  useEffect(() => {
    if (!socket || !selectedChat?.id) return;

    const handleIncomingMessage = (msg) => {
      // sirf wahi message show karo jo current selected chat se related ho
      if (
        msg.sender.id === selectedChat.id ||
        msg.receiver.id === selectedChat.id
      ) {
        // setMessages(prev => [...prev, msg]);
        console.log(msg);

      }
    };

    socket.on("receiveMessage", handleIncomingMessage);

    // Cleanup on unmount or chat change
    return () => {
      socket.off("receiveMessage", handleIncomingMessage);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!showAttachmentBar) return;
    
    try {
      function handleClickOutside(event) {
        try {
          if (attachmentBarRef.current && !attachmentBarRef.current.contains(event.target)) {
            setShowAttachmentBar(false);
          }
        } catch (error) {
          console.error("Error handling click outside attachment bar:", error);
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        try {
          document.removeEventListener('mousedown', handleClickOutside);
        } catch (error) {
          console.error("Error removing event listener:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up attachment bar click handler:", error);
    }
  }, [showAttachmentBar]);

  useEffect(() => {
    if (!headerMenuOpen) return;
    
    try {
      function handleClickOutside(event) {
        try {
          if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
            setHeaderMenuOpen(false);
          }
        } catch (error) {
          console.error("Error handling click outside header menu:", error);
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        try {
          document.removeEventListener('mousedown', handleClickOutside);
        } catch (error) {
          console.error("Error removing event listener:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up header menu click handler:", error);
    }
  }, [headerMenuOpen]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* Chat List */}
      <div className={`w-full md:w-1/3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300 ease-in-out md:ml-8 ${selectedChat ? 'hidden md:block' : 'block'}`}>
        <div className="overflow-y-auto h-full custom-scrollbar">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleChatSelect(user)}
              className={`flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50/80 ${selectedChat?.id === user.id ? 'bg-purple-50' : ''
                }`}
            >
              <div className="flex items-center w-full">
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                  <p className={`text-xs ${onlineUsers.has(user.id) ? 'text-green-500' : 'text-gray-400'} truncate`}>
                    {onlineUsers.has(user.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full min-h-0">
        {selectedChat ? (
          <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:ml-8 md:mr-4 overflow-hidden transform transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="flex-none border-b border-gray-100 p-4 flex items-center justify-between bg-white">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <img
                  src={selectedChat.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}`}
                  alt={selectedChat.name}
                  className="w-12 h-12 rounded-full ring-2 ring-purple-100"
                />
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className={`text-xs flex items-center ${onlineUsers.has(selectedChat?.id) ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${onlineUsers.has(selectedChat?.id) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {onlineUsers.has(selectedChat?.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-[80px] md:mb-0 relative">
                <button className="p-2 hover:bg-gray-100 rounded-full"><PhoneIcon className="h-5 w-5 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><VideoCameraIcon className="h-5 w-5 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setHeaderMenuOpen((v) => !v)} ref={headerMenuRef}>
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                </button>
                {headerMenuOpen && (
                  <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn">
                    <button className="px-4 py-2 text-left text-sm hover:bg-red-100 text-red-600 font-semibold" type="button">Block</button>
                  </div>
                )}
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isSent = msg?.sender?.id === sender?.id;
                  let quoted = null;
                  let mainText = msg.message;
                  if (msg.message.startsWith('> ')) {
                    const split = msg.message.split('\n');
                    quoted = split[0].replace('> ', '');
                    mainText = split.slice(1).join('\n');
                  }
                  // Mobile long-press handlers
                  const handleTouchStart = () => {
                    if (window.innerWidth < 768) {
                      const timer = setTimeout(() => {
                        setMobileMenuMsgId(msg.id);
                      }, 500);
                      setTouchTimer(timer);
                    }
                  };
                  const handleTouchEnd = () => {
                    if (window.innerWidth < 768 && touchTimer) {
                      clearTimeout(touchTimer);
                      setTouchTimer(null);
                    }
                  };
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'} relative`}
                      onMouseEnter={() => setHoveredMsgId(msg.id)}
                      onMouseLeave={() => { setHoveredMsgId(null); setOpenMenuMsgId(null); }}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* For sent messages, arrow/menu on left; for received, on right (desktop only) */}
                      {isSent && hoveredMsgId === msg.id && (
                        <div className="hidden md:flex items-center mr-2 relative">
                          <button
                            className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-transform duration-200 ${openMenuMsgId === msg.id ? 'rotate-180' : ''}`}
                            onClick={e => { e.stopPropagation(); setOpenMenuMsgId(msg.id); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openMenuMsgId === msg.id && (
                            <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn"
                              style={{ right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px', animation: 'fadeInLeft 0.2s' }}
                            >
                              <button className="px-4 py-2 text-left text-sm hover:bg-gray-100" type="button" onClick={() => { setReplyToMsg(msg); setOpenMenuMsgId(null); }}>Reply</button>
                              <button className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500" type="button">Delete</button>
                              <button className="px-4 py-2 text-left text-sm hover:bg-red-100 text-red-600 font-semibold" type="button">Block</button>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${isSent ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2`}>
                        {quoted && (
                          <div className="text-xs text-purple-300 border-l-4 border-purple-400 pl-2 mb-1 whitespace-pre-line">{quoted}</div>
                        )}
                        <p className="text-sm whitespace-pre-line">{mainText}</p>
                        <span className={`text-xs mt-1 block text-white ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>{moment(Number(msg.createdAt)).format('hh:mm A')}</span>
                      </div>
                      {!isSent && hoveredMsgId === msg.id && (
                        <div className="hidden md:flex items-center ml-2 relative">
                          <button
                            className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-transform duration-200 ${openMenuMsgId === msg.id ? 'rotate-180' : ''}`}
                            onClick={e => { e.stopPropagation(); setOpenMenuMsgId(msg.id); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openMenuMsgId === msg.id && (
                            <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn"
                              style={{ left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px', animation: 'fadeInLeft 0.2s' }}
                            >
                              <button className="px-4 py-2 text-left text-sm hover:bg-gray-100" type="button" onClick={() => { setReplyToMsg(msg); setOpenMenuMsgId(null); }}>Reply</button>
                              <button className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500" type="button">Delete</button>
                              <button className="px-4 py-2 text-left text-sm hover:bg-red-100 text-red-600 font-semibold" type="button">Block</button>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Mobile: show options on long press */}
                      {mobileMenuMsgId === msg.id && (
                        <div className="md:hidden absolute z-50 bg-white border border-gray-200 rounded shadow-md py-1 w-32 flex flex-col animate-fadeIn"
                          style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animation: 'fadeInLeft 0.2s' }}
                        >
                          <button className="px-4 py-2 text-left text-sm hover:bg-gray-100" type="button" onClick={() => { setReplyToMsg(msg); setMobileMenuMsgId(null); }}>Reply</button>
                          <button className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500" type="button" onClick={() => setMobileMenuMsgId(null)}>Delete</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Input - always at bottom, never scrolls */}
            <div className="flex-none border-t border-gray-100 p-4 bg-white relative z-10">
              {/* Reply mention UI */}
              {replyToMsg && (
                <div className="flex items-center mb-2 px-3 py-1 rounded-lg bg-purple-50 border-l-4 border-purple-400">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-purple-700 font-semibold">Replying to:</span>
                    <span className="block text-xs text-gray-700 truncate max-w-xs">{replyToMsg.message}</span>
                  </div>
                  <button className="ml-2 p-1 rounded-full hover:bg-purple-100" onClick={() => setReplyToMsg(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowAttachmentBar((prev) => !prev)}
                  type="button"
                >
                  <PaperClipIcon className="h-5 w-5 text-gray-600" />
                </button>
                <div className="relative">
                  {showAttachmentBar && (
                    <div ref={attachmentBarRef} className="absolute" style={{ left: '-50px', bottom: '118%' }}>
                      <div className="flex flex-col items-center bg-white/60 backdrop-blur-2xl border border-purple-100/40 shadow-2xl rounded-xl px-1.5 py-2 z-50 gap-2" style={{ minWidth: '36px', boxShadow: '0 4px 16px 0 rgba(168,139,250,0.12)' }}>
                        <button
                          className="group p-1 rounded-xl bg-gradient-to-br from-white/80 to-purple-50 transition-all duration-150 flex flex-col items-center gap-0.5 hover:bg-purple-100 hover:scale-105"
                          type="button"
                          onClick={() => {
                            if (photoInputRef.current) photoInputRef.current.click();
                          }}
                        >
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-all duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 group-hover:text-purple-800 transition-all duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity=".08" />
                              <circle cx="8" cy="9" r="1.5" fill="currentColor" />
                              <path d="M21 19l-5.5-7-4.5 6-3-4L3 19" stroke="currentColor" strokeWidth="1.2" fill="none" />
                            </svg>
                          </span>
                          <span className="text-[9px] font-semibold text-purple-700 group-hover:text-purple-900 tracking-wide transition-all duration-150">Photo</span>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={photoInputRef}
                          style={{ display: 'none' }}
                          onChange={() => { /* handle file selection here if needed */ }}
                        />
                        <button className="group p-1 rounded-xl bg-gradient-to-br from-white/80 to-purple-50 transition-all duration-150 flex flex-col items-center gap-0.5 hover:bg-purple-100 hover:scale-105" type="button">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-all duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 group-hover:text-purple-800 transition-all duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity=".08" />
                              <polygon points="10,9 16,12 10,15" fill="currentColor" />
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </svg>
                          </span>
                          <span className="text-[9px] font-semibold text-purple-700 group-hover:text-purple-900 tracking-wide transition-all duration-150">GIF</span>
                        </button>
                        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-8px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid rgba(255,255,255,0.7)', filter: 'blur(0.5px) drop-shadow(0 2px 4px rgba(168,139,250,0.10)' }} />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={text}
                  onChange={(q) => { setText(q.target.value) }}
                  onKeyDown={(e) => {
                    try {
                      if (e.key === 'Enter' && text.trim()) {
                        e.preventDefault();
                        chat();
                      }
                    } catch (error) {
                      console.error("Error while sending message on Enter key:", error);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ minWidth: 0 }}
                />

                <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center" type="button">
                  {/* Modern, stylish mic icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="9" y="5" width="6" height="8" rx="3" fill="white" />
                    <path d="M12 17v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 13a4 4 0 008 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="9" r="3" fill="white" />
                  </svg>
                </button>
                <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center" type="button">
                  <PaperAirplaneIcon onClick={chat} className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white ml-8 mr-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="text-center animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-0.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No chat selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a user to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;





