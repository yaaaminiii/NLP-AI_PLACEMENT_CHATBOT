import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart as PieIcon } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function IntentDonutChart({ data = [], theme }) {
  const isLight = theme === 'light';

  // Fallback sample data if database is brand new and empty
  const defaultIntents = [
    { intent: 'placement_roadmap', count: 42, percentage: 35.0 },
    { intent: 'aptitude', count: 28, percentage: 23.3 },
    { intent: 'coding', count: 22, percentage: 18.3 },
    { intent: 'dsa', count: 16, percentage: 13.3 },
    { intent: 'hr_interview', count: 12, percentage: 10.1 },
  ];

  const items = data && data.length > 0 ? data.slice(0, 6) : defaultIntents;

  const colors = [
    '#6366f1', // indigo
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
  ];

  const chartData = {
    labels: items.map((i) => i.intent.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        data: items.map((i) => i.count),
        backgroundColor: colors.slice(0, items.length),
        borderColor: isLight ? '#ffffff' : '#0f172a',
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#182238',
        titleColor: isLight ? '#0f172a' : '#ffffff',
        bodyColor: isLight ? '#334155' : '#cbd5e1',
        borderColor: isLight ? '#e2e8f0' : '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            const val = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = Math.round((val / total) * 100);
            return ` ${context.label}: ${val} queries (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-white text-sm">
            Intent Recognition Overview
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Live Breakdown</span>
      </div>

      <div className="flex items-center justify-between gap-6 py-4">
        {/* Doughnut Chart */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Intents</span>
            <span className="text-lg font-bold text-white">{items.length}</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex-1 space-y-2">
          {items.map((item, idx) => {
            const color = colors[idx % colors.length];
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 font-medium capitalize truncate">
                    {item.intent.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-slate-400 font-semibold ml-2">
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
