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
        <Zap className="w-5 h-5" />
        <span className="text-sm font-medium">שאלות מוצעות</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSelectQuestion(question)}
            className="h-auto p-4 justify-start text-right hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <MessageCircle className="w-4 h-4 ml-2 flex-shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <span className="text-sm leading-relaxed">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}