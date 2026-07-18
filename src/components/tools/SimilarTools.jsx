import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, Loader2, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ToolLogo from '@/components/ToolLogo';

export default function SimilarTools({ currentTool, onSelectTool }) {
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [similarTools, setSimilarTools] = useState([]);
  const [externalTools, setExternalTools] = useState([]);

  const { data: allTools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const findSimilarTools = async () => {
    setIsSearching(true);
    try {
      // סינון ראשוני בצד הלקוח
      const candidateTools = allTools
        .filter(t => t.id !== currentTool.id)
        .filter(t => 
          t.category === currentTool.category ||
          t.tags?.some(tag => currentTool.tags?.includes(tag)) ||
          t.pricing === currentTool.pricing
        );

      // שימוש ב-AI למיון והמלצה
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

      // שיוך הכלים המומלצים מהרשימה המקורית
      const recommended = response.recommendations.map(rec => {
        const tool = allTools.find(t => t.name === rec.toolName);
        return tool ? { ...tool, similarityScore: rec.similarityScore, reason: rec.reason } : null;
      }).filter(Boolean);

      setSimilarTools(recommended);
      toast.success(`נמצאו ${recommended.length} כלים דומים! 🎯`);
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
      "pricing": "חינם/בתשלום/פרימיום",
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
                  pricing: { type: 'string' },
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-center py-2">
        <Button
          onClick={findSimilarTools}
          disabled={isSearching}
          className="bg-gradient-to-r from-purple-500 to-pink-600"
          size="lg"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              מחפש במערכת...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 ml-2" />
              מצא כלים דומים אצלי
            </>
          )}
        </Button>

        <Button
          onClick={findExternalSimilarTools}
          disabled={isSearchingExternal}
          variant="outline"
          size="lg"
        >
          {isSearchingExternal ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              מחפש ברשת...
            </>
          ) : (
            <>
              <Globe className="w-5 h-5 ml-2" />
              מצא כלים דומים שאין לי
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-gray-500 text-center">אפשר לחפש גם כלים דומים שכבר שמורים אצלך וגם כלים חדשים מחוץ למערכת.</p>

      {similarTools.length > 0 && (
        <div className="space-y-3">
          <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">כלים דומים שכבר קיימים אצלך</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarTools.map(tool => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectTool?.(tool)}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <ToolLogo tool={tool} size="sm" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <CardDescription className="text-xs">{tool.category}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tool.similarityScore}% דומה
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tool.reason}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="text-xs">{tool.pricing}</Badge>
                    {tool.rating > 0 && (
                      <span className="text-xs text-yellow-600">⭐ {tool.rating}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {externalTools.length > 0 && (
        <div className="space-y-3">
          <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">כלים דומים חדשים שלא קיימים עדיין אצלך</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {externalTools.map((tool, index) => (
              <Card key={`${tool.name}-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{tool.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">חדש</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tool.reason}</p>
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="text-xs">{tool.pricing}</Badge>
                    <Button size="sm" variant="outline" onClick={() => window.open(tool.url, '_blank')}>
                      <ExternalLink className="w-4 h-4 ml-2" />
                      פתח אתר
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {similarTools.length === 0 && externalTools.length === 0 && !isSearching && !isSearchingExternal && (
        <div className="text-center py-6 text-sm text-gray-500">עדיין לא בוצע חיפוש דמיון עבור הכלי הזה.</div>
      )}
    </div>
  );
}