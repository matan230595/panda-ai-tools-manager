import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Heart, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ToolLogo from '@/components/ToolLogo';

export default function SmartRecommendations({ onSelectTool }) {
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  const recommendations = useMemo(() => {
    if (tools.length === 0) return { trending: [], similar: [], forYou: [] };

    // כלים פופולריים
    const trending = [...tools]
      .filter(t => t.popularity >= 4)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 3);

    // כלים דומים (אותה קטגוריה כמו המועדפים)
    const favoriteCategories = tools
      .filter(t => t.isFavorite)
      .map(t => t.category);
    
    const similar = tools
      .filter(t => !t.isFavorite && favoriteCategories.includes(t.category))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    // כלים מומלצים (דירוג גבוה + לא משומש לאחרונה)
    const forYou = tools
      .filter(t => (t.rating || 0) >= 4 && !t.lastUsed)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    return { trending, similar, forYou };
  }, [tools]);

  const RecommendationCard = ({ tool, reason, icon: Icon, color }) => (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => onSelectTool?.(tool)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ToolLogo tool={tool} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{tool.name}</h4>
              {Icon && <Icon className={`w-3 h-3 ${color}`} />}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {tool.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{tool.category?.replace(/_/g, ' ')}</Badge>
              {tool.rating > 0 && (
                <span className="text-xs">⭐ {tool.rating}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* כלים פופולריים */}
      {recommendations.trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold">🔥 פופולרי כרגע</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.trending.map(tool => (
              <RecommendationCard
                key={tool.id}
                tool={tool}
                icon={TrendingUp}
                color="text-green-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* כלים דומים */}
      {recommendations.similar.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold">💡 אולי יעניין אותך</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.similar.map(tool => (
              <RecommendationCard
                key={tool.id}
                tool={tool}
                icon={Heart}
                color="text-pink-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* מומלץ בשבילך */}
      {recommendations.forYou.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold">✨ מומלץ בשבילך</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.forYou.map(tool => (
              <RecommendationCard
                key={tool.id}
                tool={tool}
                icon={Sparkles}
                color="text-purple-500"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}