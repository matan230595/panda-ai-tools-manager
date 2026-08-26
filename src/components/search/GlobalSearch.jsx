import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Sparkles, Wrench, CheckSquare, GraduationCap, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import NaturalLanguageSearch from '@/components/search/NaturalLanguageSearch';
import VoiceSearchButton from '@/components/search/VoiceSearchButton';

const RESULT_LIMIT = 6;

const TYPE_CONFIG = {
  tool: { label: 'כלי', icon: Wrench, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  task: { label: 'משימה', icon: CheckSquare, color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
  plan: { label: 'תוכנית למידה', icon: GraduationCap, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
};

export default function GlobalSearch({ open, onOpenChange, onNavigateTool }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [nlMode, setNlMode] = useState(false);
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
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
      .map((t) => ({ type: 'tool', id: t.id, title: t.name, subtitle: t.category?.replace(/_/g, ' ') || 'כלי', data: t }));

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

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (result) => {
    if (result.type === 'tool' && onNavigateTool) {
      onNavigateTool(result.data);
    }
    onOpenChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" dir="rtl">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              חיפוש גלובלי
            </span>
            <button
              onClick={() => setNlMode(!nlMode)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all ${
                nlMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              חיפוש חכם
            </button>
          </DialogTitle>
        </DialogHeader>
        {nlMode ? (
          <div className="px-4 pt-3 pb-4">
            <NaturalLanguageSearch onToolClick={(tool) => { onNavigateTool?.(tool); onOpenChange(false); }} />
          </div>
        ) : (
        <>
        <div className="relative px-4 pt-3">
          <Search className="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="חפש כלי, משימה או תוכנית למידה..."
            className="h-12 pr-11 text-base rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <VoiceSearchButton onResult={setQuery} className="absolute left-12 top-1/2 -translate-y-1/2 w-8 h-8" />
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">התחל להקליד כדי לחפש בכל האפליקציה</p>
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                {Object.values(TYPE_CONFIG).map((cfg) => (
                  <Badge key={cfg.label} variant="outline" className="gap-1">
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label}
                  </Badge>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">לא נמצאו תוצאות עבור "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, idx) => {
                const cfg = TYPE_CONFIG[result.type];
                const Icon = cfg.icon;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">{cfg.label}</Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>נמצאו {results.length} תוצאות</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">↑↓</kbd>
              לניווט
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-1">Enter</kbd>
              לבחירה
            </span>
          </div>
        )}
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}