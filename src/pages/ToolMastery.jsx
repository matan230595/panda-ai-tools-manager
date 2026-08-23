import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import {
  ArrowRight, GraduationCap, TrendingUp, Clock, Target,
  Award, Zap, BookOpen, CheckCircle2, ChevronLeft, CheckSquare,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LearningReportExport from '@/components/tools/LearningReportExport';

const SKILL_LEVELS = [
  { min: 0, max: 24, label: 'מתחיל', color: '#ef4444', bg: 'from-red-500 to-orange-500', icon: BookOpen },
  { min: 25, max: 49, label: 'בסיסי', color: '#f59e0b', bg: 'from-amber-500 to-yellow-500', icon: Zap },
  { min: 50, max: 74, label: 'בינוני', color: '#3b82f6', bg: 'from-blue-500 to-indigo-500', icon: TrendingUp },
  { min: 75, max: 89, label: 'מתקדם', color: '#8b5cf6', bg: 'from-purple-500 to-violet-500', icon: Award },
  { min: 90, max: 100, label: 'מומחה', color: '#10b981', bg: 'from-emerald-500 to-teal-500', icon: GraduationCap },
];

const getSkillLevel = (progress) => SKILL_LEVELS.find(l => progress >= l.min && progress <= l.max) || SKILL_LEVELS[0];

export default function ToolMastery() {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const { data: tool, isLoading: toolLoading } = useQuery({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      const user = await getCurrentUser();
      const tools = await base44.entities.AiTool.filter({ created_by_id: user.id, id: toolId });
      return tools[0] || null;
    },
    enabled: !!toolId,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['masteryPlans', toolId],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id, toolId });
    },
    enabled: !!toolId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['masteryTasks', toolId],
    queryFn: async () => {
      const user = await getCurrentUser();
      const allTasks = await base44.entities.ToolTask.filter({ created_by_id: user.id });
      return allTasks.filter(t => t.toolId === toolId);
    },
    enabled: !!toolId,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['masteryRatings', toolId],
    queryFn: async () => {
      const user = await getCurrentUser();
      const allRatings = await base44.entities.UserToolRating.filter({ created_by_id: user.id });
      return allRatings.filter(r => r.toolId === toolId);
    },
    enabled: !!toolId,
  });

  const masteryData = useMemo(() => {
    const plan = plans[0];
    const planProgress = plan?.progress || 0;
    const taskCompletion = tasks.length > 0 ? (tasks.filter(t => t.isCompleted).length / tasks.length) * 100 : 0;
    const ratingScore = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length / 5) * 100 : 0;
    const usageScore = tool?.usageStats?.timesUsed ? Math.min(100, tool.usageStats.timesUsed * 10) : 0;

    const overallScore = Math.round(
      (planProgress * 0.4) + (taskCompletion * 0.3) + (ratingScore * 0.15) + (usageScore * 0.15)
    );

    const skillLevel = getSkillLevel(overallScore);

    const progressHistory = (plan?.steps || []).map((step, i) => ({
      step: `שלב ${i + 1}`,
      progress: step.isCompleted ? 100 : Math.round((plan.steps.filter(s => s.isCompleted).length / (i + 1)) * 100),
      name: step.title,
    }));

    return {
      overallScore,
      skillLevel,
      planProgress: Math.round(planProgress),
      taskCompletion: Math.round(taskCompletion),
      ratingScore: Math.round(ratingScore),
      usageScore: Math.round(usageScore),
      completedTasks: tasks.filter(t => t.isCompleted).length,
      totalTasks: tasks.length,
      progressHistory,
      plan,
    };
  }, [plans, tasks, ratings, tool]);

  if (toolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
        <div className="w-8 h-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14]">
        <div className="text-center">
          <p className="text-slate-400 mb-4">הכלי לא נמצא</p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-cyan-400/20 text-cyan-300">חזרה לדף הבית</Button>
        </div>
      </div>
    );
  }

  const { overallScore, skillLevel } = masteryData;
  const radialData = [{ name: 'מיומנות', value: overallScore, fill: skillLevel.color }];

  return (
    <div className="min-h-screen bg-[#0b0e14]" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* כותרת + חזור */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            {tool.logo ? (
              <img src={tool.logo} alt={tool.name} className="w-12 h-12 rounded-2xl object-cover shadow-[0_0_20px_-4px_rgba(0,212,255,0.3)] ring-1 ring-cyan-400/20" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-cyan-400/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-cyan-300" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{tool.name}</h1>
              <p className="text-sm text-slate-400">סיכום מיומנות והתקדמות למידה</p>
            </div>
          </div>
          <Badge className={`bg-gradient-to-r ${skillLevel.bg} text-white px-4 py-2 text-sm font-semibold shadow-lg`}>
            <skillLevel.icon className="w-4 h-4 ml-1.5" />
            {skillLevel.label}
          </Badge>
        </div>

        {/* כרטיס ציון כללי עם גרף רדיאלי */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl"
        >
          <div className={`bg-gradient-to-l ${skillLevel.bg} p-6`}>
            <div className="flex items-center justify-between text-white">
              <div>
                <div className="text-sm opacity-90 mb-1">רמת המיומנות שלך</div>
                <div className="text-5xl font-black">{overallScore}%</div>
                <div className="text-sm opacity-80 mt-1">{skillLevel.label}</div>
              </div>
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.2)' }} dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* כפתורי ייצוא */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-300">ייצוא דוח התקדמות</h3>
          <LearningReportExport tool={tool} plans={plans} tasks={tasks} masteryData={masteryData} />
        </div>

        {/* כרטיסי מדדים */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={BookOpen} label="התקדמות תוכנית" value={`${masteryData.planProgress}%`} color="text-blue-400" />
          <MetricCard icon={CheckCircle2} label="משימות הושלמו" value={`${masteryData.completedTasks}/${masteryData.totalTasks}`} color="text-emerald-400" />
          <MetricCard icon={Award} label="דירוג אישי" value={`${masteryData.ratingScore}%`} color="text-cyan-300" />
          <MetricCard icon={Zap} label="אינטנסיביות שימוש" value={`${masteryData.usageScore}%`} color="text-amber-400" />
        </div>

        {/* גרף התקדמות לאורך זמן */}
        {masteryData.progressHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-5"
          >
            <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <TrendingUp className="w-5 h-5 text-cyan-300" />
              התקדמות למידה לאורך זמן
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={masteryData.progressHistory}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={skillLevel.color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={skillLevel.color} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="step" tick={{ fill: '#64748b', fontSize: 12 }} reversed />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: '#1a202d', border: '1px solid rgba(0,212,255,0.2)', fontSize: '13px' }}
                    formatter={(value) => [`${value}%`, 'התקדמות']}
                  />
                  <Area type="monotone" dataKey="progress" stroke={skillLevel.color} strokeWidth={3} fill="url(#progressGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* שלבי למידה */}
        {masteryData.plan?.steps?.length > 0 && (
          <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <Target className="w-5 h-5 text-cyan-300" />
              שלבי הלמידה
            </h3>
            <div className="space-y-3">
              {masteryData.plan.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-cyan-400/10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                    {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${step.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {step.title}
                    </div>
                    {step.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(step.dueDate).toLocaleDateString('he-IL')}
                      </div>
                    )}
                  </div>
                  {step.isCompleted && <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">הושלם</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* משימות קשורות */}
        {tasks.length > 0 && (
          <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <CheckSquare className="w-5 h-5 text-cyan-300" />
              משימות ({masteryData.completedTasks}/{masteryData.totalTasks})
            </h3>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${task.isCompleted ? 'bg-emerald-500 text-white' : 'border-2 border-slate-600'}`}>
                    {task.isCompleted && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span className={`text-sm flex-1 ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </span>
                  {task.priority === 'high' && <Badge variant="destructive" className="text-[10px]">דחוף</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4 text-center"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 mx-auto mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </motion.div>
  );
}