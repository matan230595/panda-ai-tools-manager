import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { GraduationCap, TrendingUp, Award, Target, Brain } from 'lucide-react';

const MASTERY_SCORE = { 'מתחיל': 33, 'בינוני': 66, 'מומחה': 100 };
const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

export default function MasteryDashboard({ tools = [], learningPlans = [] }) {
  const masteryData = useMemo(() => {
    if (!tools.length) return null;

    // קיבוץ לפי קטגוריה וחישוב אחוז שליטה ממוצע
    const byCategory = {};
    tools.forEach(tool => {
      const cat = tool.category || tool.customCategory || 'אחר';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, scoreSum: 0, levels: { 'מתחיל': 0, 'בינוני': 0, 'מומחה': 0 } };
      byCategory[cat].total++;
      const level = tool.masteryLevel || 'מתחיל';
      byCategory[cat].scoreSum += MASTERY_SCORE[level] || 33;
      byCategory[cat].levels[level] = (byCategory[cat].levels[level] || 0) + 1;
    });

    const categoryMastery = Object.entries(byCategory)
      .map(([category, data], idx) => ({
        category: category.replace(/_/g, ' '),
        mastery: Math.round(data.scoreSum / data.total),
        total: data.total,
        experts: data.levels['מומחה'],
        intermediates: data.levels['בינוני'],
        beginners: data.levels['מתחיל'],
        fill: CHART_COLORS[idx % CHART_COLORS.length],
      }))
      .sort((a, b) => b.mastery - a.mastery);

    // קצב למידה לאורך זמן — 12 חודשים אחרונים
    const now = new Date();
    const monthKeys = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('he-IL', { month: 'short' });
      monthKeys.push({ key, label, date: d });
    }

    const learningRateData = monthKeys.map(({ key, label, date }) => {
      const toolsUpToMonth = tools.filter(t => {
        if (!t.created_date) return false;
        return new Date(t.created_date) <= new Date(date.getFullYear(), date.getMonth() + 1, 0);
      });
      const cumulativeCount = toolsUpToMonth.length;
      const totalMasterySum = toolsUpToMonth.reduce((sum, t) => sum + (MASTERY_SCORE[t.masteryLevel] || 33), 0);
      const avgMastery = cumulativeCount > 0 ? Math.round(totalMasterySum / cumulativeCount) : 0;
      const added = tools.filter(t => {
        if (!t.created_date) return false;
        const td = new Date(t.created_date);
        return td.getFullYear() === date.getFullYear() && td.getMonth() === date.getMonth();
      }).length;

      return { month: label, added, cumulativeCount, avgMastery };
    });

    // סיכום כללי
    const overallMastery = Math.round(tools.reduce((sum, t) => sum + (MASTERY_SCORE[t.masteryLevel] || 33), 0) / tools.length);
    const expertCount = tools.filter(t => t.masteryLevel === 'מומחה').length;
    const intermediateCount = tools.filter(t => t.masteryLevel === 'בינוני').length;
    const beginnerCount = tools.filter(t => t.masteryLevel === 'מתחיל').length;

    // התקדמות תוכניות למידה
    const plansWithProgress = learningPlans.filter(p => p.progress != null);
    const avgPlanProgress = plansWithProgress.length > 0
      ? Math.round(plansWithProgress.reduce((sum, p) => sum + (p.progress || 0), 0) / plansWithProgress.length)
      : 0;

    return {
      categoryMastery,
      learningRateData,
      overallMastery,
      expertCount,
      intermediateCount,
      beginnerCount,
      avgPlanProgress,
      totalPlans: learningPlans.length,
      completedPlans: learningPlans.filter(p => (p.progress || 0) >= 100).length,
    };
  }, [tools, learningPlans]);

  if (!masteryData) {
    return (
      <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 p-6 text-center text-slate-400">
        <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">הוסף כלים כדי לראות את לוח השליטה וההתקדמות שלך</p>
      </div>
    );
  }

  const levelDistribution = [
    { name: 'מומחה', value: masteryData.expertCount, fill: '#10b981' },
    { name: 'בינוני', value: masteryData.intermediateCount, fill: '#f59e0b' },
    { name: 'מתחיל', value: masteryData.beginnerCount, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-4 sm:p-5 shadow-xl shadow-cyan-500/20">
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h2 className="text-lg sm:text-xl font-extrabold text-white">לוח שליטה והתקדמות</h2>
            <p className="text-xs text-cyan-100/90">אחוזי שליטה לפי קטגוריה וקצב למידה לאורך זמן</p>
          </div>
        </div>
      </div>

      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Target} label="שליטה כללית" value={`${masteryData.overallMastery}%`} gradient="from-cyan-500 to-blue-600" />
        <SummaryCard icon={Award} label="כלים שהתגברת עליהם" value={masteryData.expertCount} gradient="from-green-500 to-emerald-600" />
        <SummaryCard icon={GraduationCap} label="תוכניות למידה" value={`${masteryData.completedPlans}/${masteryData.totalPlans}`} gradient="from-purple-500 to-fuchsia-600" />
        <SummaryCard icon={TrendingUp} label="התקדמות ממוצעת" value={`${masteryData.avgPlanProgress}%`} gradient="from-amber-500 to-orange-600" />
      </div>

      {/* אחוזי שליטה לפי קטגוריה */}
      <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          אחוזי שליטה לפי קטגוריה
        </h3>
        {masteryData.categoryMastery.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(280, masteryData.categoryMastery.length * 40)}>
            <BarChart data={masteryData.categoryMastery} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="category" width={100} tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a202d', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '10px', direction: 'rtl' }}
                formatter={(value, name, props) => [
                  `${value}% (${props.payload.total} כלים · ${props.payload.experts} מומחים)`,
                  'שליטה',
                ]}
              />
              <Bar dataKey="mastery" radius={[0, 8, 8, 0]}>
                {masteryData.categoryMastery.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">אין נתוני קטגוריות</p>
        )}
      </div>

      {/* קצב למידה לאורך זמן */}
      <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          קצב למידה ושיפור לאורך זמן
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={masteryData.learningRateData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a202d', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '10px', direction: 'rtl' }} />
            <Legend wrapperStyle={{ direction: 'rtl', fontSize: '12px' }} />
            <Area yAxisId="left" type="monotone" dataKey="cumulativeCount" name="כלים מצטבר" stroke="#06b6d4" strokeWidth={2} fill="url(#colorCount)" />
            <Area yAxisId="right" type="monotone" dataKey="avgMastery" name="שליטה ממוצעת %" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorMastery)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* פילוח רמות שליטה + כלים שנוספו בחודש */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4 md:p-6">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">פילוח רמות שליטה</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={levelDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={60} tick={{ fill: '#e2e8f0', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a202d', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '10px', direction: 'rtl' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4 md:p-6">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">כלים חדשים בחודש</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={masteryData.learningRateData.slice(-6)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a202d', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '10px', direction: 'rtl' }} />
              <Bar dataKey="added" name="כלים חדשים" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-3 sm:p-4 shadow-lg`}>
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <Icon className="w-5 h-5 text-white/80 mb-1.5" />
      <div className="text-lg sm:text-xl font-extrabold text-white">{value}</div>
      <div className="text-[10px] sm:text-xs text-white/80 leading-tight">{label}</div>
    </div>
  );
}