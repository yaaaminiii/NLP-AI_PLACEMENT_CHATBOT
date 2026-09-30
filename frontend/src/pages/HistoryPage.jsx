import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function HistoryPage() {
  const [conversations, setConversations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadHistory();
  }, [page, selectedIntent]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const res = await api.getHistory({
        limit,
        offset,
        intent: selectedIntent !== 'all' ? selectedIntent : undefined,
        search: searchTerm || undefined,
      });

      setConversations(res.items || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear conversation history from MySQL?')) return;
    try {
      await api.clearHistory(false);
      setConversations([]);
      setTotalCount(0);
      alert('Conversation history cleared successfully.');
    } catch (err) {
      alert('Failed to clear history: ' + (err.message || 'Database error'));
    }
  };

  const exportToCSV = () => {
    if (conversations.length === 0) return;
    const headers = ['ID', 'Session ID', 'User Query', 'Intent', 'Confidence', 'Response', 'Time (s)', 'Status', 'Timestamp'];
    const rows = conversations.map((c) => [
      c.id,
      c.session_id,
      `"${(c.user_query || '').replace(/"/g, '""')}"`,
      c.intent,
      c.confidence,
      `"${(c.response || '').replace(/"/g, '""')}"`,
      c.response_time,
      c.status,
      c.timestamp,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chatbot_conversations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const intentsList = [
    'all',
    'greeting',
    'goodbye',
    'thanks',
    'nlp',
    'machine_learning',
    'deep_learning',
    'python',
    'about_bot',
    'help',
    'course',
    'contact',
    'working',
    'accuracy',
    'faq',
    'unknown',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Conversation History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and query all logged conversations stored persistently inside the MySQL database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            disabled={conversations.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141d33] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or responses..."
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedIntent}
            onChange={(e) => {
              setSelectedIntent(e.target.value);
              setPage(1);
            }}
            className="bg-[#0f172a] border border-[#1e293b] text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            {intentsList.map((tag) => (
              <option key={tag} value={tag}>
                {tag === 'all' ? 'All Intents' : tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1628] border-b border-[#1e293b] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">User Query</th>
                <th className="py-3.5 px-4">Detected Intent</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Chatbot Response</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading conversations from MySQL...
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No conversations found. Ask questions in the Chat panel to populate this table!
                  </td>
                </tr>
              ) : (
                conversations.map((row) => (
                  <tr key={row.id} className="hover:bg-[#141d33]/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                      {row.user_query}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] uppercase font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {row.intent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">
                          {Math.round(row.confidence * 100)}%
                        </span>
                        <div className="w-12 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round(row.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-md truncate" title={row.response}>
                      {row.response}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {row.response_time ? `${row.response_time}s` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {row.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-[#1e293b] bg-[#0e1628] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {conversations.length} of {totalCount} total entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#141d33] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-[#141d33] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
