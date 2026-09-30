import axios from 'axios';

// Get or create anonymous session ID for tracking unique users without PII
export const getSessionId = () => {
  let sessionId = localStorage.getItem('ai_chatbot_session_id');
  if (!sessionId) {
    sessionId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('ai_chatbot_session_id', sessionId);
  }
  return sessionId;
};

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Chat messaging
  sendMessage: async (message) => {
    const sessionId = getSessionId();
    const res = await apiClient.post('/chat', {
      message,
      session_id: sessionId,
    });
    return res.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await apiClient.get('/dashboard/stats');
    return res.data;
  },

  // Intent distribution for Donut Chart
  getIntentDistribution: async () => {
    const res = await apiClient.get('/dashboard/intent-distribution');
    return res.data;
  },

  // Conversation trend for Line Chart
  getConversationTrend: async () => {
    const res = await apiClient.get('/dashboard/conversation-trend');
    return res.data;
  },

  // Frequently asked queries for Bar Chart
  getFrequentQueries: async (limit = 5) => {
    const res = await apiClient.get('/dashboard/frequent-queries', {
      params: { limit },
    });
    return res.data;
  },

  // Chat History
  getHistory: async (params = {}) => {
    const res = await apiClient.get('/history', { params });
    return res.data;
  },

  // Clear History
  clearHistory: async (forSessionOnly = false) => {
    const params = forSessionOnly ? { session_id: getSessionId() } : {};
    const res = await apiClient.delete('/history', { params });
    return res.data;
  },

  // Intents dataset
  getIntents: async () => {
    const res = await apiClient.get('/intents');
    return res.data;
  },

  // Health and connection check
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Initialize DB
  initDb: async () => {
    const res = await apiClient.post('/init-db');
    return res.data;
  },
};

export default api;
