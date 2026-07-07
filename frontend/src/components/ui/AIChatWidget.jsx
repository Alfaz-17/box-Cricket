import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Clock, MapPin, Calendar, HelpCircle, User } from 'lucide-react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

const AIChatWidget = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    {
      sender: 'ai',
      text: "Hi! 🏏 I'm your BookMyBox AI Assistant. Ask me anything about turf locations, prices, ground rules, or check real-time slot availability (e.g., 'What boxes are free tomorrow afternoon?')!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [history, isOpen]);

  const suggestions = [
    'Which boxes are free tomorrow?',
    'Show me turf pricing & details',
    'What is the refund policy?',
    ...(isAuthenticated ? ['Show my bookings'] : ['How do I book a slot?']),
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim() || isLoading) return;

    setErrorMsg('');
    const userMessage = { sender: 'user', text };
    setHistory((prev) => [...prev, userMessage]);
    if (!textToSend) setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        history: history, // send current history
      });

      if (response.data?.success) {
        setHistory((prev) => [
          ...prev,
          { sender: 'ai', text: response.data.reply },
        ]);
      } else {
        throw new Error(response.data?.message || 'Server error');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      setErrorMsg('Could not connect to the assistant.');
      setHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "Sorry, I'm having trouble connecting to the booking service right now. Please verify your network and check that the server is running.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(107,142,35,0.4)] cursor-pointer relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Sparkles size={24} className="animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border border-primary animate-ping opacity-30 pointer-events-none" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">BookMyBox Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] opacity-80 font-semibold">Gemini 2.5 Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {history.map((msg, index) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${!isAI ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isAI
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : 'bg-secondary text-secondary-foreground border border-white/10'
                      }`}
                    >
                      {isAI ? <Sparkles size={12} /> : <User size={12} />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isAI
                          ? msg.isError
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-secondary text-secondary-foreground border border-white/5'
                          : 'bg-primary text-primary-foreground font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} />
                  </div>
                  <div className="bg-secondary border border-white/5 rounded-xl px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
                  <X size={14} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/10 flex gap-2 overflow-x-auto scrollbar-hide">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-secondary hover:bg-primary/10 border border-white/5 hover:border-primary/20 text-muted-foreground hover:text-primary text-[11px] font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Footer Input */}
            <div className="p-4 border-t border-white/10 bg-card flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about boxes, pricing, availability..."
                disabled={isLoading}
                className="flex-grow px-4 py-2.5 rounded-xl bg-background border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!message.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatWidget;
