import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, CheckCircle2, AlertCircle, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

const TestVoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
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
      audioRef.current.load(); // Force reload
      
      audioRef.current.play()
        .then(() => {
          console.log('✅ Audio playing successfully');
        })
        .catch((error) => {
          console.error('❌ Audio playback failed:', error);
          console.log('Audio URL:', audioUrl);
          console.log('Response:', response);
        });
    }
  }, [response]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setResponse(null);
      setAudioBlob(null);
    } catch (err) {
      setResponse({
        error: "Microphone Access Denied",
        details: err.toString(),
        hint: "Please allow microphone access in your browser."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendToBackend = async () => {
    if (!audioBlob) return;

    setLoading(true);
    setResponse(null);

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl max-w-md mx-auto relative overflow-hidden"
    >
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Mic /> Voice Slot Checker
      </h2>

      <div className="flex flex-col gap-4">
        {!recording ? (
          <Button onClick={startRecording} disabled={loading}>
            <Mic className="mr-2 h-4 w-4" /> Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="outline">
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}

        {audioBlob && !recording && (
          <Button onClick={sendToBackend} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {loading ? "Analyzing..." : "Analyze Recording"}
          </Button>
        )}

        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm ${
                response.error
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-emerald-500/10 border border-emerald-500/20"
              }`}
            >
              <div className="flex gap-3">
                {response.error ? (
                  <AlertCircle />
                ) : (
                  <CheckCircle2 />
                )}

                <div className="space-y-2">
                  {response.voiceText && (
                    <p className="opacity-70 text-xs">
                      🎤 You said: {response.voiceText}
                    </p>
                  )}

                  {response.replyText && (
                    <p className="font-semibold">
                      🔊 Assistant: {response.replyText}
                    </p>
                  )}

                  {response.audioUrl && (
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          audioRef.current.play().catch((error) => {
                            console.error('❌ Replay failed:', error);
                          });
                        }
                      }}
                      className="flex items-center gap-1 text-xs underline opacity-70 hover:opacity-100"
                    >
                      <Volume2 size={14} /> Replay Voice
                    </button>
                  )}

                  {response.error && (
                    <p className="text-xs">{response.error}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔊 Hidden audio player */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="auto" hidden />
    </motion.div>
  );
};

export default TestVoiceRecorder;
