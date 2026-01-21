import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Star, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PersonalizedRecommendations({ currentTool, onSelectTool }) {
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  // ניתוח דפוסי שימוש
  const usagePatterns = useMemo(() => {
    // קטגוריות בשימוש
    const usedCategories = {};
    tools.filter(t => t.lastUsed).forEach(tool => {
      usedCategories[tool.category] = (usedCategories[tool.category] || 0) + 1;
    });

    // קטגוריה הכי פופולרית
    const topCategory = Object.entries(usedCategories).sort((a, b) => b[1] - a[1])[0]?.[0];

    // מנויים פעילים
    const activeSubscriptionTypes = subscriptions
      .filter(s => s.isActive)
      .map(s => s.subscriptionType);

    // תגיות נפוצות
    const tagFrequency = {};
    tools.filter(t => t.isFavorite || t.lastUsed).forEach(tool => {
      tool.tags?.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    return {
      topCategory,
      usedCategories,
      activeSubscriptionTypes,
      topTags: Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => tag)
    };
  }, [tools, subscriptions]);

  // המלצות מבוססות כללים
  const ruleBasedRecommendations = useMemo(() => {
    const recommendations = [];

    // כלים דומים לנוכחי
    if (currentTool) {
      const similarTools = tools.filter(t => 
        t.id !== currentTool.id &&
        (t.category === currentTool.category ||
         t.tags?.some(tag => currentTool.tags?.includes(tag)))
      ).slice(0, 3);

      if (similarTools.length > 0) {
        recommendations.push({
          type: 'similar',
          title: 'כלים דומים',
          tools: similarTools,
          reason: `בהתבסס על ${currentTool.name}`,
          icon: '🔄'
        });
      }
    }

    // כלים משלימים לקטגוריה העיקרית
    if (usagePatterns.topCategory) {
      const complementaryTools = tools.filter(t => 
        t.category === usagePatterns.topCategory &&
        !t.hasSubscription &&
        t.rating >= 4
      ).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 3);

      if (complementaryTools.length > 0) {
        recommendations.push({
          type: 'complementary',
          title: 'כלים משלימים',
          tools: complementaryTools,
          reason: `מתאימים לקטגוריית ${usagePatterns.topCategory}`,
          icon: '🎯'
        });
      }
    }

    // כלים מתקדמים בקטגוריות בשימוש
    const advancedTools = tools.filter(t =>
      Object.keys(usagePatterns.usedCategories).includes(t.category) &&
      t.subscriptionType === 'פרימיום' &&
      !t.hasSubscription &&
      t.rating >= 4.5
    ).slice(0, 3);

    if (advancedTools.length > 0) {
      recommendations.push({
        type: 'advanced',
        title: 'כלים מתקדמים',
        tools: advancedTools,
        reason: 'שדרוג לגרסאות פרימיום',
        icon: '⚡'
      });
    }

    // פופולריים שעדיין לא מכירים
    const trendingTools = tools.filter(t =>
      t.popularity >= 4 &&
      !t.hasSubscription &&
      !t.isFavorite
    ).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 3);

    if (trendingTools.length > 0) {
      recommendations.push({
        type: 'trending',
        title: 'פופולריים עכשיו',
        tools: trendingTools,
        reason: 'כלים שאחרים אוהבים',
        icon: '🔥'
      });
    }

    return recommendations;
  }, [tools, usagePatterns, currentTool]);

  // יצירת המלצות AI
  const generateAIRecommendations = async () => {
    setGeneratingAI(true);
    try {
      const userProfile = {
        totalTools: tools.length,
        favoriteTools: tools.filter(t => t.isFavorite).length,
        topCategory: usagePatterns.topCategory,
        subscriptionTypes: usagePatterns.activeSubscriptionTypes,
        topTags: usagePatterns.topTags
      };

      const toolsList = tools.map(t => ({
        name: t.name,
        category: t.category,
        rating: t.rating,
        hasSubscription: t.hasSubscription,
        isFavorite: t.isFavorite
      }));

      const prompt = `בהתבסס על פרופיל המשתמש והכלים הקיימים, המלץ על 3-5 כלי AI חדשים:

פרופיל משתמש:
${JSON.stringify(userProfile, null, 2)}

כלים קיימים (דוגמה):
${JSON.stringify(toolsList.slice(0, 10), null, 2)}

תן המלצות ספציפיות עם הסבר מפורט למה כל כלי מתאים למשתמש זה.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  toolName: { type: 'string' },
                  reason: { type: 'string' },
                  matchScore: { type: 'number' },
                  benefits: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setAiRecommendations(response.recommendations);
      toast.success('המלצות AI נוצרו! 🤖');
    } catch (error) {
      toast.error('שגיאה ביצירת המלצות');
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            המלצות מותאמות אישית
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            כלים שעשויים להתאים לך בהתבסס על השימוש שלך
          </p>
        </div>
        <Button
          onClick={generateAIRecommendations}
          disabled={generatingAI}
          className="bg-gradient-to-r from-purple-500 to-pink-600"
        >
          {generatingAI ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
              מנתח...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 ml-2" />
              המלצות AI חכמות
            </>
          )}
        </Button>
      </div>

      {/* המלצות AI */}
      {aiRecommendations && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              המלצות AI מותאמות במיוחד
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-lg">{rec.toolName}</div>
                  <Badge className="bg-purple-100 text-purple-800">
                    התאמה: {rec.matchScore}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{rec.reason}</p>
                {rec.benefits && (
                  <ul className="space-y-1">
                    {rec.benefits.map((benefit, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* המלצות מבוססות כללים */}
      {ruleBasedRecommendations.map((section, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{section.icon}</span>
              {section.title}
            </CardTitle>
            <CardDescription>{section.reason}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {section.tools.map(tool => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onSelectTool?.(tool)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {tool.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.description?.slice(0, 50)}...</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.rating && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {tool.rating}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      צפה
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* תובנות שימוש */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            דפוסי השימוש שלך
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">קטגוריה מועדפת</div>
              <div className="text-lg font-bold text-blue-600">{usagePatterns.topCategory || 'לא זוהה'}</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">מנויים פעילים</div>
              <div className="text-lg font-bold text-green-600">{subscriptions.filter(s => s.isActive).length}</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">תגיות נפוצות</div>
              <div className="text-xs mt-1 flex flex-wrap gap-1">
                {usagePatterns.topTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}