import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Network,
  BarChart3,
  History,
  LogOut,
  Bot,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onResetSession, theme, onToggleTheme }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'intents', label: 'Intents', icon: Network },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Chat History', icon: History },
  ];

  return (
    <aside className="w-64 bg-[#080d1a] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 select-none z-30 transition-all duration-200">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#172033]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight leading-tight">
            AI Placement Assistant
          </h1>
          <p className="text-[11px] text-indigo-400 font-medium">Placement Companion</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 translate-x-1'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#11192e]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Theme Switcher / Reset Section */}
      <div className="p-4 border-t border-[#172033] bg-[#070b16] space-y-1.5">
        {/* WhatsApp-Style Mood Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#11192e] transition-colors"
          title={`Switch between White and Black themes`}
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-medium text-slate-300">
              {theme === 'dark' ? 'Dark (Black)' : 'Light (White)'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {theme === 'dark' ? 'Black' : 'White'}
          </span>
        </button>

        <button
          onClick={onResetSession}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Start fresh session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>New Session / Reset</span>
        </button>
      </div>
    </aside>
  );
}
