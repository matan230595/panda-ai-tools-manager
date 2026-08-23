import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Trophy, Flame, Star, Award, Crown, Target, TrendingUp, Zap } from 'lucide-react';

const BADGES = [
  { id: 'collector', icon: Star, label: 'אספן כלים', desc: '10+ כלים באוסף', color: 'from-blue-500/20 to-blue-600/5', ring: 'ring-blue-400/30', check: (tools) => tools.length >= 10 },
  { id: 'explorer', icon: Zap, label: 'חוקר מצטיין', desc: '25+ כלים באוסף', color: 'from-purple-500/20 to-purple-600/5', ring: 'ring-purple-400/30', check: (tools) => tools.length >= 25 },
  { id: 'master', icon: Crown, label: 'מומחה מתחיל', desc: 'כלי אחד ברמת מומחה', color: 'from-emerald-500/20 to-emerald-600/5', ring: 'ring-emerald-400/30', check: (tools) => tools.some(t => t.masteryLevel === 'מומחה') },
  { id: 'master_pro', icon: Trophy, label: 'מומחה מובהק', desc: '5+ כלים ברמת מומחה', color: 'from-amber-500/20 to-amber-600/5', ring: 'ring-amber-400/30', check: (tools) => tools.filter(t => t.masteryLevel === 'מומחה').length >= 5 },
  { id: 'learner', icon: Target, label: 'לומד חרוץ', desc: 'תוכנית למידה אחת הושלמה', color: 'from-cyan-500/20 to-cyan-600/5', ring: 'ring-cyan-400/30', check: (tools, plans) => plans.some(p => (p.progress || 0) >= 100) },
  { id: 'scholar', icon: Award, label: 'רב-למדן', desc: '3+ תוכניות למידה הושלמו', color: 'from-pink-500/20 to-pink-600/5', ring: 'ring-pink-400/30', check: (tools, plans) => plans.filter(p => (p.progress || 0) >= 100).length >= 3 },
];

export default function GamificationPanel() {
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['learningPlansDashboard'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id });
    },
  });

  const earned = useMemo(() => BADGES.filter(b => b.check(tools, plans)), [tools, plans]);
  const streak = useMemo(() => {
    const dates = plans
      .flatMap(p => (p.steps || []).filter(s => s.isCompleted && s.dueDate).map(s => s.dueDate))
      .sort((a, b) => new Date(b) - new Date(a));
    if (dates.length === 0) return 0;
    let count = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) count++;
      else break;
    }
    return count;
  }, [plans]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-cyan-400/15 bg-gradient-to-b from-cyan-500/10 to-transparent p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto text-amber-400 mb-1" />
          <div className="text-2xl font-bold text-white">{earned.length}</div>
          <div className="text-xs text-slate-400">תגי הישג</div>
        </div>
        <div className="rounded-2xl border border-orange-400/15 bg-gradient-to-b from-orange-500/10 to-transparent p-4 text-center">
          <Flame className="w-6 h-6 mx-auto text-orange-400 mb-1" />
          <div className="text-2xl font-bold text-white">{streak}</div>
          <div className="text-xs text-slate-400">רצף ימים</div>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-gradient-to-b from-emerald-500/10 to-transparent p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
          <div className="text-2xl font-bold text-white">{tools.length}</div>
          <div className="text-xs text-slate-400">סה״כ כלים</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const isEarned = earned.some(e => e.id === badge.id);
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-3 text-center transition-all ${
                isEarned
                  ? `bg-gradient-to-b ${badge.color} border-white/10 ring-1 ${badge.ring}`
                  : 'bg-white/[0.02] border-white/5 opacity-40 grayscale'
              }`}
            >
              <Icon className={`w-7 h-7 mx-auto mb-1.5 ${isEarned ? 'text-white' : 'text-slate-500'}`} />
              <div className="text-xs font-semibold text-white">{badge.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{badge.desc}</div>
              {!isEarned && <div className="text-[9px] text-slate-600 mt-1">נעול</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}