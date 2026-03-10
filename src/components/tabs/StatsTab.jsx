import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, Star, TrendingUp, Package } from 'lucide-react';
import StatCard from '@/components/stats/StatCard';
import CategoryChart from '@/components/stats/CategoryChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import EmptyState from '@/components/EmptyState';

export default function StatsTab({ onNavigateToTools }) {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by: user.email });
    },
  });

  const stats = useMemo(() => {
    if (!tools.length) return null;

    const totalTools = tools.length;
    const favorites = tools.filter(t => t.isFavorite).length;
    const avgRating = tools.reduce((sum, t) => sum + (t.rating || 0), 0) / totalTools;
    const categories = new Set(tools.map(t => t.category)).size;

    const pricingData = tools.reduce((acc, tool) => {
      const pricing = tool.pricing || 'אחר';
      acc[pricing] = (acc[pricing] || 0) + 1;
      return acc;
    }, {});

    const pricingChartData = Object.entries(pricingData).map(([name, value]) => ({
      name,
      value,
    }));

    const topTools = [...tools]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5);

    const recentTools = [...tools]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);

    return {
      totalTools,
      favorites,
      avgRating,
      categories,
      pricingChartData,
      topTools,
      recentTools,
    };
  }, [tools]);

  const pricingColors = {
    'חינם': '#10b981',
    'בתשלום': '#3b82f6',
    'פרימיום': '#8b5cf6',
    'פרימיום_מוגבל': '#f59e0b',
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
    );
  }

  if (!stats || tools.length === 0) {
    return (
      <EmptyState
        title="אין נתונים סטטיסטיים"
        description="הוסף כלים כדי לראות סטטיסטיקות מפורטות"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          סטטיסטיקות ותובנות
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          מבט כולל על כלי ה-AI שלך
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigateToTools?.({ filter: 'all' })} className="cursor-pointer">
          <StatCard
            title="סך הכל כלים"
            value={stats.totalTools}
            icon={Package}
            gradient="from-indigo-500 to-purple-600"
            trend="up"
            trendValue="+12%"
          />
        </div>
        <div onClick={() => onNavigateToTools?.({ filter: 'favorites' })} className="cursor-pointer">
          <StatCard
            title="מועדפים"
            value={stats.favorites}
            icon={Star}
            gradient="from-yellow-500 to-orange-600"
          />
        </div>
        <div onClick={() => onNavigateToTools?.({ filter: 'highRated' })} className="cursor-pointer">
          <StatCard
            title="דירוג ממוצע"
            value={stats.avgRating.toFixed(1)}
            icon={TrendingUp}
            gradient="from-green-500 to-emerald-600"
          />
        </div>
        <div onClick={() => onNavigateToTools?.({ filter: 'categories' })} className="cursor-pointer">
          <StatCard
            title="קטגוריות"
            value={stats.categories}
            icon={Sparkles}
            gradient="from-pink-500 to-rose-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart tools={tools} />

        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
            פילוח לפי תמחור
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.pricingChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.pricingChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pricingColors[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  direction: 'rtl'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            הכלים הפופולריים ביותר
          </h3>
          <div className="space-y-4">
            {stats.topTools.map((tool, index) => (
              <div 
                key={tool.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{tool.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tool.category?.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{tool.popularity}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            נוספו לאחרונה
          </h3>
          <div className="space-y-4">
            {stats.recentTools.map((tool) => (
              <div 
                key={tool.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{tool.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tool.created_date).toLocaleDateString('he-IL')}
                  </p>
                </div>
                {tool.isFavorite && (
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          תובנות חכמות
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 יש לך <strong>{stats.totalTools}</strong> כלי AI במערכת. 
              {stats.favorites > 0 && ` <strong>${stats.favorites}</strong> מהם מסומנים כמועדפים.`}
            </p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ⭐ הדירוג הממוצע של הכלים שלך הוא <strong>{stats.avgRating.toFixed(1)}</strong> כוכבים.
              {stats.avgRating >= 4 && ' מצוין! הכלים שלך מקבלים ציונים גבוהים.'}
            </p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              📊 הכלים שלך מכסים <strong>{stats.categories}</strong> קטגוריות שונות.
              {stats.categories >= 5 && ' מגוון רחב של כלים!'}
            </p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              🎯 הכלי הפופולרי ביותר שלך הוא <strong>{stats.topTools[0]?.name}</strong>
              {stats.topTools[0]?.popularity === 5 && ' - בעל פופולריות מקסימלית!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}