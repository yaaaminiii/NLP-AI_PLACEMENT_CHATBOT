import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default function RecentConversations({ conversations = [], onViewAll }) {
  // Fallback sample data if no conversations stored yet
  const defaultList = [
    {
      user_query: "What is the eligibility for placements?",
      intent: "placement_eligibility",
      confidence: 0.95,
      timestamp: "Today, 10:15 AM",
    },
    {
      user_query: "Give me a placement preparation roadmap",
      intent: "placement_roadmap",
      confidence: 0.98,
      timestamp: "Today, 10:20 AM",
    },
    {
      user_query: "What DSA topics should I learn?",
      intent: "dsa",
      confidence: 0.92,
      timestamp: "Today, 10:25 AM",
    },
    {
      user_query: "How should I prepare for aptitude tests?",
      intent: "aptitude",
      confidence: 0.94,
      timestamp: "Today, 10:30 AM",
    },
  ];

  const list = conversations && conversations.length > 0 ? conversations.slice(0, 5) : defaultList;

  return (
    <div className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <h3 className="font-semibold text-white text-sm">
          Recent Conversations
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="divide-y divide-[#172033] py-2">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="py-3 flex items-center justify-between gap-3 hover:bg-[#141d33]/50 px-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {item.user_query}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {item.timestamp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {item.intent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
