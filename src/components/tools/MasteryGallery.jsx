import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { GraduationCap, Loader2, Search, Sparkles, Crown, TrendingUp } from 'lucide-react';
import ToolLogo from '@/components/ToolLogo';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const LEVELS = [
  { id: 'מתחיל', label: 'מתחיל', icon: GraduationCap, color: 'text-sky-300', bg: 'from-sky-500/10', border: 'border-sky-400/20', bar: 'bg-sky-400' },
  { id: 'בינוני', label: 'בתהליך', icon: Sparkles, color: 'text-amber-300', bg: 'from-amber-500/10', border: 'border-amber-400/20', bar: 'bg-amber-400' },
  { id: 'מומחה', label: 'מומחה', icon: Crown, color: 'text-emerald-300', bg: 'from-emerald-500/10', border: 'border-emerald-400/20', bar: 'bg-emerald-400' },
];

const LEVEL_SCORE = { 'מתחיל': 33, 'בינוני': 66, 'מומחה': 100 };

export default function MasteryGallery({ onToolClick }) {
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState('all');

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const filtered = useMemo(() => {
    let list = tools;
    if (activeLevel !== 'all') {
      list = list.filter((t) => (t.masteryLevel || 'מתחיל') === activeLevel);
    }
    if (search.trim()) {
      const q = search.trim();
      list = list.filter((t) => t.name?.includes(q) || t.category?.includes(q));
    }
    return list;
  }, [tools, activeLevel, search]);

  const counts = useMemo(() => ({
    'מתחיל': tools.filter((t) => (t.masteryLevel || 'מתחיל') === 'מתחיל').length,
    'בינוני': tools.filter((t) => t.masteryLevel === 'בינוני').length,
    'מומחה': tools.filter((t) => t.masteryLevel === 'מומחה').length,
  }), [tools]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* סרגל סינון לפי רמת שליטה */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveLevel('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeLevel === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-white/5 text-slate-400 border border-white/10'
          }`}
        >
          הכל ({tools.length})
        </button>
        {LEVELS.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <button
              key={lvl.id}
              onClick={() => setActiveLevel(lvl.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeLevel === lvl.id
                  ? `bg-white/10 ${lvl.color} border ${lvl.border}`
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {lvl.label} ({counts[lvl.id]})
            </button>
          );
        })}
      </div>

      {/* חיפוש */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש כלי לפי שם או קטגוריה..."
          className="pr-9 bg-white/[0.03] border-cyan-400/20 text-white placeholder:text-slate-500"
        />
      </div>

      {/* רשת כרטיסי גלריה */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
          אין כלים בקטגוריה זו
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tool) => {
            const level = tool.masteryLevel || 'מתחיל';
            const lvlCfg = LEVELS.find((l) => l.id === level) || LEVELS[0];
            const Icon = lvlCfg.icon;
            const score = LEVEL_SCORE[level];
            return (
              <div
                key={tool.id}
                onClick={() => onToolClick?.(tool)}
                className={`group rounded-2xl border ${lvlCfg.border} bg-gradient-to-b ${lvlCfg.bg} to-transparent p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-cyan-400/40`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <ToolLogo tool={tool} size="md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{tool.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{tool.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${lvlCfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {lvlCfg.label}
                  </div>
                  <span className="text-xs text-slate-500">{score}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${lvlCfg.bar}`} style={{ width: `${score}%` }} />
                </div>

                {tool.learningPriority && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">עדיפות:</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      tool.learningPriority === 'דוחוף' ? 'bg-red-500/20 text-red-300' :
                      tool.learningPriority === 'חשוב' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {tool.learningPriority}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}