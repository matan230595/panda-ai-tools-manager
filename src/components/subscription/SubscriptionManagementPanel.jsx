import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { DollarSign, Calendar, Wallet, StickyNote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SubscriptionManagementPanel() {
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by_id: user.id }, '-renewalDate');
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const data = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((item) => item.isActive);
    const totalMonthlyCost = activeSubscriptions.reduce((sum, item) => sum + Number(item.priceMonthly || 0), 0);
    const totalYearlyCost = totalMonthlyCost * 12;

    const renewalTimeline = activeSubscriptions
      .filter((item) => item.renewalDate)
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
      .map((item) => {
        const tool = tools.find((toolItem) => toolItem.id === item.toolId);
        const daysLeft = Math.ceil((new Date(item.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
        return {
          ...item,
          category: tool?.category || 'אחר',
          daysLeft,
        };
      });

    const monthlyRenewals = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() + index);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const monthItems = renewalTimeline.filter((item) => {
        const renewalDate = new Date(item.renewalDate);
        return `${renewalDate.getFullYear()}-${renewalDate.getMonth()}` === monthKey;
      });

      return {
        month: monthDate.toLocaleDateString('he-IL', { month: 'short' }),
        cost: monthItems.reduce((sum, item) => sum + Number(item.priceMonthly || 0), 0),
        count: monthItems.length,
      };
    });

    return {
      activeSubscriptions,
      totalMonthlyCost,
      totalYearlyCost,
      renewalTimeline,
      monthlyRenewals,
    };
  }, [subscriptions, tools]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-right">
        <h1 className="text-3xl font-bold gradient-text mb-2">ניהול מנויים מרוכז</h1>
        <p className="text-gray-600 dark:text-gray-400">כל העלויות, תאריכי הסיום וההערות שלך במקום אחד.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">עלות חודשית כוללת</p>
              <p className="text-3xl font-bold text-blue-600">₪{data.totalMonthlyCost.toLocaleString('he-IL')}</p>
            </div>
            <Wallet className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">עלות שנתית משוערת</p>
              <p className="text-3xl font-bold text-purple-600">₪{data.totalYearlyCost.toLocaleString('he-IL')}</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">מנויים פעילים</p>
              <p className="text-3xl font-bold text-orange-600">{data.activeSubscriptions.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4">מתי העלויות מתחדשות</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.monthlyRenewals} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={3} name="עלות מתחדשת" dot={{ fill: '#6366f1', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-lg font-bold">ציר זמן לחידושי מנויים</h2>
          <a href="/calendar" className="text-sm font-medium text-indigo-600 hover:underline">פתח גם בלוח השנה</a>
        </div>

        {data.renewalTimeline.length === 0 ? (
          <div className="text-sm text-gray-500">אין עדיין מנויים עם תאריך חידוש.</div>
        ) : (
          <div className="space-y-3">
            {data.renewalTimeline.map((subscription) => (
              <div key={subscription.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/40">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-base">{subscription.toolName}</div>
                      <Badge variant="secondary">{subscription.subscriptionType}</Badge>
                      <Badge variant="outline">{subscription.category.replace(/_/g, ' ')}</Badge>
                      {subscription.autoRenewal && <Badge>חידוש אוטומטי</Badge>}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-4">
                      <span>₪{Number(subscription.priceMonthly || 0).toFixed(0)} לחודש</span>
                      <span>{new Date(subscription.renewalDate).toLocaleDateString('he-IL')}</span>
                      <span className={subscription.daysLeft <= 7 ? 'text-red-600 font-medium' : ''}>
                        {subscription.daysLeft >= 0 ? `נותרו ${subscription.daysLeft} ימים` : 'תאריך החידוש עבר'}
                      </span>
                    </div>
                    {subscription.notes && (
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3 py-2 text-sm flex gap-2 items-start">
                        <StickyNote className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                        <span>{subscription.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-44">
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full ${subscription.daysLeft <= 7 ? 'bg-red-500' : subscription.daysLeft <= 30 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(8, Math.min(100, 100 - Math.max(subscription.daysLeft, 0))) }%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}