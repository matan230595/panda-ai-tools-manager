import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';

export default function UsageTrends({ tools }) {
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  const usageData = months.map((month, i) => ({
    month,
    משתמשים: Math.floor(Math.random() * 100) + 20,
    פעילות: Math.floor(Math.random() * 500) + 100,
    הוצאה: Math.floor(Math.random() * 5000) + 1000,
    כלים_חדשים: Math.floor(Math.random() * 5)
  }));

  const toolPopularityTrend = tools
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
    .map(t => ({
      name: t.name.substring(0, 10),
      popularity: t.popularity || 0,
      usage: Math.floor(Math.random() * 100),
      retention: Math.floor(Math.random() * 100)
    }));

  return (
    <div className="space-y-6">
      {/* Activity Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            פעילות לאורך זמן
          </CardTitle>
          <CardDescription>מגמות שימוש בשנה האחרונה</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={usageData}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="פעילות" stroke="#8884d8" fillOpacity={1} fill="url(#colorActivity)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-metric Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ניתוח רב-מימדי</CardTitle>
          <CardDescription>משתמשים, פעילות והוצאה חודשית</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="משתמשים" fill="#8884d8" name="משתמשים" />
              <Bar yAxisId="right" dataKey="הוצאה" fill="#82ca9d" name="הוצאה (₪)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Tools Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            ביצועי כלים מובילים
          </CardTitle>
          <CardDescription>פופולריות, שימוש, והחזקה</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={toolPopularityTrend} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="popularity" fill="#8884d8" name="פופולריות" />
              <Bar dataKey="usage" fill="#82ca9d" name="שימוש" />
              <Bar dataKey="retention" fill="#ffc658" name="החזקה" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quarterly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>מגמות רבעוניות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Q1', value: '₪12,500', trend: '+15%' },
              { label: 'Q2', value: '₪14,200', trend: '+13.6%' },
              { label: 'Q3', value: '₪15,800', trend: '+11.3%' },
              { label: 'Q4', value: '₪18,500', trend: '+17%' }
            ].map((q, i) => (
              <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{q.label}</div>
                <div className="text-2xl font-bold mb-2">{q.value}</div>
                <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {q.trend}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}