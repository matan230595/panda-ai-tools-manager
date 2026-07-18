import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConversationList({ conversations = [], currentConversationId, onSelect, onNewChat }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 md:p-5 h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-bold text-lg">שיחות אחרונות</h3>
        <Button size="sm" variant="outline" onClick={onNewChat} className="rounded-2xl min-h-[42px]">
          <MessageSquarePlus className="w-4 h-4 ml-2" />
          חדש
        </Button>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 text-center">
            עדיין אין שיחות קודמות
          </div>
        ) : conversations.map((conversation) => {
          const active = currentConversationId === conversation.id;
          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full text-right rounded-2xl border px-4 py-3 transition-all ${active ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-800 hover:border-indigo-200 hover:bg-gray-50 dark:hover:bg-gray-800/70'}`}
            >
              <div className="font-medium text-sm truncate">{conversation.metadata?.name || 'שיחה'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(conversation.updated_date || conversation.created_date || Date.now()).toLocaleDateString('he-IL')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}