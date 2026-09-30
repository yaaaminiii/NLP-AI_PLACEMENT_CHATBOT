import React, { useState } from 'react';
import { Settings, Database, Cpu, ShieldCheck, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function SettingsPage({ dbStatus, onRefresh }) {
  const [initLoading, setInitLoading] = useState(false);
  const [initResult, setInitResult] = useState(null);

  const handleInitDatabase = async () => {
    try {
      setInitLoading(true);
      const res = await api.initDb();
      setInitResult({ success: true, message: res.message || 'Database initialized successfully!' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setInitResult({
        success: false,
        message: err.response?.data?.error || err.message || 'Failed to initialize database.',
      });
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>System Settings & Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor system services, manage MySQL database connection, and view model configuration.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Flask REST API</h4>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">Online & Serving (Port 5000)</p>
            <p className="text-[11px] text-slate-400 mt-1">Python 3.11 with CORS enabled</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${dbStatus?.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'} flex items-center justify-center`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">MySQL Database</h4>
            <p className={`text-xs font-medium mt-0.5 ${dbStatus?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {dbStatus?.connected ? 'Connected (ai_chatbot)' : 'Awaiting Connection'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Port 3306 • localhost</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">NLP Engine</h4>
            <p className="text-xs text-purple-400 font-medium mt-0.5">Model Ready (Logistic Regression)</p>
            <p className="text-[11px] text-slate-400 mt-1">15 Intents • Stratified Training</p>
          </div>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] space-y-4">
        <h3 className="font-semibold text-white text-sm pb-3 border-b border-[#1e293b] flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>MySQL Database Management</span>
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          Ensure MySQL credentials are configured in <code className="bg-[#141d33] px-1.5 py-0.5 rounded text-indigo-300 border border-[#1e293b]">backend/.env</code>.
          You can initialize or recreate the schema with the action button below.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleInitDatabase}
            disabled={initLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${initLoading ? 'animate-spin' : ''}`} />
            <span>{initLoading ? 'Initializing Schema...' : 'Initialize / Verify Database'}</span>
          </button>
        </div>

        {initResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              initResult.success
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}
          >
            {initResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{initResult.message}</span>
          </div>
        )}
      </div>

      {/* NLP Hyperparameters */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b]">
        <h3 className="font-semibold text-white text-sm pb-3 border-b border-[#1e293b] mb-4">
          Model & Pipeline Hyperparameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px]">Vectorizer</span>
            <span className="text-white font-medium mt-1 block">TF-IDF (unigrams + bigrams)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px]">Classifier Algorithm</span>
            <span className="text-white font-medium mt-1 block">Logistic Regression (C=10.0)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px]">Confidence Cutoff</span>
            <span className="text-emerald-400 font-medium mt-1 block">40% threshold</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px]">Preprocessing Stopwords</span>
            <span className="text-white font-medium mt-1 block">NLTK English Stopwords</span>
          </div>
        </div>
      </div>
    </div>
  );
}
