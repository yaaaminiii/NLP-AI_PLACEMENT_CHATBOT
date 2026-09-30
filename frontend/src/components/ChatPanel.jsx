import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Check, Trash2, Sparkles, GraduationCap, Compass, Code, Brain, FileText, UserCheck, Briefcase, HelpCircle } from 'lucide-react';
import api from '../services/api';

export default function ChatPanel({ onMessageSent }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your AI Placement Assistant. How can I help you prepare for campus placements, aptitude tests, coding rounds, DSA, or interview rounds today?",
      intent: 'greeting',
      confidence: 0.99,
      timestamp: '10:00 AM',
    },
    {
      id: 2,
      sender: 'user',
      text: "What is the eligibility for placements?",
      timestamp: '10:15 AM',
    },
    {
      id: 3,
      sender: 'bot',
      text: "Typical campus placement eligibility requires: 1) Minimum 60% or 6.5+ CGPA in B.Tech/Degree, 2) 60%+ in 10th and 12th standard, and 3) No active backlogs at the time of recruitment.",
      intent: 'placement_eligibility',
      confidence: 0.96,
      timestamp: '10:15 AM',
    },
    {
      id: 4,
      sender: 'user',
      text: "Give me a placement preparation roadmap.",
      timestamp: '10:16 AM',
    },
    {
      id: 5,
      sender: 'bot',
      text: "Placement Roadmap: Phase 1: 1 language + basic DSA (Arrays, Strings). Phase 2: Advanced DSA + Core CS (DBMS, OS, OOP, CN). Phase 3: 2 projects + resume building. Phase 4: Mock interviews and company test series!",
      intent: 'placement_roadmap',
      confidence: 0.98,
      timestamp: '10:16 AM',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText = null) => {
    const textToSend = typeof queryText === 'string' ? queryText : inputQuery;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.sendMessage(textToSend);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.response,
        intent: response.intent,
        confidence: response.confidence,
        confidence_pct: response.confidence_percentage,
        response_time: response.response_time,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pipeline: response.pipeline_details,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Notify parent to refresh statistics and charts
      if (onMessageSent) {
        onMessageSent(response);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg(err.response?.data?.details || err.message || 'Failed to connect to backend server');

      const errorBotMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I encountered an issue connecting to the assistant. Please ensure the server is running.",
        intent: 'error',
        confidence: 0.0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Conversation cleared. What placement topic would you like to prepare for?",
        intent: 'greeting',
        confidence: 1.0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Quick Question Cards below the chatbot input
  const quickCards = [
    { label: "Placement Roadmap", query: "Give me a placement preparation roadmap.", icon: Compass },
    { label: "Aptitude Preparation", query: "How should I prepare for aptitude tests?", icon: Brain },
    { label: "Coding Preparation", query: "What topics should I study for coding rounds?", icon: Code },
    { label: "DSA Topics", query: "What DSA topics should I learn?", icon: Sparkles },
    { label: "Interview Questions", query: "What are common interview questions?", icon: HelpCircle },
    { label: "Resume Tips", query: "How can I improve my resume?", icon: FileText },
    { label: "HR Interview", query: "What are common HR interview questions?", icon: UserCheck },
    { label: "Internships", query: "How to get an internship in college?", icon: Briefcase },
  ];

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] flex flex-col shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0e1628]">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-semibold text-white text-sm tracking-wide">
            AI Placement Assistant
          </h2>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          title="Clear current chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Message List */}
      <div className="p-5 overflow-y-auto space-y-4 h-[380px]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-start gap-2.5 max-w-[85%]">
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-indigo-600/20">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                )}

                <div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-[#4f46e5] text-white rounded-tr-none'
                        : 'bg-[#182238] text-slate-200 border border-[#23314e] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Message Meta Info */}
                  <div
                    className={`flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isUser ? (
                      <Check className="w-3 h-3 text-indigo-300" />
                    ) : (
                      msg.intent && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                            {msg.intent.replace('_', ' ')}
                          </span>
                          {msg.confidence !== undefined && (
                            <span className="text-[10px] text-emerald-400 font-medium">
                              {Math.round(msg.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5 max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#182238] border border-[#23314e] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 typing-dot" />
              <span className="text-xs text-slate-400 ml-2 font-normal">Analyzing placement query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 border-t border-[#1e293b] bg-[#0e1628]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your placement question..."
            disabled={loading}
            className="flex-1 bg-[#141d33] border border-[#223050] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Question Cards Below Chatbot Input */}
      <div className="p-3.5 bg-[#0b101d] border-t border-[#1a243a]">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Placement Topics</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(card.query)}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#141d33] hover:bg-indigo-600/25 hover:border-indigo-500/50 border border-[#1e293b] text-left transition-all group disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white font-medium truncate">
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
