import React, { useMemo } from 'react';
import { TrendingDown, Sparkles, AlertTriangle, Clock, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * פאנל אופטימיזציית עלויות חכמה:
 * מזהה כלים בתשלום שלא נעשה בהם שימוש לאחרונה ומחשב חיסכון פוטנציאלי.
 * עיצוב + חישוב תצוגתי בלבד; פעולות מנוי מנותבות החוצה דרך onManageTool.
 */
const STALE_DAYS = 45;

function monthlyCost(tool) {
  return tool.priceILS || tool.usageStats?.totalCostPerMonth || (tool.priceUSD ? tool.priceUSD * 3.7 : 0) || 0;
}

function lastUsedDate(tool) {
  return tool.usageStats?.lastUsedDate || tool.lastUsed || null;
}

export default function CostOptimizationPanel({ tools = [], onManageTool }) {
  const { candidates, totalSavings } = useMemo(() => {
    const now = Date.now();
    const paid = tools.filter((t) => (t.pricing === 'בתשלום' || t.hasSubscription || monthlyCost(t) > 0));

    const candidates = paid
      .map((t) => {
        const cost = monthlyCost(t);
        const last = lastUsedDate(t);
        const daysSince = last ? Math.floor((now - new Date(last).getTime()) / (1000 * 60 * 60 * 24)) : null;
        const timesUsed = t.usageStats?.timesUsed || 0;
        const isStale = (daysSince === null && timesUsed === 0) || (daysSince !== null && daysSince >= STALE_DAYS);
        return { tool: t, cost, daysSince, timesUsed, isStale };
      })
      .filter((c) => c.isStale && c.cost > 0)
      .sort((a, b) => b.cost - a.cost);

    const totalSavings = candidates.reduce((sum, c) => sum + c.cost, 0);
    return { candidates, totalSavings };
  }, [tools]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/20 p-5 md:p-6">
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                אופטימיזציית עלויות חכמה
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">כלים בתשלום שלא בשימוש — הזדמנות לחיסכון</p>
            </div>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-green-200 dark:border-green-900 p-4">
            <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              מצוין! כל הכלים בתשלום שלך בשימוש פעיל. אין בזבוז מיותר כרגע.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/70 dark:border-amber-900/50 p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">חיסכון חודשי פוטנציאלי</p>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  ₪{Math.round(totalSavings).toLocaleString('he-IL')}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400">בשנה</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  ₪{Math.round(totalSavings * 12).toLocaleString('he-IL')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {candidates.slice(0, 5).map(({ tool, cost, daysSince, timesUsed }) => (
                <div
                  key={tool.id}
                  className="group flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{tool.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {daysSince !== null
                        ? `לא בשימוש ${daysSince} ימים`
                        : timesUsed === 0
                        ? 'אין רישום שימוש'
                        : 'שימוש נמוך'}
                    </p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">₪{Math.round(cost)}</p>
                    <p className="text-[10px] text-gray-400">לחודש</p>
                  </div>
                  {onManageTool && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 flex-shrink-0"
                      onClick={() => onManageTool(tool)}
                    >
                      בדוק
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}