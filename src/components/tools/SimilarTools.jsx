import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, Loader2, ExternalLink, Globe, ArrowLeft, Star, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ToolLogo from '@/components/ToolLogo';
import { createDefaultToolTasks } from '@/lib/defaultToolTasks';

export default function SimilarTools({ currentTool, onSelectTool }) {
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [isAddingTool, setIsAddingTool] = useState(null);
  const [addedTools, setAddedTools] = useState([]);
  const [similarTools, setSimilarTools] = useState([]);
  const [externalTools, setExternalTools] = useState([]);
  const resultsRef = useRef(null);

  const { data: allTools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  // גלילה אוטומטית לתוצאות ברגע שהן מופיעות
  useEffect(() => {
    if ((similarTools.length > 0 || externalTools.length > 0) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [similarTools, externalTools]);

  const findSimilarTools = async () => {
    setIsSearching(true);
    try {
      const candidateTools = allTools
        .filter(t => t.id !== currentTool.id)
        .filter(t =>
          t.category === currentTool.category ||
          t.tags?.some(tag => currentTool.tags?.includes(tag)) ||
          t.pricing === currentTool.pricing
        );

      if (candidateTools.length === 0) {
        setSimilarTools([]);
        toast.info('לא נמצאו כלים דומים אצלך — נסה לחפש כלים חדשים מחוץ למערכת');
        return;
      }

      const prompt = `
אתה מומחה לכלי AI. יש לי את הכלי הבא:

**כלי נוכחי:**
- שם: ${currentTool.name}
- קטגוריה: ${currentTool.category}
- תיאור: ${currentTool.description}
- תכונות: ${currentTool.features?.join(', ') || 'אין'}
- תגיות: ${currentTool.tags?.join(', ') || 'אין'}
- תמחור: ${currentTool.pricing}

**כלים מועמדים:**
${candidateTools.slice(0, 10).map((t, i) => `
${i + 1}. ${t.name}
   - קטגוריה: ${t.category}
   - תיאור: ${t.description || 'אין'}
   - תמחור: ${t.pricing}
   - דירוג: ${t.rating || 'אין'}
   - תגיות: ${t.tags?.join(', ') || 'אין'}
`).join('\n')}

מצא את 3-5 הכלים הכי דומים לכלי הנוכחי. החזר JSON עם המלצות:

{
  "recommendations": [
    {
      "toolName": "שם הכלי",
      "similarityScore": מספר בין 0-100,
      "reason": "סיבה קצרה למה הכלי דומה"
    }
  ]
}
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  toolName: { type: 'string' },
                  similarityScore: { type: 'number' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const recommended = (response.recommendations || []).map(rec => {
        const tool = allTools.find(t => t.name === rec.toolName);
        return tool ? { ...tool, similarityScore: rec.similarityScore, reason: rec.reason } : null;
      }).filter(Boolean);

      setSimilarTools(recommended);
      if (recommended.length > 0) {
        toast.success(`נמצאו ${recommended.length} כלים דומים! 🎯`);
      } else {
        toast.info('לא נמצאו כלים דומים מספיק אצלך');
      }
    } catch (error) {
      console.error('Error finding similar tools:', error);
      toast.error('שגיאה בחיפוש כלים דומים');
    } finally {
      setIsSearching(false);
    }
  };

  const findExternalSimilarTools = async () => {
    setIsSearchingExternal(true);
    try {
      const existingNames = allTools.map((tool) => tool.name).join(', ');
      const prompt = `מצא 5 כלי AI דומים לכלי הבא, אבל חשוב מאוד להחזיר רק כלים שלא קיימים כבר במערכת של המשתמש.

כלי קיים:
- שם: ${currentTool.name}
- קטגוריה: ${currentTool.category}
- תיאור: ${currentTool.description}
- תכונות: ${(currentTool.features || []).join(', ')}
- תגיות: ${(currentTool.tags || []).join(', ')}

כלים שכבר קיימים במערכת ואסור להחזיר:
${existingNames}

החזר תשובה בפורמט JSON:
{
  "recommendations": [
    {
      "name": "שם הכלי",
      "url": "https://...",
      "description": "תיאור קצר בעברית",
      "category": "קטגוריה קצרה בעברית",
      "pricing": "חינם/בתשלום/פרימיום/פרימיום_מוגבל",
      "subscriptionType": "חינמי/פרימיום/גולד",
      "priceUSD": מספר או null,
      "priceILS": מספר או null,
      "detailedDescription": "תיאור מפורט בעברית",
      "features": ["תכונה"],
      "integrations": ["אינטגרציה"],
      "tags": ["תגית"],
      "targetAudience": "קהל יעד",
      "languagesSupported": ["עברית"],
      "platforms": ["דפדפן"],
      "useCases": [{"title": "מקרה שימוש", "description": "תיאור"}],
      "prosAndCons": {"pros": ["יתרון"], "cons": ["חיסרון"]},
      "logo": "כתובת לוגו ציבורית או מחרוזת ריקה",
      "rating": מספר בין 0 ל-5,
      "popularity": מספר שלם בין 1 ל-5,
      "reason": "למה הכלי הזה דומה ושווה לבדוק אותו"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  url: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  pricing: { type: 'string' },
                  subscriptionType: { type: 'string' },
                  priceUSD: { type: 'number' },
                  priceILS: { type: 'number' },
                  detailedDescription: { type: 'string' },
                  features: { type: 'array', items: { type: 'string' } },
                  integrations: { type: 'array', items: { type: 'string' } },
                  tags: { type: 'array', items: { type: 'string' } },
                  targetAudience: { type: 'string' },
                  languagesSupported: { type: 'array', items: { type: 'string' } },
                  platforms: { type: 'array', items: { type: 'string' } },
                  useCases: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } },
                  prosAndCons: { type: 'object', properties: { pros: { type: 'array', items: { type: 'string' } }, cons: { type: 'array', items: { type: 'string' } } } },
                  logo: { type: 'string' },
                  rating: { type: 'number' },
                  popularity: { type: 'number' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setExternalTools(response.recommendations || []);
      toast.success('נמצאו כלים דומים חדשים מחוץ למערכת');
    } catch (error) {
      console.error('Error finding external similar tools:', error);
      toast.error('שגיאה בחיפוש כלים דומים מחוץ למערכת');
    } finally {
      setIsSearchingExternal(false);
    }
  };

  const addExternalTool = async (tool) => {
    setIsAddingTool(tool.name);
    try {
      const savedTool = await base44.entities.AiTool.create({
        name: tool.name,
        url: tool.url,
        category: tool.category || currentTool.category || 'אחר',
        description: tool.description || '',
        detailedDescription: tool.detailedDescription || tool.description || '',
        features: tool.features || [],
        integrations: tool.integrations || [],
        tags: tool.tags || [],
        pricing: tool.pricing || 'חינם',
        subscriptionType: tool.subscriptionType || 'חינמי',
        priceUSD: tool.priceUSD,
        priceILS: tool.priceILS,
        targetAudience: tool.targetAudience || '',
        languagesSupported: tool.languagesSupported || [],
        platforms: tool.platforms || ['דפדפן'],
        useCases: tool.useCases || [],
        prosAndCons: tool.prosAndCons,
        logo: tool.logo || '',
        rating: tool.rating || 0,
        popularity: tool.popularity || 0,
        aiGenerated: true,
      });
      await createDefaultToolTasks(savedTool);
      setAddedTools((current) => [...current, tool.name]);
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['toolTasks'] });
      toast.success(`${savedTool.name} נוסף עם 5 משימות עבודה מוכנות`);
    } catch {
      toast.error('לא ניתן היה להוסיף את הכלי');
    } finally {
      setIsAddingTool(null);
    }
  };

  const hasResults = similarTools.length > 0 || externalTools.length > 0;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={findSimilarTools}
          disabled={isSearching}
          className="bg-gradient-to-l from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/20 flex-1"
          size="lg"
        >
          {isSearching ? (
            <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> מחפש במערכת...</>
          ) : (
            <><Sparkles className="w-5 h-5 ml-2" /> מצא כלים דומים אצלי</>
          )}
        </Button>

        <Button
          onClick={findExternalSimilarTools}
          disabled={isSearchingExternal}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          {isSearchingExternal ? (
            <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> מחפש ברשת...</>
          ) : (
            <><Globe className="w-5 h-5 ml-2" /> מצא כלים דומים שאין לי</>
          )}
        </Button>
      </div>

      {!hasResults && (
        <p className="text-sm text-gray-500 text-center">
          אפשר לחפש גם כלים דומים שכבר שמורים אצלך וגם כלים חדשים מחוץ למערכת.
        </p>
      )}

      <div ref={resultsRef} className="scroll-mt-4 space-y-6">
        {similarTools.length > 0 && (
          <div className="space-y-3 animate-slide-in">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-base text-gray-800 dark:text-gray-100">
                כלים דומים שכבר קיימים אצלך
                <span className="mr-2 text-sm font-normal text-gray-500">({similarTools.length})</span>
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {similarTools.map((tool, idx) => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool?.(tool)}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="group text-right rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 animate-slide-in overflow-hidden"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <ToolLogo tool={tool} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{tool.name}</div>
                      <div className="text-xs text-gray-500 truncate">{tool.category?.replace(/_/g, ' ')}</div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0 flex-shrink-0">
                      {tool.similarityScore}% דומה
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-6 mb-3">{tool.reason}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{tool.pricing?.replace(/_/g, ' ')}</Badge>
                      {tool.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      פתח כלי <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {externalTools.length > 0 && (
          <div className="space-y-3 animate-slide-in">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold text-base text-gray-800 dark:text-gray-100">
                כלים דומים חדשים שלא קיימים עדיין אצלך
                <span className="mr-2 text-sm font-normal text-gray-500">({externalTools.length})</span>
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {externalTools.map((tool, index) => (
                <div
                  key={`${tool.name}-${index}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 animate-slide-in text-right"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{tool.name}</div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{tool.description}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0 flex-shrink-0">חדש</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-6 mb-3">{tool.reason}</p>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Badge variant="outline" className="text-xs">{tool.pricing?.replace(/_/g, ' ')}</Badge>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(tool.url, '_blank', 'noopener,noreferrer')}>
                        <ExternalLink className="w-4 h-4 ml-2" />
                        פתח אתר
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addExternalTool(tool)}
                        disabled={isAddingTool === tool.name || addedTools.includes(tool.name)}
                        aria-label={`הוסף את ${tool.name} למאגר`}
                      >
                        {addedTools.includes(tool.name) ? <Check className="w-4 h-4 ml-2" /> : isAddingTool === tool.name ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                        {addedTools.includes(tool.name) ? 'נוסף' : 'הוסף למאגר'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}