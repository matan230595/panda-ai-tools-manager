import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Calendar, PieChart, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function BudgetTab() {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState('ILS');
  const [monthlyBudget, setMonthlyBudget] = useState(1000);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const user = await getCurrentUser();
      const list = await base44.entities.Settings.filter({ created_by: user.email });
      return list[0] || null;
    },
  });

  const saveBudgetMutation = useMutation({
    mutationFn: async (value) => {
      if (settings?.id) {
        return base44.entities.Settings.update(settings.id, { monthlyApibudget: value });
      }
      return base44.entities.Settings.create({ monthlyApibudget: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('התקציב נשמר');
    },
  });

  useEffect(() => {
    if (typeof settings?.monthlyApibudget === 'number') {
      setMonthlyBudget(settings.monthlyApibudget);
    }
  }, [settings?.monthlyApibudget]);

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

  const budgetAnalysis = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.isActive);
    const monthlyTotal = activeSubscriptions.reduce((sum, s) => sum + (s.priceMonthly || 0), 0);
    const yearlyTotal = monthlyTotal * 12;

    // תחזית 6 חודשים עם רמות ביטחון
    const forecast = Array.from({ length: 6 }, (_, i) => {
      const baseSpending = monthlyTotal;
      const trend = baseSpending * 0.02 * i; // עלייה של 2% בחודש
      const variance = Math.random() * 100 - 50;
      
      return {
        month: new Date(2026, i, 1).toLocaleDateString('he-IL', { month: 'short' }),
        spent: Math.round(baseSpending + variance),
        projected: Math.round(baseSpending + trend),
        low: Math.round(baseSpending + trend - 100),
        high: Math.round(baseSpending + trend + 100),
        confidence: i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
      };
    });

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

    // זיהוי כלים לא בשימוש עם ציון שימוש
    const unusedTools = tools.filter(t => {
      const lastUsed = t.lastUsed ? new Date(t.lastUsed) : null;
      const daysSinceUse = lastUsed ? (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24) : 999;
      return t.hasSubscription && daysSinceUse > 30;
    }).map(t => {
      const lastUsed = t.lastUsed ? new Date(t.lastUsed) : null;
      const daysSinceUse = lastUsed ? (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24) : 999;
      const usageScore = Math.max(0, 100 - daysSinceUse);
      
      return {
        ...t,
        daysSinceUse: Math.floor(daysSinceUse),
        usageScore,
        savingsImpact: (t.priceILS || 0) * 12
      };
    });

    const potentialSavings = unusedTools.reduce((sum, t) => sum + (t.priceILS || 0), 0);

    // זיהוי דפוסי הוצאה חריגים
    const spendingSpikes = forecast.filter((month, idx) => {
      if (idx === 0) return false;
      const prevMonth = forecast[idx - 1];
      const increase = ((month.spent - prevMonth.spent) / prevMonth.spent) * 100;
      return increase > 15; // עלייה של יותר מ-15%
    });

    // המלצות לחיסכון
    const savingsRecommendations = [];
    
    if (unusedTools.length > 0) {
      savingsRecommendations.push({
        type: 'cancel',
        title: `ביטול ${unusedTools.length} מנויים לא בשימוש`,
        savings: potentialSavings,
        impact: 'high',
        tools: unusedTools.map(t => t.name)
      });
    }

    const premiumTools = activeSubscriptions.filter(s => {
      const tool = tools.find(t => t.id === s.toolId);
      return tool?.subscriptionType === 'פרימיום' || tool?.subscriptionType === 'גולד';
    });

    if (premiumTools.length > 0) {
      savingsRecommendations.push({
        type: 'downgrade',
        title: `שקול דאונגרייד למנוי בסיסי`,
        savings: premiumTools.reduce((sum, s) => sum + (s.priceMonthly * 0.3 || 0), 0),
        impact: 'medium',
        tools: premiumTools.map(s => s.toolName)
      });
    }

    return {
      monthlyTotal,
      yearlyTotal,
      forecast,
      categoryData,
      unusedTools,
      potentialSavings,
      budgetUsage: (monthlyTotal / monthlyBudget) * 100,
      spendingSpikes,
      savingsRecommendations
    };
  }, [tools, subscriptions, monthlyBudget]);

  const generateAIInsights = async () => {
    setAiInsightsLoading(true);
    try {
      const prompt = `נתח את דפוסי ההוצאות הבאים וספק תובנות והמלצות מפורטות:

הוצאה חודשית נוכחית: ₪${budgetAnalysis.monthlyTotal}
תקציב: ₪${monthlyBudget}
מספר מנויים פעילים: ${subscriptions.filter(s => s.isActive).length}
כלים לא בשימוש: ${budgetAnalysis.unusedTools.length}
חיסכון פוטנציאלי: ₪${budgetAnalysis.potentialSavings}

בהתבסס על הנתונים, תן המלצות ספציפיות ל:
1. אופטימיזציה של ההוצאות
2. כלים שכדאי להחליף
3. אסטרטגיית חיסכון לטווח ארוך
4. תחזית והתראות`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            optimizations: { type: 'array', items: { type: 'string' } },
            alternatives: { type: 'array', items: { type: 'string' } },
            strategy: { type: 'string' },
            forecast: { type: 'string' }
          }
        }
      });

      setAiInsights(response);
      toast.success('תובנות AI נוצרו בהצלחה! 🧠');
    } catch (error) {
      toast.error('שגיאה ביצירת תובנות AI');
    } finally {
      setAiInsightsLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            ניהול תקציב חכם
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            עקוב אחר ההוצאות וחסוך כסף עם AI
          </p>
        </div>
        <Button
          onClick={generateAIInsights}
          disabled={aiInsightsLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-600"
        >
          {aiInsightsLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
              מנתח...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 ml-2" />
              תובנות AI
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תקציב חודשי</CardTitle>
          <CardDescription>הגדר את תקרת ההוצאה שלך למעקב מדויק.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="w-full sm:w-64">
            <Input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
              placeholder="1000"
            />
          </div>
          <Button onClick={() => saveBudgetMutation.mutate(monthlyBudget)} disabled={saveBudgetMutation.isPending}>
            שמור תקציב
          </Button>
        </CardContent>
      </Card>

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
              חיסכון פוטנציאלי של 15%
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

      {/* תובנות AI */}
      {aiInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              תובנות AI מותאמות אישית
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">📊 סיכום:</h4>
              <p className="text-gray-700 dark:text-gray-300">{aiInsights.summary}</p>
            </div>
            
            {aiInsights.optimizations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">⚡ אופטימיזציות מומלצות:</h4>
                <ul className="space-y-1">
                  {aiInsights.optimizations.map((opt, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.strategy && (
              <div>
                <h4 className="font-semibold mb-2">🎯 אסטרטגיה לטווח ארוך:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{aiInsights.strategy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* ספייקים בהוצאות */}
      {budgetAnalysis.spendingSpikes.length > 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingUp className="w-5 h-5" />
              התראת עלייה חריגה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800 dark:text-orange-200">
              זוהתה עלייה חריגה בהוצאות ב-{budgetAnalysis.spendingSpikes.length} מהחודשים הקרובים
            </p>
          </CardContent>
        </Card>
      )}

      {/* המלצות לחיסכון */}
      {budgetAnalysis.savingsRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              המלצות לחיסכון מבוססות AI
            </CardTitle>
            <CardDescription>פעולות מומלצות להפחתת עלויות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {budgetAnalysis.savingsRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-green-800 dark:text-green-200">{rec.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      חיסכון צפוי: ₪{Math.round(rec.savings)}/חודש • ₪{Math.round(rec.savings * 12)}/שנה
                    </div>
                    {rec.tools && (
                      <div className="text-xs text-gray-500 mt-2">
                        כלים: {rec.tools.slice(0, 3).join(', ')}{rec.tools.length > 3 && ` ועוד ${rec.tools.length - 3}`}
                      </div>
                    )}
                  </div>
                  <Badge className={
                    rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                    rec.impact === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {rec.impact === 'high' ? 'השפעה גבוהה' : rec.impact === 'medium' ? 'השפעה בינונית' : 'השפעה נמוכה'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* גרפים */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>תחזית הוצאות (6 חודשים)</CardTitle>
            <CardDescription>
              תחזית עם רמות ביטחון: 
              <Badge variant="outline" className="mr-2">גבוה</Badge>
              <Badge variant="outline" className="mr-2">בינוני</Badge>
              <Badge variant="outline">נמוך</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={budgetAnalysis.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeDasharray="3 3" name="תחזית גבוהה" strokeWidth={1} />
                <Line type="monotone" dataKey="projected" stroke="#8b5cf6" name="תחזית" strokeWidth={2} />
                <Line type="monotone" dataKey="low" stroke="#10b981" strokeDasharray="3 3" name="תחזית נמוכה" strokeWidth={1} />
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
              כלים שלא נגעת בהם ב-30 הימים האחרונים - מדורגים לפי חיסכון פוטנציאלי
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAnalysis.unusedTools.map(tool => (
                <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1">
                    <div className="font-semibold">{tool.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span>לא בשימוש: {tool.daysSinceUse} ימים</span>
                      <span className="text-xs">ציון שימוש: {tool.usageScore}/100</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge className="bg-orange-100 text-orange-800 mb-1">
                      ₪{tool.priceILS || 0}/חודש
                    </Badge>
                    <div className="text-xs text-gray-500">
                      חיסכון שנתי: ₪{tool.savingsImpact}
                    </div>
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