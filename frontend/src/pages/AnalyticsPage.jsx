import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, HelpCircle, Activity, Zap } from 'lucide-react';
import api from '../services/api';
import IntentDonutChart from '../components/IntentDonutChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage({ theme }) {
  const isLight = theme === 'light';
  const [trendData, setTrendData] = useState([]);
  const [frequentQueries, setFrequentQueries] = useState([]);
  const [intentDistribution, setIntentDistribution] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trend, freq, intents, statRes] = await Promise.all([
        api.getConversationTrend(),
        api.getFrequentQueries(7),
        api.getIntentDistribution(),
        api.getDashboardStats(),
      ]);

      setTrendData(trend || []);
      setFrequentQueries(freq || []);
      setIntentDistribution(intents || []);
      setStats(statRes || null);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Line Chart Config (Conversation Trend)
  const defaultLabels = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const defaultCounts = [12, 19, 15, 25, 22, 30, 28, 35];

  const lineLabels = trendData.length > 0 ? trendData.map((d) => d.label) : defaultLabels;
  const lineCounts = trendData.length > 0 ? trendData.map((d) => d.count) : defaultCounts;

  const trendChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Conversations',
        data: lineCounts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#182238',
        titleColor: isLight ? '#0f172a' : '#ffffff',
        bodyColor: isLight ? '#334155' : '#cbd5e1',
        borderColor: isLight ? '#e2e8f0' : '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isLight ? '#64748b' : '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isLight ? '#64748b' : '#94a3b8', font: { size: 11 }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  // Bar Chart Config (Frequently Asked Queries)
  const defaultQueries = [
    { user_query: 'How to prepare for campus placements?', count: 24 },
    { user_query: 'Placement preparation roadmap', count: 19 },
    { user_query: 'How should I prepare for aptitude?', count: 16 },
    { user_query: 'What DSA topics should I learn?', count: 14 },
    { user_query: 'Common HR interview questions?', count: 11 },
  ];

  const barItems = frequentQueries.length > 0 ? frequentQueries : defaultQueries;

  const barChartData = {
    labels: barItems.map((q) => q.user_query.length > 25 ? q.user_query.substring(0, 22) + '...' : q.user_query),
    datasets: [
      {
        label: 'Times Asked',
        data: barItems.map((q) => q.count),
        backgroundColor: [
          '#6366f1',
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ec4899',
        ],
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#182238',
        titleColor: isLight ? '#0f172a' : '#ffffff',
        bodyColor: isLight ? '#334155' : '#cbd5e1',
        borderColor: isLight ? '#e2e8f0' : '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isLight ? '#64748b' : '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isLight ? '#64748b' : '#94a3b8', font: { size: 11 }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Chatbot Performance & Interaction Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics evaluating model confidence, temporal conversation trends, and frequently encountered user queries.
        </p>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          <span className="text-xs text-slate-400 block">Chatbot Accuracy</span>
          <span className="text-2xl font-bold text-indigo-400 mt-1 block">
            {stats?.chatbot_accuracy ?? 93}%
          </span>
          <span className="text-[11px] text-slate-500">Based on successful classifications</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          <span className="text-xs text-slate-400 block">Avg Response Latency</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {stats?.avg_response_time ?? '0.024s'}
          </span>
          <span className="text-[11px] text-slate-500">TF-IDF & Logistic Regression</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          <span className="text-xs text-slate-400 block">Most Common Intent</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block uppercase">
            {stats?.most_common_intent ?? 'NLP'}
          </span>
          <span className="text-[11px] text-slate-500">Highest volume category</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          <span className="text-xs text-slate-400 block">Most Asked Query</span>
          <span className="text-lg font-bold text-purple-400 mt-1 block truncate" title={stats?.most_asked_query}>
            {stats?.most_asked_query ?? 'What is NLP?'}
          </span>
          <span className="text-[11px] text-slate-500">Top user question</span>
        </div>
      </div>

      {/* Row 1: Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-8 bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">
                Conversation Volume Trend Over Time
              </h3>
            </div>
            <span className="text-xs text-slate-400">Interaction Volume</span>
          </div>

          <div className="h-64 pt-4">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4">
          <IntentDonutChart data={intentDistribution} theme={theme} />
        </div>
      </div>

      {/* Row 2: Bar Chart */}
      <div className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">
              Most Frequently Asked Queries
            </h3>
          </div>
          <span className="text-xs text-slate-400">Frequency Distribution</span>
        </div>

        <div className="h-64 pt-4">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
}
