import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { BarChart3, TrendingUp, DollarSign, Package, AlertCircle, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SmartRecommendations from '@/components/recommendations/SmartRecommendations';
import ReminderCalendarView from '@/components/calendar/ReminderCalendarView';
import moment from 'moment';

export default function Dashboard() {
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by: user.email });
    },
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by: user.email });
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by: user.email });
    },
  });

  const { data: toolTasks = [] } = useQuery({
    queryKey: ['toolTasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by: user.email });
    },
  });

  // חישוב סטטיסטיקות
  const stats = {
    totalTools: tools.length,
    totalMonthlyCost: tools.reduce((sum, t) => sum + (t.usageStats?.totalCostPerMonth || 0), 0),
    favoriteTools: tools.filter(t => t.isFavorite).length,
    toolsWithSubscription: tools.filter(t => t.hasSubscription).length,
    unusedTools: tools.filter(t => !t.usageStats?.timesUsed || t.usageStats.timesUsed === 0).length,
    averageRating: (tools.reduce((sum, t) => sum + (t.rating || 0), 0) / tools.length || 0).toFixed(1),
  };

  // נתונים לתרשים - שימוש לפי קטגוריה
  const categoriesData = () => {
    const grouped = {};
    tools.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = 0;
      grouped[t.category]++;
    });
    return Object.entries(grouped).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
      usage: tools
        .filter(t => t.category === name)
        .reduce((sum, t) => sum + (t.usageStats?.timesUsed || 0), 0)
    }));
  };

  // נתונים לתרשים - עלות חודשית לפי כלי
  const topExpensiveTools = tools
    .filter(t => (t.usageStats?.totalCostPerMonth || 0) > 0)
    .sort((a, b) => (b.usageStats?.totalCostPerMonth || 0) - (a.usageStats?.totalCostPerMonth || 0))
    .slice(0, 5)
    .map(t => ({
      name: t.name,
      cost: t.usageStats?.totalCostPerMonth || 0,
      usage: t.usageStats?.timesUsed || 0
    }));

  // כלים בשימוש תדיר
  const frequentlyUsed = tools
    .filter(t => t.usageStats?.timesUsed > 0)
    .sort((a, b) => (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0))
    .slice(0, 5);

  const roiData = tools
    .filter(tool => (tool.roiPercentage || 0) !== 0 || (tool.directRevenue || 0) > 0 || (tool.timeSavingsHours || 0) > 0)
    .sort((a, b) => (b.roiPercentage || 0) - (a.roiPercentage || 0))
    .slice(0, 6)
    .map((tool) => ({
      name: tool.name,
      roi: tool.roiPercentage || 0,
      revenue: tool.directRevenue || 0,
      timeSavings: tool.timeSavingsHours || 0,
    }));

  const usageTrendData = tools
    .filter(tool => tool.usageStats?.timesUsed > 0)
    .slice(0, 8)
    .map((tool) => ({
      name: tool.name,
      usage: tool.usageStats?.timesUsed || 0,
      duration: tool.usageStats?.averageSessionDuration || 0,
    }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="text-right px-1 sm:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">דשבורד</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">סטטיסטיקות ואנליטיקה של כלי ה-AI שלך</p>
      </div>

      {/* קרטיסים סטטיסטיקות עליונות */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <StatCard
          title="סך הכלים"
          value={stats.totalTools}
          icon={<Package className="w-5 h-5" />}
          color="bg-blue-500"
        />
        <StatCard
          title="עלות חודשית"
          value={`₪${stats.totalMonthlyCost.toLocaleString('he-IL')}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-red-500"
        />
        <StatCard
          title="עם מנוי"
          value={stats.toolsWithSubscription}
          icon={<Calendar className="w-5 h-5" />}
          color="bg-purple-500"
        />
        <StatCard
          title="כלים שלא בשימוש"
          value={stats.unusedTools}
          icon={<AlertCircle className="w-5 h-5" />}
          color="bg-orange-500"
        />
        <StatCard
          title="דירוג ממוצע"
          value={stats.averageRating}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-green-500"
        />
      </div>

      {/* טבלת כלים יקרים ביותר */}
      {topExpensiveTools.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />
            כלים יקרים ביותר
          </h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2 px-4 font-semibold">כלי</th>
                  <th className="py-2 px-4 font-semibold">עלות חודשית</th>
                  <th className="py-2 px-4 font-semibold">מספר שימושים</th>
                  <th className="py-2 px-4 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody>
                {topExpensiveTools.map((tool, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">{tool.name}</td>
                    <td className="py-3 px-4">₪{tool.cost.toLocaleString('he-IL')}</td>
                    <td className="py-3 px-4">{tool.usage}</td>
                    <td className="py-3 px-4">
                      {tool.usage > 0 ? `₪${(tool.cost / tool.usage).toFixed(2)}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* תרשימים */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* תרשים כלים לפי קטגוריה */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">כלים לפי קטגוריה</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriesData().slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* תרשים עלויות */}
        {topExpensiveTools.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">עלויות חודשיות</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topExpensiveTools.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {roiData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">ROI ורווחיות לפי כלי</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={90} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" fill="#10b981" name="ROI %" />
              <Bar dataKey="revenue" fill="#6366f1" name="הכנסה ישירה" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {usageTrendData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">טרנדי שימוש בזמן</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={usageTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#6366f1" name="כמות שימושים" strokeWidth={2} />
              <Line type="monotone" dataKey="duration" stroke="#f59e0b" name="משך שימוש בדקות" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4">המלצות חכמות</h2>
          <SmartRecommendations />
        </div>

        <ReminderCalendarView reminders={reminders.filter(item => !item.isCompleted && item.isActive)} subscriptions={subscriptions.filter(item => item.isActive)} tasks={toolTasks.filter(item => !item.isCompleted)} onMoveReminder={() => {}} onMoveTask={() => {}} />
      </div>

      {/* כלים בשימוש תדיר */}
      {frequentlyUsed.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
            כלים בשימוש תדיר
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {frequentlyUsed.map((tool, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">{tool.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">שימושים</span>
                  <span className="text-lg font-bold text-indigo-600">{tool.usageStats?.timesUsed || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-gray-200 dark:border-gray-700">
      <div className={`${color} w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-lg flex items-center justify-center text-white mb-2 sm:mb-3`}>
        <span className="text-sm sm:text-base">{icon}</span>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">{title}</p>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}