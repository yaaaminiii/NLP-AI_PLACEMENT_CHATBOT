import React, { useState, useEffect } from 'react';
import { Network, Search, Layers, BookOpen, MessageSquare, Check } from 'lucide-react';
import api from '../services/api';

export default function IntentsPage() {
  const [intents, setIntents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      const res = await api.getIntents();
      setIntents(res.intents || []);
    } catch (err) {
      console.error('Failed to load intents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = intents.filter(
    (i) =>
      i.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.patterns.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPatterns = intents.reduce((acc, curr) => acc + curr.pattern_count, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Network className="w-5 h-5 text-indigo-400" />
            <span>Placement Knowledge Base & Intents</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore 29 placement intents, training patterns, and interview answers powering the TF-IDF intent classifier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#141d33] border border-[#1e293b] text-center">
            <span className="text-xs text-slate-400 block">Total Intents</span>
            <span className="text-lg font-bold text-white">{intents.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#141d33] border border-[#1e293b] text-center">
            <span className="text-xs text-slate-400 block">Training Patterns</span>
            <span className="text-lg font-bold text-indigo-400">{totalPatterns}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search intents by tag name or pattern keyword..."
          className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Intents Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading intents dataset...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#172033] mb-3">
                  <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    #{item.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {item.pattern_count} patterns
                  </span>
                </div>

                {/* Example Patterns */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Example Training Queries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.patterns.slice(0, 4).map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#162138] text-slate-300 border border-[#23314e]"
                      >
                        "{p}"
                      </span>
                    ))}
                    {item.patterns.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{item.patterns.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Example Responses */}
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold block">
                    Sample Response:
                  </span>
                  <p className="text-xs text-slate-300 bg-[#141d33] p-2.5 rounded-xl border border-[#1e293b] leading-relaxed">
                    {item.responses[0] || 'No response configured'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
