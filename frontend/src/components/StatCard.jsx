import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'indigo', sparklineColor = '#6366f1', trend }) {
  const colorMap = {
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      sparkline: '#a855f7',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      sparkline: '#10b981',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      sparkline: '#3b82f6',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      sparkline: '#f59e0b',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
      sparkline: '#6366f1',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] flex items-center justify-between relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
      <div className="flex items-center gap-4 z-10">
        <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {value ?? '--'}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">
            {title}
          </div>
        </div>
      </div>

      {/* Stylized Sparkline Wave SVG */}
      <div className="w-24 h-10 opacity-70">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
          <path
            d="M0 25 Q 20 10, 40 28 T 80 15 T 100 20"
            fill="none"
            stroke={c.sparkline}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
