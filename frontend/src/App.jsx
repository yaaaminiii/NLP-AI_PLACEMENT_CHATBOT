import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import IntentsPage from './pages/IntentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [intentDistribution, setIntentDistribution] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Theme state: 'dark' (Black) or 'light' (White)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ai_placement_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTheme = (nextTheme) => {
    try {
      const root = document.documentElement;
      root.className = nextTheme;
      root.setAttribute('data-theme', nextTheme);
      document.body.className = `${nextTheme} antialiased selection:bg-indigo-500 selection:text-white`;
      localStorage.setItem('ai_placement_theme', nextTheme);
    } catch (e) {
      console.error('Error applying theme:', e);
    }
    setTheme(nextTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Ensure DOM is properly synced on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Fetch initial dashboard metrics
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsData, intentsData, historyData, healthData] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getIntentDistribution(),
        api.getHistory({ limit: 5 }),
        api.getHealth(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (intentsData.status === 'fulfilled') setIntentDistribution(intentsData.value);
      if (historyData.status === 'fulfilled') setRecentConversations(historyData.value.items || []);
      if (healthData.status === 'fulfilled') setDbStatus(healthData.value.database || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMessageSent = (newChatResponse) => {
    loadDashboardData();
  };

  const handleResetSession = () => {
    if (window.confirm('Start a fresh anonymous chat session?')) {
      localStorage.removeItem('ai_chatbot_session_id');
      window.location.reload();
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'bg-[#f8fafc] text-slate-900 light' : 'bg-[#0b0f19] text-slate-100 dark'
      } flex transition-colors duration-200`}
    >
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetSession={handleResetSession}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen p-8 max-w-7xl">
        <Header
          dbStatus={dbStatus}
          onRefresh={loadDashboardData}
          isRefreshing={isRefreshing}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="mt-6">
          {activeTab === 'overview' && (
            <DashboardPage
              stats={stats}
              intentDistribution={intentDistribution}
              recentConversations={recentConversations}
              onMessageSent={handleMessageSent}
              onNavigateToHistory={() => setActiveTab('history')}
              theme={theme}
            />
          )}

          {activeTab === 'chat' && (
            <ChatPage onMessageSent={handleMessageSent} theme={theme} />
          )}

          {activeTab === 'intents' && (
            <IntentsPage theme={theme} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage theme={theme} />
          )}

          {activeTab === 'history' && (
            <HistoryPage theme={theme} />
          )}
        </div>
      </main>
    </div>
  );
}
