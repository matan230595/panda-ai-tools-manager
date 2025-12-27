import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, DollarSign, Target, Calendar, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function InsightsTab() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState(null);

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const toolsSummary = tools.map(t => ({
        name: t.name,
        category: t.category,
        pricing: t.pricing,
        rating: t.rating,
        popularity: t.popularity,
        features: t.features?.length || 0,
        hasSubscription: t.hasSubscription
      }));

      const prompt = `
אתה מומחה לניתוח כלי AI ואסטרטגיה דיגיטלית. נתח את רשימת הכלים הבאה וספק תובנות מקצועיות:

📊 **נתוני כלים:**
${JSON.stringify(toolsSummary, null, 2)}

📋 **ספק ניתוח מקיף בעברית בפורמט JSON:**

{
  "overview": {
    "totalTools": מספר,
    "activeSubscriptions": מספר,
    "monthlySpending": הערכת הוצאה חודשית,
    "topCategory": קטגוריה פופולרית ביותר
  },
  "recommendations": [
    {
      "title": "כותרת המלצה",
      "description": "תיאור מפורט",
      "priority": "גבוהה/בינונית/נמוכה",
      "potentialSavings": "סכום חיסכון פוטנציאלי"
    }
  ],
  "trends": {
    "strengths": ["נקודת חוזק 1", "נקודת חוזק 2"],
    "gaps": ["פער 1", "פער 2"],
    "opportunities": ["הזדמנות 1", "הזדמנות 2"]
  },
  "categoryAnalysis": [
    {
      "category": "שם קטגוריה",
      "toolCount": מספר,
      "insight": "תובנה על הקטגוריה"
    }
  ],
  "costOptimization": {
    "potentialSavings": סכום,
    "suggestions": ["הצעה 1", "הצעה 2"]
  }
}

**חשוב:** ניתוח עמוק, ממוקד ומעשי עם המלצות קונקרטיות.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                totalTools: { type: 'number' },
                activeSubscriptions: { type: 'number' },
                monthlySpending: { type: 'number' },
                topCategory: { type: 'string' }
              }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string' },
                  potentialSavings: { type: 'string' }
                }
              }
            },
            trends: {
              type: 'object',
              properties: {
                strengths: { type: 'array', items: { type: 'string' } },
                gaps: { type: 'array', items: { type: 'string' } },
                opportunities: { type: 'array', items: { type: 'string' } }
              }
            },
            categoryAnalysis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  toolCount: { type: 'number' },
                  insight: { type: 'string' }
                }
              }
            },
            costOptimization: {
              type: 'object',
              properties: {
                potentialSavings: { type: 'number' },
                suggestions: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });

      setInsights(response);
      toast.success('הניתוח הושלם בהצלחה! 🎉');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('שגיאה בייצור תובנות. ודא שמפתח API מוגדר.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportInsights = () => {
    const dataStr = JSON.stringify(insights, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-insights-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('הניתוח יוצא בהצלחה! 📥');
  };

  const priorityColors = {
    'גבוהה': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'בינונית': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    'נמוכה': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            תובנות וניתוח AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            קבל המלצות מותאמות אישית על סמך הכלים שלך
          </p>
        </div>
        <div className="flex gap-2">
          {insights && (
            <Button variant="outline" onClick={exportInsights}>
              <Download className="w-4 h-4 ml-2" />
              ייצא דוח
            </Button>
          )}
          <Button
            onClick={generateInsights}
            disabled={isGenerating || tools.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                מנתח...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 ml-2" />
                צור ניתוח חכם
              </>
            )}
          </Button>
        </div>
      </div>

      {!insights ? (
        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">צור ניתוח חכם</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
              קבל תובנות מקצועיות, המלצות לחיסכון, וניתוח מעמיק של הכלים שלך באמצעות AI
            </p>
            <Button
              onClick={generateInsights}
              disabled={tools.length === 0}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              התחל ניתוח
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="recommendations">המלצות</TabsTrigger>
            <TabsTrigger value="trends">מגמות</TabsTrigger>
            <TabsTrigger value="optimization">אופטימיזציה</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    סה"כ כלים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{insights.overview.totalTools}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    מנויים פעילים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {insights.overview.activeSubscriptions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    הוצאה חודשית
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ₪{insights.overview.monthlySpending}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    קטגוריה מובילה
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{insights.overview.topCategory}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ניתוח לפי קטגוריות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.categoryAnalysis.map((cat, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{cat.category}</h4>
                        <span className="text-sm text-gray-500">{cat.toolCount} כלים</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{cat.insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 mt-6">
            {insights.recommendations.map((rec, idx) => (
              <Card key={idx} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      {rec.potentialSavings && (
                        <CardDescription className="text-green-600 font-semibold mt-1">
                          💰 חיסכון פוטנציאלי: {rec.potentialSavings}
                        </CardDescription>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{rec.description}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-t-4 border-t-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    ✓ נקודות חוזק
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.trends.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-sm">{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    ⚠ פערים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.trends.gaps.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="text-sm">{g}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    🚀 הזדמנויות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.trends.opportunities.map((o, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-sm">{o}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4 mt-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-300 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  חיסכון פוטנציאלי
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-green-600">
                    ₪{insights.costOptimization.potentialSavings}
                  </span>
                  <span className="text-sm"> לחודש</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-3">הצעות לאופטימיזציה:</h4>
                <ul className="space-y-3">
                  {insights.costOptimization.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                      </div>
                      <span className="text-sm">{sug}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}