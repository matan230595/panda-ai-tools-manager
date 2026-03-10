import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, TrendingDown, DollarSign, Calendar, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SubscriptionManagementPanel() {
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  // כלים עם מנויים בלבד
  const subscriptionTools = tools.filter(t => t.hasSubscription);

  // כלים שלא בשימוש (מועמדים לביטול)
  const unusedTools = subscriptionTools.filter(
    t => !t.usageStats?.timesUsed || t.usageStats.timesUsed === 0
  );

  // כלים שעומדים לחדש בקרוב
  const renewalSoon = subscriptionTools.filter(t => {
    if (!t.usageStats?.lastUsedDate) return false;
    const daysUntilRenewal = 30 - Math.floor(
      (Date.now() - new Date(t.usageStats.lastUsedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
  });

  // סדר עלויות
  const costTrend = [
    { month: 'יוני', cost: 1200 },
    { month: 'יולי', cost: 1400 },
    { month: 'אוגוסט', cost: 1300 },
    { month: 'ספטמבר', cost: 1500 },
    { month: 'אוקטובר', cost: 1450 },
  ];

  const totalMonthlyCost = subscriptionTools.reduce(
    (sum, t) => sum + (t.usageStats?.totalCostPerMonth || 0),
    0
  );

  const potentialSavings = unusedTools.reduce(
    (sum, t) => sum + (t.usageStats?.totalCostPerMonth || 0),
    0
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="text-right">
        <h1 className="text-3xl font-bold gradient-text mb-2">ניהול מנויים מתקדם</h1>
        <p className="text-gray-600 dark:text-gray-400">עקוב אחרי עלויות, חדשונות וחסוך כסף</p>
      </div>

      {/* קרטיסים עליונים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">עלות חודשית כוללת</p>
              <p className="text-3xl font-bold text-blue-600">₪{totalMonthlyCost.toLocaleString('he-IL')}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">חיסכון אפשרי</p>
              <p className="text-3xl font-bold text-red-600">₪{potentialSavings.toLocaleString('he-IL')}</p>
              <p className="text-xs text-red-500 mt-1">{unusedTools.length} כלים שלא בשימוש</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">מנויים לחדש בקרוב</p>
              <p className="text-3xl font-bold text-orange-600">{renewalSoon.length}</p>
              <p className="text-xs text-orange-500 mt-1">בתוך 7 ימים</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* תרשים סדר עלויות */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4">סדר עלויות חודשיות</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* כלים עם התראות */}
      {renewalSoon.length > 0 && (
        <Card className="p-6 border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            התראות - מנויים לחדש בקרוב
          </h2>
          <div className="space-y-3">
            {renewalSoon.map((tool, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{tool.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      עלות חודשית: ₪{(tool.usageStats?.totalCostPerMonth || 0).toLocaleString('he-IL')}
                    </p>
                  </div>
                  <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full">
                    תוך 7 ימים
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* כלים שאין להם שימוש - מועמדים להסרה */}
      {unusedTools.length > 0 && (
        <Card className="p-6 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-500" />
            כלים שלא בשימוש - שקול ביטול מנוי
          </h2>
          <div className="space-y-3">
            {unusedTools.map((tool, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{tool.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      עלות חודשית: ₪{(tool.usageStats?.totalCostPerMonth || 0).toLocaleString('he-IL')}
                    </p>
                  </div>
                  <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full">
                    ביטול יחסוך: ₪{(tool.usageStats?.totalCostPerMonth || 0).toLocaleString('he-IL')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* טבלה - כל הכלים עם מנוי */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4">כל הכלים עם מנויים ({subscriptionTools.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-2 px-4 font-semibold">כלי</th>
                <th className="py-2 px-4 font-semibold">סוג מנוי</th>
                <th className="py-2 px-4 font-semibold">עלות חודשית</th>
                <th className="py-2 px-4 font-semibold">שימוש חודשי</th>
                <th className="py-2 px-4 font-semibold">ROI</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionTools.map((tool, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">{tool.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                      {tool.subscriptionType}
                    </span>
                  </td>
                  <td className="py-3 px-4">₪{(tool.usageStats?.totalCostPerMonth || 0).toLocaleString('he-IL')}</td>
                  <td className="py-3 px-4">{tool.usageStats?.timesUsed || 0} שימושים</td>
                  <td className="py-3 px-4">
                    {tool.usageStats?.timesUsed && tool.usageStats.timesUsed > 0
                      ? `₪${((tool.usageStats?.totalCostPerMonth || 0) / tool.usageStats.timesUsed).toFixed(2)}`
                      : 'אין שימוש'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}