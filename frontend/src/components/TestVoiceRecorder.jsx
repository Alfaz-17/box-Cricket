import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestVoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  // removed separate audioBlob state as we send immediately now
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  // 🔊 Auto-play AI voice response
  useEffect(() => {
    if (response?.audioUrl && audioRef.current) {
      const audioUrl = `http://localhost:5001${response.audioUrl}`;
      console.log('🔊 Attempting to play audio from:', audioUrl);
      
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      audioRef.current.play()
        .catch((error) => console.error('❌ Audio playback failed:', error));
    }
  }, [response]);

  const sendToBackend = async (blob) => {
    setLoading(true);
    setResponse(null);

    const formData = new FormData();
    formData.append("audio", blob, "voice.webm");

    try {
      const res = await fetch("http://localhost:5001/api/voice/check-slot", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({
        error: "Upload failed",
        details: err.toString(),
        hint: "Is backend running on port 5001?"
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // 🚀 Auto-send immediately
        sendToBackend(blob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setResponse(null); // Clear previous
    } catch (err) {
      setResponse({ error: "Microphone Access Denied" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const resetState = () => {
    setResponse(null);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      
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
        ) : !response && (
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

      {/* 💬 RESPONSE CARD */}
      <AnimatePresence>
        {response && !loading && !recording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mt-8 max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={resetState}
              className="absolute top-2 right-2 p-1 text-white/30 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {response.error ? (
              <div className="text-red-300 text-center">
                <p className="font-semibold">{response.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Text */}
                <div className="flex justify-end">
                  <div className="bg-white/10 text-white/80 text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                    {response.voiceText}
                  </div>
                </div>

                {/* AI Text */}
                <div className="flex justify-start items-end gap-2">
                  <div className="min-w-8 min-h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <span className="text-emerald-400 text-xs font-bold">AI</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-white text-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                    {response.replyText}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} crossOrigin="anonymous" hidden />
    </div>
  );
};

export default TestVoiceRecorder;
