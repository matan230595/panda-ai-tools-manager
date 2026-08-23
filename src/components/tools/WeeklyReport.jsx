import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Award, Target, Calendar, Zap,
  ChevronRight, BarChart3, Flame, Trophy, CheckCircle2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

const MASTERY_COLORS = {
  'מתחיל': { bg: 'bg-red-500/20', text: 'text-red-400', bar: '#ef4444' },
  'בינוני': { bg: 'bg-blue-500/20', text: 'text-blue-400', bar: '#3b82f6' },
  'מומחה': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', bar: '#10b981' },
};

const PRIORITY_COLORS = {
  'דוחוף': 'bg-red-500/15 text-red-400 border-red-500/30',
  'חשוב': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'רגיל שלי': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function WeeklyReport({ onToolClick }) {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['weeklyReportPlans'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id }, '-updated_date');
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['weeklyReportTools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['weeklyReportTasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by_id: user.id });
    },
  });

  const weekStart = useMemo(() => moment().startOf('week'), []);
  const weekEnd = useMemo(() => moment().endOf('week'), []);

  const weeklyData = useMemo(() => {
    const updatedThisWeek = plans.filter(p => moment(p.updated_date).isAfter(weekStart));
    const completedThisWeek = plans.filter(p =>
      p.progress >= 100 && moment(p.updated_date).isAfter(weekStart)
    );
    const tasksCompletedThisWeek = tasks.filter(t =>
      t.isCompleted && t.lastUsageAlertSent && moment(t.lastUsageAlertSent).isAfter(weekStart)
    );

    // כלים שהתקדמו הכי הרבה השבוע
    const toolProgress = updatedThisWeek.map(plan => {
      const tool = tools.find(t => t.id === plan.toolId);
      const steps = plan.steps || [];
      const completedSteps = steps.filter(s => s.isCompleted).length;
      const progress = plan.progress || 0;
      const stepsCompletedThisWeek = steps.filter(s =>
        s.isCompleted && s.dueDate && moment(s.dueDate).isAfter(weekStart)
      ).length;

      return {
        name: plan.toolName,
        toolId: plan.toolId,
        progress,
        stepsCompletedThisWeek,
        totalSteps: steps.length,
        completedSteps,
        masteryLevel: tool?.masteryLevel || 'מתחיל',
        learningPriority: tool?.learningPriority || 'רגיל שלי',
        targetDate: plan.targetDate,
        plan,
      };
    }).sort((a, b) => b.stepsCompletedThisWeek - a.stepsCompletedThisWeek);

    const totalStepsCompleted = toolProgress.reduce((sum, t) => sum + t.stepsCompletedThisWeek, 0);
    const avgProgress = plans.length
      ? Math.round(plans.reduce((sum, p) => sum + (p.progress || 0), 0) / plans.length)
      : 0;

    return {
      updatedThisWeek,
      completedThisWeek,
      tasksCompletedThisWeek,
      toolProgress,
      totalStepsCompleted,
      avgProgress,
    };
  }, [plans, tasks, tools, weekStart]);

  const urgentTools = useMemo(() => {
    return tools
      .filter(t => t.learningPriority === 'דוחוף' && (t.masteryLevel || 'מתחיל') !== 'מומחה')
      .sort((a, b) => {
        const order = { 'מתחיל': 0, 'בינוני': 1, 'מומחה': 2 };
        return (order[a.masteryLevel || 'מתחיל'] || 0) - (order[b.masteryLevel || 'מתחיל'] || 0);
      })
      .slice(0, 5);
  }, [tools]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = weeklyData.toolProgress.slice(0, 6).map(t => ({
    name: t.name.length > 12 ? t.name.substring(0, 10) + '...' : t.name,
    'שלבים שהושלמו': t.stepsCompletedThisWeek,
    'התקדמות כללית': t.progress,
  }));

  return (
    <div className="space-y-6" dir="rtl">
      {/* כותרת */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-6"
      >
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/5 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-cyan-400/20 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">דוח שבועי — סיכום התקדמות</h2>
            <p className="text-sm text-slate-400">
              {weekStart.format('DD/MM')} - {weekEnd.format('DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={TrendingUp}
          label="כלים עודכנו"
          value={weeklyData.updatedThisWeek.length}
          color="text-blue-400"
        />
        <SummaryCard
          icon={Trophy}
          label="תוכניות הושלמו"
          value={weeklyData.completedThisWeek.length}
          color="text-emerald-400"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="שלבים הושלמו"
          value={weeklyData.totalStepsCompleted}
          color="text-cyan-300"
        />
        <SummaryCard
          icon={Target}
          label="התקדמות ממוצעת"
          value={`${weeklyData.avgProgress}%`}
          color="text-amber-400"
        />
      </div>

      {/* גרף התקדמות */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-5"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-300" />
            התקדמות לפי כלי
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{
                    background: '#1a202d',
                    border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="שלבים שהושלמו" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                <Bar dataKey="התקדמות כללית" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* כלים שהתקדמו הכי הרבה */}
      {weeklyData.toolProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-5"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            כלים שהתקדמו הכי הרבה השבוע
          </h3>
          <div className="space-y-3">
            {weeklyData.toolProgress.slice(0, 5).map((item, idx) => {
              const mastery = MASTERY_COLORS[item.masteryLevel] || MASTERY_COLORS['מתחיל'];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-cyan-400/10 hover:border-cyan-400/25 transition-colors cursor-pointer"
                  onClick={() => onToolClick?.({ id: item.toolId })}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600/20 border border-cyan-400/20 flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm truncate">{item.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${mastery.bg} ${mastery.text}`}>
                        {item.masteryLevel}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="text-cyan-300 font-bold text-sm">+{item.stepsCompletedThisWeek}</div>
                    <div className="text-[10px] text-slate-500">שלבים</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* כלים דחופים ללמידה */}
      {urgentTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-red-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-5"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            כלים דחופים ללמידה
          </h3>
          <div className="space-y-2">
            {urgentTools.map((tool, idx) => {
              const mastery = MASTERY_COLORS[tool.masteryLevel || 'מתחיל'] || MASTERY_COLORS['מתחיל'];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-red-400/10 hover:border-red-400/25 transition-colors cursor-pointer"
                  onClick={() => onToolClick?.(tool)}
                >
                  {tool.logo ? (
                    <img src={tool.logo} alt={tool.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <span className="text-cyan-300 text-xs font-bold">{tool.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="flex-1 text-white text-sm truncate">{tool.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${mastery.bg} ${mastery.text}`}>
                    {tool.masteryLevel || 'מתחיל'}
                  </span>
                  <Badge variant="outline" className={`text-[10px] border-none ${PRIORITY_COLORS[tool.learningPriority]}`}>
                    {tool.learningPriority}
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {weeklyData.toolProgress.length === 0 && urgentTools.length === 0 && (
        <div className="rounded-2xl border border-dashed border-cyan-400/15 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">אין פעילות למידה השבוע. התחל ללמוד כדי לראות את ההתקדמות שלך כאן!</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[11px] text-slate-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </motion.div>
  );
}