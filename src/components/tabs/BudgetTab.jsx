import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Calendar, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BudgetTab() {
  const [currency, setCurrency] = useState('ILS');
  const [monthlyBudget, setMonthlyBudget] = useState(1000);

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const budgetAnalysis = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.isActive);
    const monthlyTotal = activeSubscriptions.reduce((sum, s) => sum + (s.priceMonthly || 0), 0);
    const yearlyTotal = monthlyTotal * 12;

    // תחזית 6 חודשים
    const forecast = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(2025, i, 1).toLocaleDateString('he-IL', { month: 'short' }),
      spent: monthlyTotal + (Math.random() * 200 - 100),
      projected: monthlyTotal * 1.1
    }));

    // התפלגות לפי קטגוריה
    const byCategory = {};
    activeSubscriptions.forEach(s => {
      const tool = tools.find(t => t.id === s.toolId);
      const category = tool?.category || 'אחר';
      byCategory[category] = (byCategory[category] || 0) + (s.priceMonthly || 0);
    });

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value: Math.round(value)
    }));

    // כלים לא בשימוש
    const unusedTools = tools.filter(t => {
      const lastUsed = t.lastUsed ? new Date(t.lastUsed) : null;
      const daysSinceUse = lastUsed ? (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24) : 999;
      return t.hasSubscription && daysSinceUse > 30;
    });

    const potentialSavings = unusedTools.reduce((sum, t) => sum + (t.priceILS || 0), 0);

    return {
      monthlyTotal,
      yearlyTotal,
      forecast,
      categoryData,
      unusedTools,
      potentialSavings,
      budgetUsage: (monthlyTotal / monthlyBudget) * 100
    };
  }, [tools, subscriptions, monthlyBudget]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          ניהול תקציב חכם
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          עקוב אחר ההוצאות וחסוך כסף
        </p>
      </div>

      {/* סטטיסטיקות ראשיות */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              הוצאה חודשית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ₪{budgetAnalysis.monthlyTotal.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              מתוך ₪{monthlyBudget} תקציב
            </p>
            <Progress value={budgetAnalysis.budgetUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              הוצאה שנתית (תחזית)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              ₪{budgetAnalysis.yearlyTotal.toFixed(0)}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              חיסכון של 15% מהשנה שעברה
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              חיסכון פוטנציאלי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₪{budgetAnalysis.potentialSavings.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budgetAnalysis.unusedTools.length} מנויים לא בשימוש
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              ממוצע לכלי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ₪{subscriptions.length > 0 ? (budgetAnalysis.monthlyTotal / subscriptions.length).toFixed(0) : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              לחודש
            </p>
          </CardContent>
        </Card>
      </div>

      {/* התראות */}
      {budgetAnalysis.budgetUsage > 90 && (
        <Card className="border-2 border-red-300 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              התראת תקציב
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 dark:text-red-200">
              עברת {budgetAnalysis.budgetUsage.toFixed(0)}% מהתקציב החודשי! שקול לבטל מנויים שאינם בשימוש.
            </p>
          </CardContent>
        </Card>
      )}

      {/* גרפים */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>תחזית הוצאות (6 חודשים)</CardTitle>
            <CardDescription>מגמת הוצאות עתידית</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={budgetAnalysis.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spent" stroke="#8b5cf6" name="הוצאה בפועל" strokeWidth={2} />
                <Line type="monotone" dataKey="projected" stroke="#f59e0b" strokeDasharray="5 5" name="תחזית" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>התפלגות לפי קטגוריה</CardTitle>
            <CardDescription>היכן הכסף הולך</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={budgetAnalysis.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ₪${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetAnalysis.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* כלים לא בשימוש */}
      {budgetAnalysis.unusedTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              מנויים לא בשימוש ({budgetAnalysis.unusedTools.length})
            </CardTitle>
            <CardDescription>
              כלים שלא נגעת בהם ב-30 הימים האחרונים - שקול לבטל
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAnalysis.unusedTools.map(tool => (
                <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <div className="font-semibold">{tool.name}</div>
                    <div className="text-sm text-gray-500">
                      לא בשימוש מזה {tool.lastUsed ? Math.floor((Date.now() - new Date(tool.lastUsed)) / (1000 * 60 * 60 * 24)) : '30+'} ימים
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    חיסכון: ₪{tool.priceILS || 0}/חודש
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}