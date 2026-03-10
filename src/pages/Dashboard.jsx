import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, TrendingUp, DollarSign, Package, AlertCircle, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';

export default function Dashboard() {
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
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

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="text-right">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">דשבורד</h1>
        <p className="text-gray-600 dark:text-gray-400">סטטיסטיקות ואנליטיקה של כלי ה-AI שלך</p>
      </div>

      {/* קרטיסים סטטיסטיקות עליונות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            כלים יקרים ביותר
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* תרשים כלים לפי קטגוריה */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4">כלים לפי קטגוריה</h2>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4">עלויות חודשיות</h2>
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

      {/* כלים בשימוש תדיר */}
      {frequentlyUsed.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            כלים בשימוש תדיר
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}