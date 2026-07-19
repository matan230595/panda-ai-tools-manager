import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { CalendarRange, Download, Loader2, TrendingUp, DollarSign, Clock, GraduationCap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#ef4444'];

export default function MonthlySummaryReport() {
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by_id: user.id });
    },
  });

  const { data: learningPlans = [] } = useQuery({
    queryKey: ['learningPlansReport'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id });
    },
  });

  const generateReport = useMemo(() => () => {
    setIsGenerating(true);
    const now = new Date();
    const monthName = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

    const activeTools = tools.filter((t) => t.operationalStatus === 'בשימוש');
    const totalMonthlyCost = activeTools.reduce((sum, t) => sum + (t.priceILS || 0), 0);

    const categoryBreakdown = tools.reduce((acc, t) => {
      const cat = t.category || 'אחר';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const budgetByCategory = activeTools.reduce((acc, t) => {
      const cat = t.category || 'אחר';
      acc[cat] = (acc[cat] || 0) + (t.priceILS || 0);
      return acc;
    }, {});

    const sortedByUsage = [...tools].sort((a, b) => {
      const aTime = a.usageStats?.timesUsed || 0;
      const bTime = b.usageStats?.timesUsed || 0;
      return bTime - aTime;
    });

    const topTools = sortedByUsage.slice(0, 5).map((t) => ({
      name: t.name,
      timesUsed: t.usageStats?.timesUsed || 0,
      frequency: t.usageStats?.usageFrequency || 'לא צוין',
      priceILS: t.priceILS || 0,
    }));

    const pieData = Object.entries(budgetByCategory).map(([name, value]) => ({ name, value }));

    // נתוני למידה
    const activeLearningPlans = learningPlans.filter((p) => (p.progress || 0) < 100);
    const completedLearning = learningPlans.filter((p) => (p.progress || 0) >= 100);
    const avgLearningProgress = learningPlans.length
      ? Math.round(learningPlans.reduce((sum, p) => sum + (p.progress || 0), 0) / learningPlans.length)
      : 0;

    const learningByTool = learningPlans
      .map((p) => ({
        name: p.toolName || p.title,
        progress: Math.round(p.progress || 0),
        stepsTotal: (p.steps || []).length,
        stepsCompleted: (p.steps || []).filter((s) => s.isCompleted).length,
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    setReport({
      monthName,
      totalTools: tools.length,
      activeTools: activeTools.length,
      totalMonthlyCost,
      categoryCount: Object.keys(categoryBreakdown).length,
      pieData,
      topTools,
      categoryBreakdown,
      learning: {
        totalPlans: learningPlans.length,
        activePlans: activeLearningPlans.length,
        completedPlans: completedLearning.length,
        avgProgress: avgLearningProgress,
        topLearning: learningByTool,
      },
    });
    setIsGenerating(false);
    toast.success('הדוח החודשי הופק בהצלחה! 📊');
  }, [tools, subscriptions, learningPlans]);

  const exportReport = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly-summary-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('הדוח יוצא בהצלחה! 📥');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-right">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-indigo-500" />
            סיכום חודשי
          </h2>
          <p className="text-sm text-gray-500">התפלגות תקציב וכלים פעילים ביותר</p>
        </div>
        <div className="flex gap-2">
          {report && (
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 ml-2" /> ייצא
            </Button>
          )}
          <Button onClick={generateReport} disabled={isGenerating || tools.length === 0}>
            {isGenerating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <TrendingUp className="w-4 h-4 ml-2" />}
            צור דוח חודשי
          </Button>
        </div>
      </div>

      {!report ? (
        <Card className="border-2 border-dashed border-indigo-300 dark:border-indigo-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <CalendarRange className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-gray-500 text-center max-w-sm">צור דוח חודשי המרכז את התפלגות התקציב והכלים הפעילים ביותר שלך</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">סה"כ כלים</span>
                </div>
                <div className="text-2xl font-bold">{report.totalTools}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">כלים פעילים</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{report.activeTools}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">עלות חודשית</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">₪{report.totalMonthlyCost.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarRange className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-gray-500">קטגוריות</span>
                </div>
                <div className="text-2xl font-bold">{report.categoryCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">התפלגות תקציב לפי קטגוריה</CardTitle>
                <CardDescription>{report.monthName}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={report.pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {report.pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₪${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">כלים פעילים ביותר</CardTitle>
                <CardDescription>לפי תדירות שימוש</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.topTools} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="timesUsed" fill="#6366f1" name="שימושים" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">פירוט כלים מובילים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.topTools.map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-gray-500">{tool.frequency}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tool.timesUsed} שימושים</Badge>
                      {tool.priceILS > 0 && <Badge variant="outline">₪{tool.priceILS}/חודש</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* בלום התקדמות למידה */}
          {report.learning && report.learning.totalPlans > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  התקדמות למידה — {report.monthName}
                </CardTitle>
                <CardDescription>כלים עם ההתקדמות הגבוהה ביותר בלמידה</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{report.learning.activePlans}</div>
                    <div className="text-xs text-gray-500">בתהליך</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{report.learning.completedPlans}</div>
                    <div className="text-xs text-gray-500">הושלמו</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{report.learning.avgProgress}%</div>
                    <div className="text-xs text-gray-500">התקדמות ממוצעת</div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {report.learning.topLearning.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-l from-purple-500 to-indigo-500 rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-purple-600 flex-shrink-0">{item.progress}%</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{item.stepsCompleted}/{item.stepsTotal} שלבים</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}