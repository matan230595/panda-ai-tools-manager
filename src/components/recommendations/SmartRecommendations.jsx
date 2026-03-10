import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Heart, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      return base44.entities.AiTool.filter({ created_by: user.email });
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
      queryClient.invalidateQueries(['toolRatings']);
      toast.success('דירוגך נשמר בהצלחה! ⭐');
      setRatingTool(null);
      setRating(0);
      setComment('');
    },
    onError: () => toast.error('שגיאה בשמירת הדירוג'),
  });

  const handleRateSubmit = () => {
    if (!rating) {
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

  // Collaborative Filtering Algorithm
  const recommendations = useMemo(() => {
    if (tools.length === 0) return { trending: [], similar: [], collaborative: [], forYou: [] };

    // Calculate average ratings from all users
    const toolRatings = {};
    ratings.forEach(r => {
      if (!toolRatings[r.toolId]) {
        toolRatings[r.toolId] = [];
      }
      toolRatings[r.toolId].push(r.rating);
    });

    const avgToolRatings = Object.entries(toolRatings).reduce((acc, [toolId, ratings]) => {
      acc[toolId] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return acc;
    }, {});

    // 1. Trending (High popularity + High avg rating from all users)
    const trending = [...tools]
      .filter(t => t.popularity >= 4 || avgToolRatings[t.id] >= 4)
      .sort((a, b) => {
        const aScore = (avgToolRatings[a.id] || a.rating || 0) * (a.popularity || 0);
        const bScore = (avgToolRatings[b.id] || b.rating || 0) * (b.popularity || 0);
        return bScore - aScore;
      })
      .slice(0, 3);

    // 2. Similar (Collaborative Filtering - tools liked by users who liked similar tools)
    const userFavorites = tools.filter(t => t.isFavorite);
    const userFavoriteIds = new Set(userFavorites.map(t => t.id));
    
    let collaborative = [];
    if (userFavorites.length > 0) {
      const similarUserTools = ratings
        .filter(r => userFavoriteIds.has(r.toolId) && r.rating >= 4)
        .map(r => r.toolId);

      collaborative = [...tools]
        .filter(t => !userFavoriteIds.has(t.id) && t.id !== ratingTool?.id)
        .map(tool => {
          // Score based on how often it's rated highly by users who like similar tools
          const score = ratings
            .filter(r => r.toolId === tool.id && r.rating >= 4)
            .length;
          return { tool, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.tool);
    }

    // 3. Similar Category
    const favoriteCategories = tools
      .filter(t => t.isFavorite)
      .map(t => t.category);

    const similar = tools
      .filter(t => !t.isFavorite && favoriteCategories.includes(t.category))
      .sort((a, b) => (avgToolRatings[b.id] || b.rating || 0) - (avgToolRatings[a.id] || a.rating || 0))
      .slice(0, 3);

    // 4. For You (High rated by community + not used yet)
    const forYou = tools
      .filter(t => (avgToolRatings[t.id] || t.rating || 0) >= 4 && !t.lastUsed)
      .sort((a, b) => (avgToolRatings[b.id] || b.rating || 0) - (avgToolRatings[a.id] || a.rating || 0))
      .slice(0, 3);

    return { trending, similar, collaborative, forYou };
  }, [tools, ratings, ratingTool?.id]);

  const RecommendationCard = ({ tool, reason, icon: Icon, color }) => {
    const userRating = ratings.find(r => r.toolId === tool.id && r.userEmail === currentUser?.email);

    return (
      <Card className="hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div
             className="flex items-start gap-3"
             onClick={() => onSelectTool?.(tool)}
           >
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
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {tool.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {tool.category?.replace(/_/g, ' ')}
                </Badge>
                {(tool.rating || 0) > 0 && (
                  <span className="text-xs">⭐ {tool.rating}</span>
                )}
              </div>
            </div>
          </div>

          {/* Rating Section */}
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
      {/* Collaborative Filtering */}
      {recommendations.collaborative.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold">👥 מומלץ משתמשים דומים</h3>
            <span className="text-xs text-gray-500">על בסיס הכלים שאתה אוהב</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.collaborative.map(tool => (
              <RecommendationCard
                key={tool.id}
                tool={tool}
                icon={Users}
                color="text-blue-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
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

      {/* Similar */}
      {recommendations.similar.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold">💡 בקטגוריות שאתה אוהב</h3>
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

      {/* For You */}
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

      {/* Rating Dialog */}
      <Dialog open={!!ratingTool} onOpenChange={() => setRatingTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>דרג את "{ratingTool?.name}"</DialogTitle>
            <DialogDescription>
              שתף את ההערות שלך כדי לעזור למשתמשים אחרים
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">כמה כוכבים תתן?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform ${
                      rating >= star ? 'scale-125' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium mb-2 block">תגובה (אופציונלי)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="שתף את הערות או ניסיונך עם הכלי..."
                className="min-h-20"
              />
            </div>

            <Button
              onClick={handleRateSubmit}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              שמור דירוג
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}