import React, { useState, useRef, useEffect } from "react";
import { Mic, X, Loader2, Volume2, AudioWaveform, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../utils/api";

// 🎨 BRAND ALIGNED PALETTE (from index.css & tailwind.config)
// Using CSS variables to ensure strict theme matching
// --background: Dark Navy
// --secondary: Lime Yellow (Highlight)
// --primary: Olive Green
// --muted: Muted Text

const variants = {
  orb: {
    idle: {
      scale: [1, 1.05, 1],
      opacity: 0.5,
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      // Subtle brand pulse
      boxShadow: "0 0 40px -10px rgba(var(--secondary-rgb), 0.2)" 
    },
    listening: {
      scale: [1, 1.2, 1],
      opacity: 1,
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
      // LIME YELLOW GLOW
      background: "hsl(var(--secondary))", 
      boxShadow: "0 0 60px -10px hsl(var(--secondary))" 
    },
    processing: {
      scale: 1,
      rotate: 360,
      opacity: 0.8,
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
      background: "transparent",
      border: "4px solid hsl(var(--secondary))",
      borderTopColor: "transparent"
    },
    speaking: {
      scale: [1, 1.1, 1],
      opacity: 0.9,
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
      background: "hsl(var(--accent))", 
      boxShadow: "0 0 50px -10px hsl(var(--accent))" 
    }
  }
};

const TestVoiceRecorder = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [welcomePlayed, setWelcomePlayed] = useState(() => {
    // Check if welcome was already played in this browser session
    return sessionStorage.getItem("nova_welcome_played") === "true";
  });
  
  const timerRef = useRef(null);
  const welcomeTimeoutRef = useRef(null);
  const hasInteractedRef = useRef(false);
  const audioRef = useRef(null);
  const scrollRef = useRef(null); // Container ref
  const messagesEndRef = useRef(null); // Anchor ref
  const navigate = useNavigate();

  // Scroll to bottom
  const scrollToBottom = (instant = false) => {
    if (scrollRef.current) {
      const scrollOptions = {
        top: scrollRef.current.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      };
      
      // Perform immediate scroll
      scrollRef.current.scrollTo(scrollOptions);
      
      // Perform delayed scroll to catch late-rendering animations or images
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 100);

      // Final catch-all for longer animations
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 300);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  // 1️⃣ INITIAL WELCOME MESSAGE
  useEffect(() => {
    if (!welcomePlayed) {
      // Execute immediately (fast) but allow cancellation
      welcomeTimeoutRef.current = setTimeout(() => {
        if (!hasInteractedRef.current) {
          handleWelcomeMessage();
        }
      }, 100); // Tiny delay to ensure refs are ready
    }
    
    return () => {
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
    };
  }, [welcomePlayed]);

  const handleWelcomeMessage = async () => {
    if (hasInteractedRef.current) return;
    
    try {
      setStatus("processing");
      const res = await api.get("/voice/welcome");
      const data = res.data;
      
      // Double check if user started speaking while we were fetching
      if (hasInteractedRef.current) {
        setStatus("idle");
        return;
      }

      if (data.replyText && data.audioUrl) {
        addMessageWithAudio("ai", data.replyText, data.audioUrl);
        sessionStorage.setItem("nova_welcome_played", "true");
        setWelcomePlayed(true);
      }
    } catch (error) {
      console.error("Welcome Error:", error);
      setStatus("idle");
    }
  };

  // 2️⃣ RECORDING LOGIC
  const startRecording = async () => {
    // ⚔️ CANCEL WELCOME if it's pending or playing
    hasInteractedRef.current = true;
    if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
    
    // 🔇 STOP ANY CURRENT SPEECH
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingTime(0);
      setIsListening(true);
      setStatus("listening");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        setIsListening(false);
        clearInterval(timerRef.current);
      };

      recorder.start();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Mic Access Error:", error);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  // 3️⃣ SEND TO BACKEND
  useEffect(() => {
    if (!isListening && audioChunks.length > 0) {
      handleSendAudio();
    }
  }, [isListening, audioChunks]);

  const handleSendAudio = async () => {
    setLoading(true);
    setStatus("processing");

    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");
    
    if (sessionId) formData.append("sessionId", sessionId);

    try {
      const response = await api.post("/voice/check-slot", formData);
      const data = response.data;
      if (data.sessionId) setSessionId(data.sessionId);

      if (data.voiceText) {
        setConversationHistory(prev => [...prev, { sender: "user", text: data.voiceText }]);
      }

      if (data.replyText) {
         addMessageWithAudio("ai", data.replyText, data.audioUrl, data.structuredData);
      } else {
         setStatus("idle");
      }

    } catch (error) {
      console.error("Upload Error:", error);
      setConversationHistory(prev => [...prev, { sender: "ai", text: "Connection error. Please try again.", isError: true }]);
      setStatus("idle");
    } finally {
      setLoading(false);
      setAudioChunks([]);
    }
  };

  const addMessageWithAudio = (sender, text, audioUrl, structuredData = null) => {
    setConversationHistory(prev => [...prev, { sender, text, structuredData }]);
    
    if (audioUrl) {
      setStatus("speaking");
      const audio = new Audio(`${BASE_URL}${audioUrl}`);
      audioRef.current = audio;
      
      audio.play().catch(e => console.error("Audio Playback Error:", e));
      audio.onended = () => {
        setStatus("idle");
        audioRef.current = null;
      };
    } else {
        setStatus("idle");
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
                    <span className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-muted' : 'bg-secondary animate-pulse'}`} />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        {status === 'idle' ? 'Ready' : status}
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
        className="flex-1 overflow-y-auto px-4 pt-6 pb-40 z-10 scrollbar-hide space-y-6 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {conversationHistory.length === 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-6 pb-20"
             >
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Volume2 className="w-10 h-10 text-secondary" />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                    <p className="text-xl font-medium text-foreground">How can I help you?</p>
                    <p className="text-sm text-muted-foreground">Ask about slot availability, timings, or prices.</p>
                </div>
             </motion.div>
          )}

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
                             <div className={`w-2 h-2 rounded-full ${msg.structuredData.available ? 'bg-secondary' : 'bg-destructive'}`} />
                             <span className="text-sm font-bold uppercase tracking-wide text-foreground">
                                {msg.structuredData.available ? "Available" : "Booked"}
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
         
         {/* THE INTERACTIVE BUTTON - Brand Colors */}
         <div className="relative group cursor-pointer" onClick={isListening ? stopRecording : startRecording}>
             
            {/* Animated Ring (Listening) */}
            <AnimatePresence>
                {status === "listening" && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.5, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-secondary rounded-full blur-xl"
                    />
                )}
            </AnimatePresence>

             {/* Main Button */}
             <motion.div
                variants={variants.orb}
                initial="idle"
                animate={status}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300
                    ${status === 'idle' ? 'bg-card border border-border' : ''}
                    ${status === 'processing' ? 'bg-transparent border-4 border-secondary border-t-transparent animate-spin' : ''}
                `}
             >
                {status === "listening" ? (
                    <div className="w-8 h-8 bg-background rounded-sm animate-pulse" /> 
                ) : status === "processing" ? (
                    // Loader handled by variant rotation
                    <div /> 
                ) : status === "speaking" ? (
                    <AudioWaveform className="w-8 h-8 text-background" />
                ) : (
                    <Mic className="w-8 h-8 text-secondary" />
                )}
             </motion.div>
         </div>

         <p className="mt-6 text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">
            {status === "idle" ? "Tap to Speak" : status}
         </p>

      </div>

    </div>
  );
};

export default TestVoiceRecorder;
