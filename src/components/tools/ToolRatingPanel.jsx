import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false);
  const comment = review.comment || '';
  const isLong = comment.length > 220;
  const shown = expanded || !isLong ? comment : comment.slice(0, 220) + '…';

  return (
    <div className="p-3 rounded-xl border bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {review.created_date ? new Date(review.created_date).toLocaleDateString('he-IL') : ''}
        </span>
      </div>
      {comment ? (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{shown}</p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-indigo-600 hover:underline mt-1">
              {expanded ? 'הצג פחות' : 'קרא עוד'}
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 italic">ללא תגובה</p>
      )}
    </div>
  );
}

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
    queryFn: () =>
      base44.entities.UserToolRating
        .filter({ toolId: tool.id, interactionType: 'rate' }, '-created_date', 100)
        .catch(() => []),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.UserToolRating.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolRatings', tool.id] });
      setRating(0);
      setComment('');
      toast.success('המשוב נשמר בהצלחה!');
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
          {saveMutation.isPending ? 'שומר...' : 'שלח דירוג ומשוב'}
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-lg">משובים ({ratings.length})</h3>
        </div>
        {ratings.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-gray-500">
            עדיין אין משובים לכלי זה. היה הראשון לשתף!
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}