import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export default function AdvancedAnalytics() {
  const { data: tools = [] } = useQuery({
    queryKey: ['analytics-tools'],
    queryFn: async () => base44.entities.AiTool.list(),
  });

  // Calculate usage trends
  const usageTrends = tools
    .filter(t => t.usageStats)
    .sort((a, b) => new Date(b.usageStats.lastUsedDate) - new Date(a.usageStats.lastUsedDate))
    .slice(0, 7)
    .map(t => ({
      name: t.name.substring(0, 10),
      usage: t.usageStats.timesUsed || 0,
      lastUsed: new Date(t.usageStats.lastUsedDate || Date.now()).getDate(),
    }));

  // Category distribution
  const categoryDistribution = Object.entries(
    tools.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({
    name: category.replace(/_/g, ' '),
    value: count,
  }));

  // Cost analysis
  const totalCost = tools.reduce((sum, t) => sum + (t.usageStats?.totalCostPerMonth || 0), 0);
  const avgCost = totalCost / tools.length || 0;

  // Most used tools
  const topTools = tools
    .filter(t => t.usageStats?.timesUsed > 0)
    .sort((a, b) => (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">כלים פעילים</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{tools.length}</p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">סה״כ שימוש</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {tools.reduce((sum, t) => sum + (t.usageStats?.timesUsed || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ממוצע עלות</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${avgCost.toFixed(1)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">סה״כ עלות חודשית</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${totalCost.toFixed(0)}
                </p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">מגמות שימוש</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">חלוקה לפי קטגוריה</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Tools */}
      {topTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">הכלים המובילים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTools.map((tool, idx) => (
                <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{tool.name}</p>
                      <p className="text-xs text-gray-500">שימוש: {tool.usageStats?.timesUsed || 0}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {tool.usageStats?.timesUsed || 0}x
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}