import React from 'react';
import { Database, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({ dbStatus, onRefresh, isRefreshing, theme, onToggleTheme }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e293b] transition-colors duration-200">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          AI Placement Assistant
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Ask anything about placements, internships, coding, aptitude and interviews.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* WhatsApp-Style Light / Dark Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-sm ${
            theme === 'light'
              ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
              : 'bg-[#141d33] border-[#1e293b] text-slate-200 hover:text-white hover:bg-[#1a2542]'
          }`}
          title={`Currently using ${theme === 'light' ? 'White (Light)' : 'Black (Dark)'} theme. Click to switch!`}
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>White Theme</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold ml-1">
                Light
              </span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Black Theme</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold ml-1">
                Dark
              </span>
            </>
          )}
        </button>

        {/* DB Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            dbStatus?.connected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
          title={dbStatus?.message || 'Database status'}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{dbStatus?.connected ? 'MySQL Connected' : 'MySQL Offline'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-[#141d33] border border-[#1e293b] text-slate-300 hover:text-white hover:bg-[#1a2542] transition-colors disabled:opacity-50"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
