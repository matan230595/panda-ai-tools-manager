import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MousePointerClick, Clock, Activity } from 'lucide-react';

export default function ToolUsageActivity({ tool }) {
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['toolInteractions', tool.id],
    queryFn: () =>
      base44.entities.UserToolRating
        .filter({ toolId: tool.id, interactionType: 'click' }, '-created_date', 50)
        .catch(() => []),
  });

  const count = interactions.length;
  const lastOpened = interactions[0]?.created_date;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-300">
            <MousePointerClick className="w-5 h-5" />
            <span className="text-sm font-medium">מספר פתיחות</span>
          </div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-200">
            {isLoading ? '...' : count}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-300">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">פתיחה אחרונה</span>
          </div>
          <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-200">
            {lastOpened ? new Date(lastOpened).toLocaleString('he-IL') : 'אין נתונים'}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-lg">פעילות אחרונה</h3>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500">טוען פעילות...</p>
        ) : count === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-gray-500">
            עדיין לא נרשמו פתיחות לכלי זה. כל פעם שתפתח את הכרטיס, הפתיחה תירשם כאן.
          </div>
        ) : (
          <div className="space-y-2">
            {interactions.slice(0, 15).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-white dark:bg-gray-900"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <MousePointerClick className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">נפתח הכרטיס</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.created_date).toLocaleString('he-IL')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}