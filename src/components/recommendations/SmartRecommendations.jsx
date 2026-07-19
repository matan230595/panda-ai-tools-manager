import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Heart, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SmartRecommendations({ onSelectTool }) {
  const queryClient = useQueryClient();
  const [ratingTool, setRatingTool] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['toolRatings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserToolRating.filter({ userEmail: user.email }).catch(() => []);
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const ratingMutation = useMutation({
    mutationFn: (data) => base44.entities.UserToolRating.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolRatings'] });
      toast.success('דירוגך נשמר בהצלחה');
      setRatingTool(null);
      setRating(0);
      setComment('');
    },
  });

  const recommendations = useMemo(() => {
    if (tools.length === 0) return { trending: [], similar: [], collaborative: [], forYou: [] };

    const toolRatings = {};
    ratings.forEach((item) => {
      if (!toolRatings[item.toolId]) toolRatings[item.toolId] = [];
      toolRatings[item.toolId].push(item.rating);
    });

    const avgToolRatings = Object.entries(toolRatings).reduce((acc, [toolId, toolScores]) => {
      acc[toolId] = toolScores.reduce((sum, score) => sum + score, 0) / toolScores.length;
      return acc;
    }, {});

    const trending = [...tools]
      .filter((tool) => tool.isFavorite || (avgToolRatings[tool.id] || tool.rating || 0) >= 4)
      .sort((a, b) => ((avgToolRatings[b.id] || b.rating || 0) + (b.isFavorite ? 1 : 0)) - ((avgToolRatings[a.id] || a.rating || 0) + (a.isFavorite ? 1 : 0)))
      .slice(0, 3);

    const userFavorites = tools.filter((tool) => tool.isFavorite);
    const userFavoriteIds = new Set(userFavorites.map((tool) => tool.id));
    const favoriteTags = userFavorites.flatMap((tool) => tool.tags || []);

    const collaborative = [...tools]
      .filter((tool) => !userFavoriteIds.has(tool.id))
      .map((tool) => ({
        tool,
        score: (tool.tags || []).filter((tag) => favoriteTags.includes(tag)).length + (tool.rating || 0),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.tool);

    const favoriteCategories = userFavorites.map((tool) => tool.category);
    const similar = tools
      .filter((tool) => !tool.isFavorite && favoriteCategories.includes(tool.category))
      .sort((a, b) => (avgToolRatings[b.id] || b.rating || 0) - (avgToolRatings[a.id] || a.rating || 0))
      .slice(0, 3);

    const forYou = tools
      .filter((tool) => (avgToolRatings[tool.id] || tool.rating || 0) >= 4 && !tool.isFavorite)
      .sort((a, b) => (avgToolRatings[b.id] || b.rating || 0) - (avgToolRatings[a.id] || a.rating || 0))
      .slice(0, 3);

    return { trending, similar, collaborative, forYou };
  }, [tools, ratings]);

  const handleRateSubmit = () => {
    if (!ratingTool || !rating) {
      toast.error('בחר דירוג');
      return;
    }

    ratingMutation.mutate({
      toolId: ratingTool.id,
      toolName: ratingTool.name,
      rating,
      comment,
      interactionType: 'rate',
      userEmail: currentUser?.email,
    });
  };

  const RecommendationCard = ({ tool, icon: Icon, color, hint }) => {
    const userRating = ratings.find((item) => item.toolId === tool.id && item.userEmail === currentUser?.email);

    return (
      <Card className="hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3" onClick={() => onSelectTool?.(tool)}>
            {tool.logo ? (
              <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-contain flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{tool.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{tool.name}</h4>
                {Icon && <Icon className={`w-3 h-3 ${color}`} />}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{tool.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{tool.category?.replace(/_/g, ' ')}</Badge>
                {(tool.rating || 0) > 0 && <span className="text-xs">⭐ {tool.rating}</span>}
              </div>
              <div className="text-[11px] text-gray-500 mt-2">{hint}</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setRatingTool(tool);
                setRating(userRating?.rating || 0);
                setComment(userRating?.comment || '');
              }}
            >
              <Star className="w-3 h-3 ml-1" />
              {userRating ? `דירוגך: ${userRating.rating} ⭐` : 'דרג כלי זה'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {recommendations.collaborative.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold">דומים למה שאתה אוהב</h3>
            <span className="text-xs text-gray-500">מבוסס על תגיות וקטגוריות במאגר שלך</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.collaborative.map((tool) => (
              <RecommendationCard key={tool.id} tool={tool} icon={Users} color="text-blue-500" hint="נמצא קרוב למה שסימנת כמועדף" />
            ))}
          </div>
        </div>
      )}

      {recommendations.trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold">בולטים במאגר שלך</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.trending.map((tool) => (
              <RecommendationCard key={tool.id} tool={tool} icon={TrendingUp} color="text-green-500" hint="כלי בולט לפי דירוג/מועדפים" />
            ))}
          </div>
        </div>
      )}

      {recommendations.similar.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold">בקטגוריות שאתה אוהב</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.similar.map((tool) => (
              <RecommendationCard key={tool.id} tool={tool} icon={Heart} color="text-pink-500" hint="כלי דומה בקטגוריה שמעניינת אותך" />
            ))}
          </div>
        </div>
      )}

      {recommendations.forYou.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold">מומלץ לבדוק</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.forYou.map((tool) => (
              <RecommendationCard key={tool.id} tool={tool} icon={Sparkles} color="text-purple-500" hint="כלי איכותי שעוד לא סימנת כמועדף" />
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!ratingTool} onOpenChange={() => setRatingTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>דרג את "{ratingTool?.name}"</DialogTitle>
            <DialogDescription>שמור לעצמך דירוג והערה מהירה על הכלי</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">כמה כוכבים תתן?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className={`text-3xl transition-transform ${rating >= star ? 'scale-125' : 'opacity-30'}`}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">תגובה (אופציונלי)</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="מה אהבת או מה פחות אהבת בכלי?" className="min-h-20" />
            </div>

            <Button onClick={handleRateSubmit} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">שמור דירוג</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}