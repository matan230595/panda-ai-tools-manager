import React, { useMemo } from 'react';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UpcomingRenewalsPanel({ subscriptions = [], tools = [], limit = 5 }) {
  const upcomingRenewals = useMemo(() => {
    return subscriptions
      .filter((item) => item.isActive && item.renewalDate)
      .map((item) => {
        const tool = tools.find((toolItem) => toolItem.id === item.toolId);
        const daysLeft = Math.ceil((new Date(item.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
        return {
          ...item,
          daysLeft,
          category: tool?.category || 'אחר',
        };
      })
      .filter((item) => item.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, limit);
  }, [subscriptions, tools, limit]);

  if (upcomingRenewals.length === 0) return null;

  return (
    <Card className="p-5 md:p-6 border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-bold">מנויים שמתקרבים לחידוש</h2>
      </div>
      <div className="space-y-3">
        {upcomingRenewals.map((subscription) => (
          <div key={subscription.id} className="rounded-2xl border border-orange-200/70 dark:border-orange-900 px-4 py-3 bg-white/80 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="font-semibold">{subscription.toolName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-3 mt-1">
                  <span>₪{Number(subscription.priceMonthly || 0).toFixed(0)} לחודש</span>
                  <span>{new Date(subscription.renewalDate).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{subscription.category.replace(/_/g, ' ')}</Badge>
                <Badge className={subscription.daysLeft <= 7 ? 'bg-red-600' : 'bg-orange-500'}>
                  <CalendarClock className="w-3 h-3 ml-1" />
                  {subscription.daysLeft >= 0 ? `${subscription.daysLeft} ימים` : 'עבר מועד'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}