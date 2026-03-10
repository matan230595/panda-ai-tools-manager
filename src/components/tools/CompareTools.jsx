import React, { useState } from 'react';
import { X, Star, Check, Minus, ExternalLink, DollarSign, Sparkles, Loader2, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CompareTools({ tools, onClose, isMobile = false }) {
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  const getColorForValue = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!tools || tools.length === 0) return null;

  const compareRows = [
    { key: 'category', label: 'קטגוריה', render: (t) => t.category?.replace(/_/g, ' ') || '-' },
    { key: 'pricing', label: 'תמחור', icon: DollarSign, render: (t) => t.pricing || '-' },
    { key: 'price', label: 'מחיר חודשי', icon: DollarSign, render: (t) => t.priceILS ? `₪${t.priceILS}` : (t.priceUSD ? `$${t.priceUSD}` : 'חינם') },
    { key: 'rating', label: 'דירוג', icon: Star, render: (t) => t.rating ? `${t.rating} ⭐` : 'ללא דירוג' },
    { key: 'targetAudience', label: 'קהל יעד', icon: Users, render: (t) => t.targetAudience || '-' },
    { key: 'platforms', label: 'פלטפורמות', icon: Globe, render: (t) => t.platforms?.length ? t.platforms.join(', ') : '-' },
    { key: 'features', label: 'תכונות', render: (t) => t.features?.length || 0 },
    { key: 'prosAndCons', label: 'יתרונות/חסרונות', render: (t) => {
      const pros = t.prosAndCons?.pros?.length || 0;
      const cons = t.prosAndCons?.cons?.length || 0;
      return `${pros}/${cons}`;
    }},
    { key: 'tags', label: 'תגיות', render: (t) => t.tags?.length || 0 },
  ];

  const handleGenerateRecommendation = async () => {
    setLoadingRecommendation(true);
    try {
      const toolsInfo = tools.map(t => ({
        name: t.name,
        pricing: t.pricing,
        priceUSD: t.priceUSD,
        priceILS: t.priceILS,
        features: t.features?.slice(0, 5),
        rating: t.rating,
        pros: t.prosAndCons?.pros?.slice(0, 3),
        cons: t.prosAndCons?.cons?.slice(0, 3),
        targetAudience: t.targetAudience,
        platforms: t.platforms,
        description: t.description
      }));

      const prompt = `אתה יועץ AI מומחה בבחירת כלים. השווה את הכלים הבאים לצורך קבלת החלטה מושכלת:
${JSON.stringify(toolsInfo, null, 2)}

נתח את הכלים לפי מחיר, תכונות, קהל יעד, פלטפורמות, יתרונות וחסרונות, וספק:
1. הכלי הכי מאוזן לרוב המשתמשים
2. הכלי הכי משתלם מבחינת מחיר
3. הכלי הכי חזק מבחינת יכולות
4. סיכום קצר וברור על ההבדלים המרכזיים

תשובה בעברית תקנית.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            bestOverall: { type: 'string' },
            bestForPowerUsers: { type: 'string' },
            bestBudget: { type: 'string' },
            summary: { type: 'string' }
          }
        }
      });

      setAiRecommendation(response);
      toast.success('המלצת AI נוצרה בהצלחה! 🎯');
    } catch (error) {
      console.error('שגיאה:', error);
      toast.error('שגיאה בהנדסת ההמלצה');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const ComparisonContent = () => (
    <ScrollArea className="h-auto md:h-[calc(90vh-8rem)]">
      <div className="p-3 md:p-6">
        {/* AI Bottom Line Recommendation */}
        {aiRecommendation && (
          <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-bold text-base md:text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              המלצת AI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="glass-effect rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🏆 הטוב ביותר בכללי</p>
                <p className="text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-400">{aiRecommendation.bestOverall}</p>
              </div>
              <div className="glass-effect rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⚡ לכוח משתמשים</p>
                <p className="text-sm md:text-base font-bold text-purple-600 dark:text-purple-400">{aiRecommendation.bestForPowerUsers}</p>
              </div>
              <div className="glass-effect rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💰 תקציב חכם</p>
                <p className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">{aiRecommendation.bestBudget}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{aiRecommendation.summary}</p>
            </div>
          </div>
        )}

        {!aiRecommendation && (
          <div className="mb-6 flex justify-center">
            <Button
              onClick={handleGenerateRecommendation}
              disabled={loadingRecommendation}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {loadingRecommendation ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מייצר המלצה...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  צור סיכום AI
                </>
              )}
            </Button>
          </div>
        )}

        {/* Desktop Grid */}
        <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `180px repeat(${tools.length}, 1fr)` }}>
          {/* Header Row */}
          <div className="font-bold text-gray-600 dark:text-gray-400"></div>
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-xl p-4 text-center">
              {tool.logo ? (
                <img src={tool.logo} alt={tool.name} className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-lg mb-2 object-cover" />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm md:text-xl">{tool.name.charAt(0)}</span>
                </div>
              )}
              <h3 className="font-bold text-base md:text-lg mb-1">{tool.name}</h3>
              {tool.isFavorite && <Star className="w-4 md:w-5 h-4 md:h-5 fill-yellow-400 text-yellow-400 mx-auto" />}
            </div>
          ))}

          {/* Description */}
          <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center">תיאור</div>
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 md:line-clamp-3">
                {tool.description || 'אין תיאור'}
              </p>
            </div>
          ))}

          {/* Comparison Rows */}
          {compareRows.map((row) => (
            <React.Fragment key={row.key}>
              <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {row.icon && <row.icon className="w-3 md:w-4 h-3 md:h-4" />}
                {row.label}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4 flex items-center justify-center">
                  <span className="text-xs md:text-sm font-medium">{row.render(tool)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Features Detail */}
          <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300">תכונות עיקריות</div>
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
              {tool.features?.length > 0 ? (
                <ul className="space-y-0.5 md:space-y-1">
                  {tool.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-1 md:gap-2">
                      <Check className="w-2 md:w-3 h-2 md:h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center">
                  <Minus className="w-3 h-3 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300">יתרונות</div>
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
              {tool.prosAndCons?.pros?.length > 0 ? (
                <ul className="space-y-0.5">
                  {tool.prosAndCons.pros.slice(0, 4).map((pro, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-1">
                      <Check className="w-2 h-2 text-green-500 flex-shrink-0 mt-1" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Minus className="w-3 h-3 text-gray-400" />
              )}
            </div>
          ))}

          <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300">חסרונות</div>
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
              {tool.prosAndCons?.cons?.length > 0 ? (
                <ul className="space-y-0.5">
                  {tool.prosAndCons.cons.slice(0, 4).map((con, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-1">
                      <Minus className="w-2 h-2 text-red-500 flex-shrink-0 mt-1" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Minus className="w-3 h-3 text-gray-400" />
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300">פעולות</div>
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs md:text-sm"
                onClick={() => window.open(tool.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 ml-1 md:w-4 md:h-4 md:ml-2" />
                בקר
              </Button>
            </div>
          ))}
        </div>

        {/* Mobile Stack View */}
        <div className="md:hidden space-y-4 px-1 py-4">
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-3 md:p-4 space-y-3">
              <div className="flex items-start gap-3">
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{tool.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm break-words">{tool.name}</h3>
                  {tool.isFavorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline ml-1" />}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tool.description}</p>
              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">תמחור:</span>
                  <span className="font-medium">{tool.pricing}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">מחיר:</span>
                  <span className="font-medium">{tool.priceILS ? `₪${tool.priceILS}` : (tool.priceUSD ? `$${tool.priceUSD}` : 'חינם')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">דירוג:</span>
                  <span className="font-medium">{tool.rating ? `${tool.rating} ⭐` : 'ללא'}</span>
                </div>
              </div>
              <div className="space-y-1 border-t pt-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">תכונות</div>
                {(tool.features || []).slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">• {feature}</div>
                ))}
              </div>
              <div className="space-y-1 border-t pt-2">
                <div className="text-xs font-semibold text-green-700">יתרונות</div>
                {(tool.prosAndCons?.pros || []).slice(0, 2).map((pro, idx) => (
                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">• {pro}</div>
                ))}
              </div>
              <div className="space-y-1 border-t pt-2">
                <div className="text-xs font-semibold text-red-700">חסרונות</div>
                {(tool.prosAndCons?.cons || []).slice(0, 2).map((con, idx) => (
                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">• {con}</div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => window.open(tool.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 ml-1" />
                בקר באתר
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>השוואת כלים</DrawerTitle>
            <DrawerClose>✕</DrawerClose>
          </DrawerHeader>
          <ComparisonContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b">
          <DialogTitle className="text-lg md:text-2xl font-bold">השוואת כלים</DialogTitle>
        </DialogHeader>
        <ComparisonContent />
        <div className="p-3 md:p-4 border-t flex justify-end gap-2">
          <Button onClick={onClose} variant="outline" size="sm">סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}