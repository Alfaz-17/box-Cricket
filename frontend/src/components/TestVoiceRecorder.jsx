import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, X, RotateCcw, Calendar, Clock, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestVoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [welcomePlayed, setWelcomePlayed] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const historyEndRef = useRef(null);

  // 👋 Play Welcome Message on Mount
  useEffect(() => {
    const playWelcome = async () => {
      if (welcomePlayed) return;
      
      try {
        const res = await fetch("http://localhost:5001/api/voice/welcome");
        const data = await res.json();
        
        if (data.audioUrl && audioRef.current) {
          console.log('👋 Playing welcome message:', data.replyText);
          const audioUrl = `http://localhost:5001${data.audioUrl}`;
          
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          
          // Add welcome message to history as AI greeting
          setConversationHistory(prev => [
            { 
              type: 'ai', 
              text: data.replyText, 
              // Don't auto-play this specific message via the other useEffect
              // because we are playing it manually here to ensure it works on start
              timestamp: Date.now() 
            }
          ]);

          try {
            await audioRef.current.play();
            if (!welcomePlayed) {
  welcomePlayed();
  setWelcomePlayed(true);
}
          } catch (modals) {
            console.log("Autoplay blocked usually - user interaction needed");
          }
        }
      } catch (err) {
        console.error("Failed to fetch welcome message:", err);
      }
    };

    playWelcome();
  }, []);

  // 🔊 Auto-play AI voice response (Modified to skip if it's the welcome message we just played)
  useEffect(() => {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    
    // Check if it's a new AI message with audio that isn't the initial welcome one
    // (The welcome one is handled in its own useEffect)
    if (lastMessage?.audioUrl && lastMessage.type === 'ai' && audioRef.current && !welcomePlayed) {
       // logic existing...
    } else if (lastMessage?.audioUrl && lastMessage.type === 'ai' && audioRef.current) {
      const audioUrl = `http://localhost:5001${lastMessage.audioUrl}`;
      console.log('🔊 Attempting to play audio from:', audioUrl);
      
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      audioRef.current.play()
        .catch((error) => console.error('❌ Audio playback failed:', error));
    }
  }, [conversationHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const sendToBackend = async (blob) => {
    setLoading(true);

    const formData = new FormData();
const extension = blob.type.includes("mp4") ? "mp4" : "webm";
formData.append("audio", blob, `voice.${extension}`);
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    try {
      const res = await fetch("http://localhost:5001/api/voice/check-slot", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      // Update session ID
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add user message to history
      setConversationHistory(prev => [
        ...prev,
        { type: 'user', text: data.voiceText, timestamp: Date.now() }
      ]);

      // Add AI response to history
      setConversationHistory(prev => [
        ...prev,
        { 
          type: 'ai', 
          text: data.replyText, 
          audioUrl: data.audioUrl,
          needsMoreInfo: data.needsMoreInfo,
          structuredData: data.structuredData, // ⭐ NEW: Structured data
          timestamp: Date.now() 
        }
      ]);

    } catch (err) {
      setConversationHistory(prev => [
        ...prev,
        {
          type: 'error',
          text: `Upload failed: ${err.toString()}`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });

    let mimeType = "audio/webm";
    if (!window.MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/mp4"; // ✅ iOS / mobile safe
    }

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      if (!chunksRef.current.length) {
        console.error("❌ No audio recorded");
        return;
      }

      const blob = new Blob(chunksRef.current, { type: mimeType });
      sendToBackend(blob);
    };

    mediaRecorderRef.current.start();
    setRecording(true);

  } catch (err) {
    setConversationHistory(prev => [
      ...prev,
      { type: 'error', text: 'Microphone access denied', timestamp: Date.now() }
    ]);
  }
};


  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const resetConversation = () => {
    setSessionId(null);
    setConversationHistory([]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-screen">
      
      {/* 💬 CONVERSATION HISTORY */}
      {conversationHistory.length > 0 && (
        <div className="w-full max-w-2xl mb-6 flex-1 overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
          {conversationHistory.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'ai' && (
                <div className="min-w-8 min-h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mr-2 flex-shrink-0">
                  <span className="text-emerald-400 text-xs font-bold">AI</span>
                </div>
              )}
              
              <div className={`max-w-[75%] ${
                msg.type === 'user' 
                  ? 'bg-white/10 text-white/80 rounded-2xl rounded-tr-sm px-4 py-2' 
                  : msg.type === 'error'
                  ? 'bg-red-500/10 text-red-300 border border-red-500/20 rounded-2xl px-4 py-2'
                  : 'space-y-2'
              }`}>
                {msg.type === 'ai' ? (
                  <>
                    {/* AI Text Response */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-white rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    
                    {/* ⭐ Structured Data Card */}
                    {msg.structuredData && (
                      <div className="bg-white/10 border border-white/20 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
                          <Box size={14} />
                          <span>Booking Details</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {/* Date */}
                          <div className="flex items-center gap-2 text-white/80">
                            <Calendar size={14} className="text-blue-400" />
                            <span className="font-medium">{msg.structuredData.date}</span>
                          </div>
                          
                          {/* Time Range */}
                          <div className="flex items-center gap-2 text-white/80">
                            <Clock size={14} className="text-green-400" />
                            <span className="font-medium">
                              {msg.structuredData.startTime} - {msg.structuredData.endTime}
                            </span>
                          </div>
                        </div>

                        {/* Boxes */}
                        {msg.structuredData.boxes && msg.structuredData.boxes.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="flex flex-wrap gap-1.5">
                              {msg.structuredData.boxes.map((box, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-md border border-emerald-500/30"
                                >
                                  {box}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Availability Status */}
                        <div className="pt-2 border-t border-white/10">
                          <span className={`text-xs font-semibold ${
                            msg.structuredData.available 
                              ? 'text-emerald-400' 
                              : 'text-red-400'
                          }`}>
                            {msg.structuredData.available ? '✓ Available' : '✗ Not Available'}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={historyEndRef} />
        </div>
      )}

      {/* 🔄 NEW CONVERSATION BUTTON */}
      {conversationHistory.length > 0 && (
        <button
          onClick={resetConversation}
          className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm rounded-lg border border-white/20 transition-all flex items-center gap-2"
        >
          <RotateCcw size={16} />
          New Conversation
        </button>
      )}
      
      {/* 🎤 MICROPHONE ORB */}
      <div className="relative mb-8">
        {/* Pulsing rings when recording */}
        {recording && (
          <>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-40"
            />
          </>
        )}

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className={`relative z-10 p-6 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 ${
            recording
              ? 'bg-red-600 text-white scale-110'
              : loading 
              ? 'bg-gray-100/10 text-gray-400 cursor-not-allowed border border-white/20'
              : 'bg-black text-white hover:scale-105 border border-white/10'
          }`}
        >
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : recording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* STATUS TEXT */}
      <AnimatePresence mode='wait'>
        {recording ? (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-white/80 font-medium tracking-wide animate-pulse"
          >
            Listening...
          </motion.p>
        ) : loading ? (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-white/60 font-medium tracking-wide"
          >
            Thinking...
          </motion.p>
        ) : conversationHistory.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-white/40 text-sm font-light tracking-wider"
          >
            Tap to speak
          </motion.p>
        )}
      </AnimatePresence>

      <audio ref={audioRef} crossOrigin="anonymous" hidden />
    </div>
  );
};

export default TestVoiceRecorder;


