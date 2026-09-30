import React from 'react';
import { MessageSquare, Users, Target, Smile } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChatPanel from '../components/ChatPanel';
import IntentDonutChart from '../components/IntentDonutChart';
import RecentConversations from '../components/RecentConversations';
import PerformanceCards from '../components/PerformanceCards';

export default function DashboardPage({
  stats,
  intentDistribution,
  recentConversations,
  onMessageSent,
  onNavigateToHistory,
  theme,
}) {
  return (
    <div className="space-y-6">
      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={stats?.total_conversations ?? 128}
          icon={MessageSquare}
          color="purple"
        />
        <StatCard
          title="Unique Users"
          value={stats?.unique_users ?? 96}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Intent Accuracy"
          value={`${stats?.intent_accuracy ?? 85}%`}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Responses Generated"
          value={stats?.responses_generated ?? stats?.total_conversations ?? 124}
          icon={Smile}
          color="amber"
        />
      </div>

      {/* Main Grid: Left Chat Panel, Right Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Chat Panel */}
        <div className="lg:col-span-7">
          <ChatPanel onMessageSent={onMessageSent} />
        </div>

        {/* Right Column: Intent Donut Chart & Recent Conversations */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <IntentDonutChart data={intentDistribution} theme={theme} />
          <RecentConversations
            conversations={recentConversations}
            onViewAll={onNavigateToHistory}
          />
        </div>
      </div>

      {/* Bottom Row: Chatbot Performance at a Glance */}
      <PerformanceCards stats={stats} />
    </div>
  );
}
