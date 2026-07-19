import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ToolRatingPanel({ tool }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['toolRatings', tool.id],
    queryFn: () => base44.entities.UserToolRating.filter({ toolId: tool.id }).catch(() => []),
  });

  const myRating = ratings.find((r) => r.userEmail === currentUser?.email);

  useEffect(() => {
    if (myRating) {
      setRating(myRating.rating || 0);
      setComment(myRating.comment || '');
    }
  }, [myRating]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (myRating) {
        return base44.entities.UserToolRating.update(myRating.id, data);
      }
      return base44.entities.UserToolRating.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolRatings'] });
      toast.success('הדירוג והמשוב נשמרו בהצלחה!');
    },
    onError: () => toast.error('אירעה שגיאה בשמירת הדירוג'),
  });

  const handleSubmit = () => {
    if (!rating) {
      toast.error('בחר דירוג בין 1 ל-5 כוכבים');
      return;
    }
    saveMutation.mutate({
      toolId: tool.id,
      toolName: tool.name,
      rating,
      comment,
      interactionType: 'rate',
      userEmail: currentUser?.email,
    });
  };

  const otherRatings = ratings.filter((r) => r.userEmail !== currentUser?.email && r.comment);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-5 rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50/60 dark:bg-yellow-900/10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-lg">דרג את הכלי ושתף משוב</h3>
        </div>

        <label className="text-sm font-medium mb-2 block">כמה כוכבים תתן? (1-5)</label>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 hover:scale-110 transition-transform"
              aria-label={`${star} כוכבים`}>
              <Star
                className={`w-8 h-8 ${
                  (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <label className="text-sm font-medium mb-2 block">תגובה (אופציונלי)</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="מה אהבת או מה פחות אהבת בכלי?"
          className="min-h-24 bg-white dark:bg-gray-900 mb-4"
        />

        <Button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
          {saveMutation.isPending ? 'שומר...' : myRating ? 'עדכן דירוג' : 'שלח דירוג ומשוב'}
        </Button>
      </div>

      {otherRatings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg">משובים נוספים</h3>
          </div>
          <div className="space-y-3">
            {otherRatings.map((r) => (
              <div key={r.id} className="p-3 rounded-xl border bg-white dark:bg-gray-900">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}