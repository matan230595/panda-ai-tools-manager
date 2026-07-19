import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Activity, Star, MessageSquare } from 'lucide-react';

export default function ActivityHighlightsPanel({ tools = [] }) {
  const { data: ratings = [] } = useQuery({
    queryKey: ['userToolRatings'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.UserToolRating.filter({ created_by_id: user.id }, '-created_date', 6);
    },
  });

  const mostUsed = [...tools]
    .filter((tool) => (tool.usageStats?.timesUsed || 0) > 0)
    .sort((a, b) => (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0))
    .slice(0, 5);

  const recentRatings = ratings.filter((r) => r.rating).slice(0, 5);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      {/* הכלים הכי פעילים */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          הכלים הכי פעילים
        </h2>
        {mostUsed.length === 0 ? (
          <p className="text-sm text-gray-500">עדיין אין נתוני שימוש. פתח כלים כדי לצבור פעילות.</p>
        ) : (
          <div className="space-y-2">
            {mostUsed.map((tool, idx) => (
              <div key={tool.id} className="flex items-center gap-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 p-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{tool.name}</div>
                  <div className="text-xs text-gray-500 truncate">{tool.customCategory || tool.category}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-indigo-600">{tool.usageStats?.timesUsed || 0}</div>
                  <div className="text-[11px] text-gray-500">שימושים</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* דירוגים אחרונים שנתתי */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          דירוגים אחרונים שנתתי
        </h2>
        {recentRatings.length === 0 ? (
          <p className="text-sm text-gray-500">עדיין לא דירגת כלים. הוסף דירוג מתוך כרטיס הכלי.</p>
        ) : (
          <div className="space-y-2">
            {recentRatings.map((r) => (
              <div key={r.id} className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm truncate">{r.toolName}</div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-60" />
                    <span className="line-clamp-2">{r.comment}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}