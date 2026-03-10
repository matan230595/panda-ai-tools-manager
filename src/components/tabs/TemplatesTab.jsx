import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Download, Check, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'marketing',
    name: 'חבילת שיווק דיגיטלי',
    description: 'כלים חיוניים לשיווק ומדיה חברתית',
    tools: [
      { name: 'ChatGPT', url: 'https://chat.openai.com', category: 'עיבוד_שפה', pricing: 'פרימיום', priceUSD: 20, description: 'יצירת תוכן שיווקי, פוסטים, כתבות' },
      { name: 'Canva', url: 'https://canva.com', category: 'עיצוב', pricing: 'פרימיום', priceUSD: 12.99, description: 'עיצוב גרפי ומדיה חברתית' },
      { name: 'Jasper AI', url: 'https://jasper.ai', category: 'כתיבה', pricing: 'פרימיום', priceUSD: 39, description: 'כתיבת תוכן שיווקי AI' },
      { name: 'Buffer', url: 'https://buffer.com', category: 'שיווק', pricing: 'פרימיום', priceUSD: 15, description: 'ניהול מדיה חברתית' }
    ],
    totalPrice: 86.99,
    color: 'from-pink-500 to-rose-500',
    icon: '📱'
  },
  {
    id: 'design',
    name: 'חבילת מעצבים',
    description: 'כלי עיצוב ויצירה ויזואלית',
    tools: [
      { name: 'Midjourney', url: 'https://midjourney.com', category: 'יצירת_תמונות', pricing: 'פרימיום', priceUSD: 30, description: 'יצירת תמונות AI מתקדמת' },
      { name: 'Figma', url: 'https://figma.com', category: 'עיצוב', pricing: 'פרימיום', priceUSD: 12, description: 'עיצוב UI/UX ופרוטוטייפים' },
      { name: 'Adobe Firefly', url: 'https://firefly.adobe.com', category: 'יצירת_תמונות', pricing: 'פרימיום', priceUSD: 9.99, description: 'עריכת תמונות ויצירה AI' },
      { name: 'Runway', url: 'https://runwayml.com', category: 'וידאו', pricing: 'פרימיום', priceUSD: 35, description: 'עריכת וידאו AI' }
    ],
    totalPrice: 86.99,
    color: 'from-purple-500 to-indigo-500',
    icon: '🎨'
  },
  {
    id: 'developers',
    name: 'חבילת מפתחים',
    description: 'כלים לתכנות ופיתוח',
    tools: [
      { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', category: 'קוד', pricing: 'פרימיום', priceUSD: 10, description: 'עוזר תכנות AI' },
      { name: 'Cursor', url: 'https://cursor.sh', category: 'קוד', pricing: 'פרימיום', priceUSD: 20, description: 'IDE עם AI מובנה' },
      { name: 'Perplexity Pro', url: 'https://perplexity.ai', category: 'מחקר', pricing: 'פרימיום', priceUSD: 20, description: 'חיפוש ומחקר מתקדם' },
      { name: 'Claude Pro', url: 'https://claude.ai', category: 'עיבוד_שפה', pricing: 'פרימיום', priceUSD: 20, description: 'מודל שפה מתקדם לקוד' }
    ],
    totalPrice: 70,
    color: 'from-green-500 to-emerald-500',
    icon: '💻'
  },
  {
    id: 'content',
    name: 'חבילת יוצרי תוכן',
    description: 'כלים לכתיבה ויצירת תוכן',
    tools: [
      { name: 'Grammarly', url: 'https://grammarly.com', category: 'כתיבה', pricing: 'פרימיום', priceUSD: 12, description: 'בדיקת דקדוק ושיפור כתיבה' },
      { name: 'Copy.ai', url: 'https://copy.ai', category: 'כתיבה', pricing: 'פרימיום', priceUSD: 36, description: 'יצירת תוכן שיווקי' },
      { name: 'Descript', url: 'https://descript.com', category: 'אודיו', pricing: 'פרימיום', priceUSD: 24, description: 'עריכת אודיו ווידאו' },
      { name: 'Notion AI', url: 'https://notion.so', category: 'פרודוקטיביות', pricing: 'פרימיום', priceUSD: 10, description: 'ניהול ידע וכתיבה' }
    ],
    totalPrice: 82,
    color: 'from-orange-500 to-amber-500',
    icon: '✍️'
  },
  {
    id: 'starter',
    name: 'חבילת התחלה (חינם)',
    description: 'כלים חינמיים למתחילים',
    tools: [
      { name: 'ChatGPT Free', url: 'https://chat.openai.com', category: 'עיבוד_שפה', pricing: 'חינם', priceUSD: 0, description: 'מודל שפה בסיסי' },
      { name: 'Canva Free', url: 'https://canva.com', category: 'עיצוב', pricing: 'חינם', priceUSD: 0, description: 'עיצוב גרפי בסיסי' },
      { name: 'Gemini', url: 'https://gemini.google.com', category: 'עיבוד_שפה', pricing: 'חינם', priceUSD: 0, description: 'מודל שפה של Google' },
      { name: 'Microsoft Designer', url: 'https://designer.microsoft.com', category: 'עיצוב', pricing: 'חינם', priceUSD: 0, description: 'עיצוב גרפי חינמי' }
    ],
    totalPrice: 0,
    color: 'from-blue-500 to-cyan-500',
    icon: '🎁'
  }
];

