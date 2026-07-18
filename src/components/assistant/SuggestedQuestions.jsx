import React from 'react';
import { MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuggestedQuestions({ onSelectQuestion }) {
  const questions = [
    'אילו כלים אצלי הכי מתאימים למחקר וכתיבה?',
    'השווה לי בין הכלים הכי טובים אצלי ליצירת תמונות',
    'מצא לי כלים דומים שאולי מיותרים או כפולים',
    'צור לי משימה שבועית עבור כלי לכתיבת פוסטים',
    'אילו כלים במאגר שלי הכי טובים למתחילים?',
    'תן לי המלצה איזה כלי כדאי ללמוד קודם',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Zap className="w-5 h-5 text-indigo-500" />
        <span className="text-sm font-medium">אפשר להתחיל מכאן</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {questions.map((question) => (
          <Button
            key={question}
            variant="outline"
            onClick={() => onSelectQuestion(question)}
            className="h-auto min-h-[84px] rounded-3xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 justify-start text-right whitespace-normal hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
          >
            <MessageCircle className="w-4 h-4 ml-2 flex-shrink-0 text-indigo-500" />
            <span className="text-sm leading-6">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}