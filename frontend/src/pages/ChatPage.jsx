import React, { useState } from 'react';
import { Bot, Send, Trash2, Cpu, ArrowRight, Activity, CheckCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function ChatPage({ onMessageSent }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! Welcome to the dedicated NLP Chat studio. Send a message to see the complete internal NLP transformation pipeline in the right inspector panel.",
      intent: 'greeting',
      confidence: 0.99,
      timestamp: '10:00 AM',
      pipeline: {
        preprocessing: {
          raw_query: "Hello bot",
          cleaned_text: "hello bot",
          removed_stopwords: [],
          final_tokens: ["hello", "bot"],
          processed_text: "hello bot"
        },
        tfidf_features: [{ feature: "hello", weight: 0.72 }, { feature: "bot", weight: 0.69 }],
        final_intent: "greeting",
        confidence: 0.99,
        top_candidates: [{ intent: "greeting", probability: 0.99 }],
        response_time_seconds: 0.002
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePipeline, setActivePipeline] = useState(messages[0].pipeline);

  const handleSend = async (queryText = null) => {
    const textToSend = typeof queryText === 'string' ? queryText : inputQuery;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

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
      setActivePipeline(response.pipeline_details);

      if (onMessageSent) {
        onMessageSent(response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Left Chat Column */}
      <div className="lg:col-span-7 bg-[#0f172a] rounded-2xl border border-[#1e293b] flex flex-col h-full shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0e1628]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">AI Placement Assistant Studio</h2>
              <p className="text-[11px] text-slate-400">Campus Placement, Coding & Interview Preparation Coach</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                onClick={() => msg.pipeline && setActivePipeline(msg.pipeline)}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} cursor-pointer`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#182238] text-slate-200 border border-[#23314e] rounded-tl-none hover:border-indigo-500/50 transition-colors'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 px-1">
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.intent && (
                    <>
                      <span className="text-indigo-400 font-medium">#{msg.intent}</span>
                      <span className="text-emerald-400">
                        {Math.round(msg.confidence * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 py-2">
              <Activity className="w-4 h-4 animate-spin" />
              <span>Extracting TF-IDF features and computing intent...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-[#0c1322] border-t border-[#172033] flex items-center gap-2 overflow-x-auto">
          {["Give me a placement roadmap", "How to prepare for aptitude?", "What DSA topics should I learn?", "Common HR interview questions?", "Resume tips for placements", "How to prepare for TCS?"].map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-xs px-2.5 py-1 rounded-full bg-[#162138] hover:bg-indigo-600/30 text-slate-300 border border-[#253556] whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0e1628]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-[#141d33] border border-[#223050] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Real-Time NLP Pipeline Step Inspector */}
      <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] flex flex-col h-full shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e293b] bg-[#0e1628] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">NLP Pipeline Inspector</h3>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            {activePipeline?.response_time_seconds ? `${activePipeline.response_time_seconds}s` : 'Real-time'}
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Step 1: Query Input */}
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b]">
            <div className="flex items-center justify-between text-indigo-400 font-semibold mb-1.5">
              <span>STEP 1: USER QUERY</span>
              <span className="text-[10px] text-slate-400 font-normal">Raw String</span>
            </div>
            <p className="text-white text-sm font-sans font-medium">
              "{activePipeline?.preprocessing?.raw_query || 'No query selected'}"
            </p>
          </div>

          {/* Step 2: Preprocessing */}
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b] space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-semibold">
              <span>STEP 2: PREPROCESSING</span>
              <span className="text-[10px] text-slate-400 font-normal">NLTK Tokenizer</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Cleaned Lowercase:</span>
              <span className="text-slate-200">{activePipeline?.preprocessing?.cleaned_text || '--'}</span>
            </div>
            {activePipeline?.preprocessing?.removed_stopwords?.length > 0 && (
              <div>
                <span className="text-amber-400 block text-[10px] uppercase">Removed Stopwords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activePipeline.preprocessing.removed_stopwords.map((sw, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px]">
                      {sw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-emerald-400 block text-[10px] uppercase">Final Feature Tokens:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(activePipeline?.preprocessing?.final_tokens || []).map((tok, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">
                    {tok}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: TF-IDF Vectorization */}
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b] space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-semibold">
              <span>STEP 3: TF-IDF VECTORIZATION</span>
              <span className="text-[10px] text-slate-400 font-normal">scikit-learn</span>
            </div>
            <div className="space-y-1.5">
              {(activePipeline?.tfidf_features || []).length > 0 ? (
                activePipeline.tfidf_features.map((feat, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">"{feat.feature}"</span>
                    <span className="text-indigo-400 font-semibold">{feat.weight}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-500 text-[11px]">No n-gram vocabulary match (Out-of-Vocabulary)</span>
              )}
            </div>
          </div>

          {/* Step 4: Intent Recognition & Probabilities */}
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b] space-y-2.5">
            <div className="flex items-center justify-between text-indigo-400 font-semibold">
              <span>STEP 4: INTENT RECOGNITION</span>
              <span className="text-[10px] text-slate-400 font-normal">Logistic Regression</span>
            </div>
            <div className="flex items-center justify-between bg-[#0e1628] p-2 rounded-lg border border-[#1e293b]">
              <div>
                <span className="text-[10px] text-slate-400 block">PREDICTED INTENT:</span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {activePipeline?.final_intent || '--'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">CONFIDENCE:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {activePipeline?.confidence ? `${Math.round(activePipeline.confidence * 100)}%` : '--'}
                </span>
              </div>
            </div>

            {/* Candidate Probabilities */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 block uppercase">Top Class Probabilities:</span>
              {(activePipeline?.top_candidates || []).map((cand, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-300">
                    <span>{cand.intent}</span>
                    <span>{Math.round(cand.probability * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0e1628] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.round(cand.probability * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: Response Generation */}
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b]">
            <div className="flex items-center justify-between text-indigo-400 font-semibold mb-1">
              <span>STEP 5: RESPONSE DISPATCH</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-slate-300 text-xs font-sans">
              Matched responses from intents.json, logged conversation into MySQL with latency tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
