import React from 'react';
import { TrendingUp, CheckCircle, Clock, ThumbsUp } from 'lucide-react';

export default function PerformanceCards({ stats }) {
  const items = [
    {
      title: 'Total Conversations',
      value: stats?.total_conversations ?? 128,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      title: 'Successful Conversations',
      value: stats?.successful_responses ?? 108,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Avg. Response Time',
      value: stats?.avg_response_time ?? '0.028s',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'User Satisfaction',
      value: `${stats?.chatbot_accuracy ?? 92}%`,
      icon: ThumbsUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ];

  return (
    <div className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-sm">
      <h3 className="font-semibold text-white text-sm pb-4 border-b border-[#1e293b] mb-4">
        Chatbot Performance at a Glance
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#141d33] border border-[#1e293b] hover:border-slate-700 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center border ${item.border} flex-shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {item.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
