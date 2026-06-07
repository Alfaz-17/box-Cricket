import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, ChevronLeft, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ChatAssistant = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([
    {
      sender: "ai",
      text: "नमस्ते मोटा भाई! मैं आपकी कैसे मदद कर सकता हूँ? आप स्लॉट, टाइमिंग या प्राइस के बारे में पूछ सकते हैं।",
      structuredData: null,
    }
  ]);
  const [sessionId, setSessionId] = useState(null);
  const [inputText, setInputText] = useState("");

  const scrollRef = useRef(null); 
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom
  const scrollToBottom = (instant = false) => {
    if (scrollRef.current) {
      const scrollOptions = {
        top: scrollRef.current.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      };
      scrollRef.current.scrollTo(scrollOptions);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(""); // Clear input immediately
    setConversationHistory(prev => [...prev, { sender: "user", text: textToSend }]);
    setLoading(true);

    try {
      const response = await api.post("/chat/check-slot", { 
        text: textToSend,
        sessionId 
      });
      const data = response.data;
      
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.replyText) {
         setConversationHistory(prev => [
           ...prev, 
           { 
             sender: "ai", 
             text: data.replyText, 
             structuredData: data.structuredData || null 
           }
         ]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setConversationHistory(prev => [...prev, { sender: "ai", text: "Something went wrong.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🌌 FULL PAGE CONTAINER - Brand Background (Dark Navy)
    <div className="fixed inset-0 z-50 flex flex-col h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      
      {/* 🟢 HEADER - Clean & Simple */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/10 bg-background/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
             <button onClick={onClose || (() => navigate(-1))} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-6 h-6" />
             </button>
             <div>
                <h1 className="text-lg font-semibold tracking-wide text-foreground">Assistant</h1>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        Online
                    </span>
                </div>
             </div>
        </div>
        
        <button 
          onClick={onClose || (() => navigate(-1))}
          className="p-3 bg-secondary/10 hover:bg-secondary/20 rounded-full text-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 💬 CONVERSATION AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-6 pb-32 z-10 scrollbar-hide space-y-6 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {conversationHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              layout
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} w-full`}
            >
                {/* MESSAGE TEXT */}
               <div className={`px-5 py-3 max-w-[85%] text-base font-medium leading-relaxed rounded-2xl shadow-sm
                  ${msg.sender === "user" 
                    ? "bg-secondary text-secondary-foreground rounded-tr-sm" 
                    : "bg-card border border-border text-card-foreground rounded-tl-sm" 
                  }
                  ${msg.isError ? "bg-destructive/10 border-destructive/20 text-destructive" : ""}
               `}>
                  {msg.text}
               </div>

               {/* 📊 DATA CARD - Clean & Legible */}
               {msg.structuredData && (
                 <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 w-full max-w-sm bg-card border border-border rounded-xl p-4 shadow-lg overflow-hidden"
                 >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${
                                msg.structuredData.status === 'PAST' ? 'bg-yellow-500' :
                                msg.structuredData.available ? 'bg-secondary' : 'bg-destructive'
                             }`} />
                             <span className={`text-sm font-bold uppercase tracking-wide ${
                                 msg.structuredData.status === 'PAST' ? 'text-yellow-500' : 'text-foreground'
                             }`}>
                                {msg.structuredData.status === 'PAST' ? "Time Passed" :
                                 msg.structuredData.available ? "Available" : "Booked"}
                             </span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                            {msg.structuredData.date}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                             <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Start Time</p>
                             <p className="text-lg font-bold text-foreground">{msg.structuredData.startTime}</p>
                        </div>
                        <div>
                             <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">End Time</p>
                             <p className="text-lg font-bold text-foreground">{msg.structuredData.endTime}</p>
                        </div>
                    </div>
                        
                    {msg.structuredData.boxes.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-2">Open Turfs</p>
                            <div className="flex flex-wrap gap-2">
                                {msg.structuredData.boxes.map(box => (
                                    <span key={box} className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-md text-xs font-bold">
                                        {box}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                 </motion.div>
               )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* 🎛️ BRANDED FOOTER CONTROLS */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-background/90 backdrop-blur-xl border-t border-border/10 flex flex-col items-center justify-center z-50">
         <div className="w-full max-w-2xl flex gap-3 items-center">
            <div className="p-3 bg-secondary/10 rounded-full text-secondary shrink-0">
               <MessageSquare className="w-6 h-6" />
            </div>
            
            <div className="flex-1 relative">
               <input 
                  className="w-full bg-card border border-border rounded-full px-5 py-3 pr-12 outline-none focus:border-secondary transition-colors text-foreground placeholder:text-muted-foreground shadow-lg" 
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendText()}
                  disabled={loading}
                  autoFocus
               />
               <button 
                  onClick={handleSendText} 
                  disabled={!inputText.trim() || loading}
                  className="absolute right-1 top-1 p-2 bg-secondary text-secondary-foreground rounded-full mx-1 my-1 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default ChatAssistant;
