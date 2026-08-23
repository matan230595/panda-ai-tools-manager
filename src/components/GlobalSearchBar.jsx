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
  tool: { label: 'כלי', icon: Wrench, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800' },
  task: { label: 'משימה', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  plan: { label: 'תוכנית למידה', icon: GraduationCap, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800' },
  doc: { label: 'מסמך', icon: FileText, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40', border: 'border-sky-200 dark:border-sky-800' },
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
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-auto">
      {/* שדה החיפוש התמיד-גלוי */}
      <div className={`relative transition-all duration-300 ${open ? 'scale-[1.01]' : ''}`}>
        <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${open ? 'text-indigo-500' : 'text-gray-400'}`} />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="חפש כלי, משימה, תוכנית למידה או מסמך..."
          className={`h-11 pr-10 pl-16 text-sm rounded-2xl border transition-all duration-300 ${
            open
              ? 'border-indigo-400 bg-white dark:bg-slate-900 shadow-[0_0_0_4px_rgba(99,102,241,0.1),0_8px_24px_-8px_rgba(99,102,241,0.3)]'
              : 'border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-300 hover:shadow-md'
          }`}
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* תפריט תוצאות נפתח */}
      <AnimatePresence>
        {open && (query.trim() !== '' || true) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 inset-x-0 z-50"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              {query.trim() === '' ? (
                <div className="p-4">
                  <div className="text-xs font-semibold text-gray-400 mb-3">חיפוש מהיר</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(TYPE_CONFIG).map((cfg) => (
                      <Badge key={cfg.label} variant="outline" className={`gap-1.5 py-1.5 px-3 cursor-default ${cfg.border}`}>
                        <cfg.icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>התחל להקליד כדי לחפש בכל המערכת</span>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 flex flex-col items-center justify-center text-gray-400">
                  <Search className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">לא נמצאו תוצאות עבור "{query}"</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto p-2">
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
                          isActive ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{result.title}</div>
                          <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">{cfg.label}</Badge>
                        {isActive && <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {results.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-slate-800 px-3 py-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{results.length} תוצאות</span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">↑↓</kbd>
                        ניווט
                        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 mr-1">↵</kbd>
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