/**
 * מודול תבניות - סטים מוכנים של כלים לייבוא במהלך
 * אופציונלי: ניתן להוסיף תבניות משלך או להסתיר אם לא נחוץ
 * 
 * תכונות:
 * - 5 תבניות מוכנות (שיווק, עיצוב, מפתחים, יוצרי תוכן, התחלה)
 * - ייבוא מקבילי של כלים
 * - זיהוי מחיר סה"כ
 */

export default function TemplatesTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AiTool.create(data),
    onSuccess: () => queryClient.invalidateQueries(['tools'])
  });

  const handleImportTemplate = async (template) => {
    setImporting(template.id);
    try {
      let successCount = 0;
      for (const tool of template.tools) {
        // המרת USD ל-ILS
        const priceILS = Math.round(tool.priceUSD * 3.7);
        
        await createMutation.mutateAsync({
          ...tool,
          priceILS,
          rating: 4.5,
          popularity: 4,
          subscriptionType: tool.pricing === 'חינם' ? 'חינמי' : 'פרימיום',
          aiGenerated: true,
          features: [],
          tags: [template.name.split(' ')[1]]
        });
        successCount++;
      }
      
      toast.success(`✅ ${successCount} כלים יובאו בהצלחה!`);
    } catch (error) {
      toast.error('שגיאה בייבוא התבנית');
    } finally {
      setImporting(null);
    }
  };

  const filteredTemplates = TEMPLATES.filter(t =>
    t.name.includes(searchTerm) || t.description.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          תבניות מוכנות
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ייבא סטים שלמים של כלים בלחיצה אחת
        </p>
      </div>

      {/* חיפוש */}
      <div className="flex gap-4">
        <Input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="חפש תבנית..."
          className="flex-1"
        />
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              תבניות זמינות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {TEMPLATES.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              סה"כ כלים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {TEMPLATES.reduce((sum, t) => sum + t.tools.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              פופולרי ביותר
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TEMPLATES[0].icon}</span>
              <span className="font-semibold">{TEMPLATES[0].name.split(' ')[1]}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* רשימת תבניות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${template.color}`} />
            
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-2xl`}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.totalPrice > 0 ? (
                    <Badge className="mt-1">${template.totalPrice}/חודש</Badge>
                  ) : (
                    <Badge className="mt-1 bg-green-100 text-green-800">חינם</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  כולל {template.tools.length} כלים:
                </div>
                <ul className="space-y-1">
                  {template.tools.map((tool, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="truncate">{tool.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleImportTemplate(template)}
                disabled={importing === template.id}
                className={`w-full bg-gradient-to-r ${template.color}`}
              >
                {importing === template.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    מייבא...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 ml-2" />
                    ייבא תבנית
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}