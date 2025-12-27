import React from 'react';
import { Star, ExternalLink, Edit, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ToolLogo from '@/components/ToolLogo';

export default function KanbanView({ tools, onEdit, onDelete, onToggleFavorite, onManageSubscription }) {
  // חלוקה לפי סטטוס מנוי
  const freeTools = tools.filter(t => t.subscriptionType === 'חינמי');
  const premiumTools = tools.filter(t => t.subscriptionType === 'פרימיום');
  const goldTools = tools.filter(t => t.subscriptionType === 'גולד');

  const columns = [
    { title: '🆓 חינמי', tools: freeTools, color: 'from-green-500 to-emerald-600' },
    { title: '⭐ פרימיום', tools: premiumTools, color: 'from-indigo-500 to-purple-600' },
    { title: '👑 גולד', tools: goldTools, color: 'from-yellow-500 to-orange-600' },
  ];

  const KanbanCard = ({ tool }) => (
    <div className="glass-effect rounded-xl p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ToolLogo tool={tool} size="sm" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{tool.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tool.category?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(tool)}
          className="flex-shrink-0"
        >
          <Star className={`w-4 h-4 ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
      </div>

      {tool.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {tool.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(tool.url, '_blank')}
            className="h-7 w-7 p-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(tool)}
            className="h-7 w-7 p-0"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(tool)}
            className="h-7 w-7 p-0 text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {tool.hasSubscription && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onManageSubscription(tool)}
              className="h-7 w-7 p-0 text-blue-600"
            >
              <Key className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {tool.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{tool.rating}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.title} className="flex flex-col">
          <div className={`bg-gradient-to-r ${column.color} text-white rounded-xl p-4 mb-4`}>
            <h3 className="font-bold text-lg">{column.title}</h3>
            <p className="text-sm opacity-90">{column.tools.length} כלים</p>
          </div>
          <div className="space-y-3 flex-1">
            {column.tools.map((tool) => (
              <KanbanCard key={tool.id} tool={tool} />
            ))}
            {column.tools.length === 0 && (
              <p className="text-center text-gray-400 dark:text-gray-600 py-8">
                אין כלים בקטגוריה זו
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}