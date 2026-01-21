import React from 'react';
import { Calendar, TrendingUp, DollarSign, BarChart3, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ToolStatsDisplay({ stats, personalRating }) {
  if (!stats) return null;

  const frequencyColors = {
    'כל יום': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'כמה פעמים בשבוע': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'שבועי': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'חודשי': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'לעיתים רחוקות': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* סטטיסטיקות שימוש */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            סטטיסטיקות שימוש
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">שימוש כולל:</span>
            <span className="font-semibold text-sm">{stats.timesUsed || 0} פעמים</span>
          </div>
          <div>
            <span className="text-xs text-gray-600 dark:text-gray-400">תדירות:</span>
            <Badge className={`${frequencyColors[stats.usageFrequency] || frequencyColors['לעיתים רחוקות']} ml-2 text-xs`}>
              {stats.usageFrequency || 'לא ידוע'}
            </Badge>
          </div>
          {stats.averageSessionDuration && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">משך מושב ממוצע:</span>
              <span className="text-sm">{stats.averageSessionDuration} דקות</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* עלויות ותשואה */}
      <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4" />
            עלויות וערך
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.totalCostPerMonth && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">עלות חודשית:</span>
              <span className="font-semibold text-sm">₪{stats.totalCostPerMonth.toFixed(0)}</span>
            </div>
          )}
          {stats.roi && (
            <div>
              <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">תשואה:</span>
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{stats.roi}</p>
            </div>
          )}
          {!stats.totalCostPerMonth && !stats.roi && (
            <p className="text-xs text-gray-500">אין נתונים זמינים</p>
          )}
        </CardContent>
      </Card>

      {/* תאריך שימוש אחרון */}
      {stats.lastUsedDate && (
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              שימוש אחרון
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">
              {new Date(stats.lastUsedDate).toLocaleDateString('he-IL')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(stats.lastUsedDate).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* דירוג אישי */}
      {personalRating !== undefined && personalRating > 0 && (
        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4" />
              דירוג אישי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < personalRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{personalRating}/5</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}