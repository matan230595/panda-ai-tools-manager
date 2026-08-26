import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog';
import {
  Search, Sparkles, Wrench, CheckSquare, GraduationCap,
  FileText, X, ArrowRight, Clock, TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const RESULT_LIMIT = 5;

const TYPE_CONFIG = {
  tool: { label: 'כלי', icon: Wrench, color: 'text-cyan-400 bg-cyan-400/10', border: 'border-cyan-400/30' },
  task: { label: 'משימה', icon: CheckSquare, color: 'text-emerald-400 bg-emerald-400/10', border: 'border-emerald-400/30' },
  plan: { label: 'תוכנית למידה', icon: GraduationCap, color: 'text-purple-400 bg-purple-400/10', border: 'border-purple-400/30' },
  doc: { label: 'מסמך', icon: FileText, color: 'text-sky-400 bg-sky-400/10', border: 'border-sky-400/30' },
};

export default function GlobalSearchBar({ onNavigateTool, onFocus }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
    enabled: open,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['toolTasksGlobal'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by_id: user.id });
    },
    enabled: open,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['learningPlansGlobal'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id });
    },
    enabled: open,
  });

  // פתיחה בלחיצה על השדה
  const handleFocus = () => {
    setOpen(true);
    onFocus?.();
  };

  // סגירה בלחיצה מחוץ
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ניווט מקלדת
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const toolResults = tools
      .filter((t) => {
        const text = [t.name, t.description, t.category, t.customCategory, t.targetAudience, t.notes, t.personalNotes, ...(t.tags || []), ...(t.features || [])]
          .filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
      })
      .slice(0, RESULT_LIMIT)
      .map((t) => ({ type: 'tool', id: t.id, title: t.name, subtitle: t.category?.replace(/_/g, ' ') || 'כלי AI', data: t }));

    const taskResults = tasks
      .filter((t) => {
        const text = [t.title, t.description, t.toolName, t.priority].filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
      })
      .slice(0, RESULT_LIMIT)
      .map((t) => ({ type: 'task', id: t.id, title: t.title, subtitle: `${t.toolName || ''} · ${t.status === 'done' ? 'הושלם' : t.status === 'in_progress' ? 'בביצוע' : 'לביצוע'}`, data: t }));

    const planResults = plans
      .filter((p) => {
        const text = [p.title, p.description, p.toolName].filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
      })
      .slice(0, RESULT_LIMIT)
      .map((p) => ({ type: 'plan', id: p.id, title: p.title, subtitle: `${p.toolName || ''} · ${Math.round(p.progress || 0)}% התקדמות`, data: p }));

    return [...toolResults, ...taskResults, ...planResults];
  }, [query, tools, tasks, plans]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const handleSelect = (result) => {
    if (result.type === 'tool' && onNavigateTool) {
      onNavigateTool(result.data);
    } else if (result.type === 'plan') {
      navigate(`/tool-mastery/${result.data.toolId}`);
    }
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); handleSelect(results[activeIndex]); }
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 mx-auto">
      <div className={`relative transition-all duration-300 ${open ? 'scale-[1.01]' : ''}`}>
        <Search className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${open ? 'text-cyan-400' : 'text-slate-500'}`} />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="חיפוש..."
          className={`h-9 sm:h-11 pr-9 sm:pr-10 pl-8 sm:pl-12 text-xs sm:text-sm rounded-xl border transition-all duration-300 min-w-0 ${
            open
              ? 'border-cyan-400/50 bg-[#0e1118] shadow-[0_0_0_3px_rgba(0,212,255,0.08),0_8px_24px_-8px_rgba(0,212,255,0.2)]'
              : 'border-cyan-400/15 bg-[#0e1118]/80 hover:border-cyan-400/30'
          } text-slate-200 placeholder:text-slate-600`}
        />
        <div className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden md:flex items-center text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded font-mono border border-cyan-400/10">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (query.trim() !== '' || true) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 inset-x-0 z-50"
          >
            <div className="bg-[#0e1118]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-cyan-400/20 overflow-hidden">
              {query.trim() === '' ? (
                <div className="p-3 sm:p-4">
                  <div className="text-xs font-semibold text-slate-500 mb-3">חיפוש מהיר</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(TYPE_CONFIG).map((cfg) => (
                      <Badge key={cfg.label} variant="outline" className={`gap-1.5 py-1.5 px-3 cursor-default ${cfg.border} bg-white/5`}>
                        <cfg.icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>התחל להקליד כדי לחפש בכל המערכת</span>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 flex flex-col items-center justify-center text-slate-500">
                  <Search className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">לא נמצאו תוצאות עבור "{query}"</p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {results.map((result, idx) => {
                    const cfg = TYPE_CONFIG[result.type];
                    const Icon = cfg.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-right ${
                          isActive ? 'bg-cyan-400/10 ring-1 ring-cyan-400/30' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-slate-200">{result.title}</div>
                          <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0 border-cyan-400/20 text-slate-400">{cfg.label}</Badge>
                        {isActive && <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {results.length > 0 && (
                    <div className="border-t border-cyan-400/10 px-3 py-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{results.length} תוצאות</span>
                      <span className="hidden sm:flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-cyan-400/10">↑↓</kbd>
                        ניווט
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-cyan-400/10 mr-1">↵</kbd>
                        בחירה
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}