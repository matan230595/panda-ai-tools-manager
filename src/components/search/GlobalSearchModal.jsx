import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, BellRing, GraduationCap, DollarSign, LayoutDashboard, BarChart3, Settings as SettingsIcon } from 'lucide-react';

const TAB_DESTINATIONS = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard, desc: 'תצוגה כללית של המערכת' },
  { id: 'tools', label: 'כלים', icon: Sparkles, desc: 'ניהול כלי AI' },
  { id: 'assistant', label: 'סוכן AI', icon: Search, desc: 'עוזר חכם' },
  { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign, desc: 'ניהול מנויים' },
  { id: 'stats', label: 'ROI', icon: BarChart3, desc: 'ניתוח החזר השקעה' },
  { id: 'reminders', label: 'התראות', icon: BellRing, desc: 'תזכורות ומשימות' },
  { id: 'learning', label: 'למידה', icon: GraduationCap, desc: 'תוכניות למידה' },
  { id: 'settings', label: 'הגדרות', icon: SettingsIcon, desc: 'הגדרות מערכת' },
];

export default function GlobalSearchModal({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('');

  const { data: tools } = useQuery({
    queryKey: ['global-search-tools'],
    enabled: open,
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id }, '-updated_date', 50);
    },
  });

  const results = useMemo(() => {
    if (!query.trim()) return { tabs: TAB_DESTINATIONS, tools: [] };
    const q = query.toLowerCase();
    return {
      tabs: TAB_DESTINATIONS.filter(t => t.label.includes(query) || t.desc.includes(query)),
      tools: (tools || []).filter(t => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)).slice(0, 8),
    };
  }, [query, tools]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#1a202d]/95 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(0,212,255,0.2)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* שורת חיפוש */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan-400/15">
              <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חפש כלי, דף, או פעולה..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
              />
              <kbd className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* תוצאות */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {!query.trim() && (
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">דפים</div>
              )}
              {results.tabs.length > 0 && (
                <div className="space-y-0.5 mb-2">
                  {results.tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { onNavigate?.(tab.id); onClose(); }}
                        className="group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-right hover:bg-white/5 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{tab.label}</div>
                          <div className="text-xs text-slate-500">{tab.desc}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
                      </button>
                    );
                  })}
                </div>
              )}

              {results.tools.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">כלים</div>
                  <div className="space-y-0.5">
                    {results.tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => { onNavigate?.('tools'); onClose(); }}
                        className="group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-right hover:bg-white/5 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{tool.name}</div>
                          <div className="text-xs text-slate-500 truncate">{tool.category}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {query.trim() && results.tabs.length === 0 && results.tools.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-sm">לא נמצאו תוצאות עבור "{query}"</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}