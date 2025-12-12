import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ 
  icon: Icon = Sparkles, 
  title = 'אין כלים עדיין',
  description = 'התחל בהוספת כלי AI ראשון שלך',
  actionLabel = 'הוסף כלי',
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl animate-bounce">
        <Icon className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        {description}
      </p>
      
      {onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
        >
          <Icon className="w-5 h-5 ml-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}