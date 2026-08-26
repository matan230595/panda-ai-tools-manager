import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Edit, Trash2, Key, FlaskConical, CheckCircle2, XCircle, Bookmark, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ToolLogo from '@/components/ToolLogo';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskTemplatesDialog from '@/components/tools/TaskTemplatesDialog';

const COLUMNS = [
  {
    id: 'מתחיל',
    title: 'ללמידה',
    Icon: FlaskConical,
    color: 'from-amber-500 to-orange-500',
    ring: 'border-amber-300 dark:border-amber-800',
    dropBg: 'bg-amber-50/70 dark:bg-amber-900/20',
  },
  {
    id: 'בינוני',
    title: 'בתהליך',
    Icon: CheckCircle2,
    color: 'from-blue-500 to-cyan-500',
    ring: 'border-blue-300 dark:border-blue-800',
    dropBg: 'bg-blue-50/70 dark:bg-blue-900/20',
  },
  {
    id: 'מומחה',
    title: 'מומחה',
    Icon: Bookmark,
    color: 'from-emerald-500 to-green-600',
    ring: 'border-emerald-300 dark:border-emerald-800',
    dropBg: 'bg-emerald-50/70 dark:bg-emerald-900/20',
  },
];

export default function KanbanView({ tools, onEdit, onDelete, onToggleFavorite, onManageSubscription, onToolClick, onStatusChange }) {
  const [localTools, setLocalTools] = useState(tools);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setLocalTools(tools);
  }, [tools]);

  const getStatus = (tool) => tool.masteryLevel || 'מתחיל';

  const handleDragStart = () => {
    setIsDraggingAny(true);
  };

  const handleDragEnd = (result) => {
    setIsDraggingAny(false);
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const draggedTool = localTools.find((t) => t.id === draggableId);
    if (!draggedTool) return;

    const newStatus = destination.droppableId;

    // עדכון אופטימי מיידי בממשק
    setLocalTools((prev) =>
      prev.map((tool) => (tool.id === draggableId ? { ...tool, masteryLevel: newStatus } : tool))
    );

    // שמירה בשרת — רק השדה שהשתנה כדי לא לדרוס מידע אחר
    onStatusChange?.(draggedTool.id, newStatus);
  };

  const KanbanCard = ({ tool, isDragging }) => (
    <div
      className="glass-effect rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing min-w-0 border border-gray-200 dark:border-gray-700"
      onClick={() => {
        // Don't open details if this was a drag gesture
        if (isDragging || isDraggingAny) return;
        onToolClick?.(tool);
      }}
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <ToolLogo tool={tool} size="sm" />
          <div className="flex-1 min-w-0 text-right">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{tool.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.category?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(tool);
          }}
          className="flex-shrink-0 p-1 -m-1"
          aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Star className={`w-4 h-4 ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
      </div>

      {tool.description && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 text-right break-words">
          {tool.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 gap-1">
        <div className="flex gap-0.5 sm:gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              window.open(tool.url, '_blank', 'noopener,noreferrer');
            }}
            className="h-9 w-9 p-0 touch-target"
            aria-label="פתח באתר"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tool);
            }}
            className="h-9 w-9 p-0 touch-target"
            aria-label="עריכה"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          {tool.hasSubscription && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onManageSubscription(tool);
              }}
              className="h-9 w-9 p-0 touch-target text-blue-600"
              aria-label="ניהול מנוי"
            >
              <Key className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tool);
            }}
            className="h-9 w-9 p-0 touch-target text-red-600"
            aria-label="מחיקה"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        {tool.rating > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{tool.rating}</span>
          </div>
        )}
      </div>

      {/* העברת סטטוס מהירה (חלופה לגרירה) */}
      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        {COLUMNS.filter((c) => c.id !== getStatus(tool)).map((c) => (
          <button
            key={c.id}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.(tool.id, c.id);
              setLocalTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, masteryLevel: c.id } : t)));
            }}
            className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            העבר ל{c.title}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">גרור כלים בין שלבי הלמידה או השתמש בכפתורי העברה</p>
        <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} className="gap-2">
          <Wand2 className="w-4 h-4" />
          תבניות משימות
        </Button>
      </div>
      <TaskTemplatesDialog open={showTemplates} onOpenChange={setShowTemplates} tools={tools} />
      {/* מובייל: גלילה אופקית בין העמודות · דסקטופ: 4 עמודות */}
      <div className="flex gap-3 md:gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide" dir="rtl">
        {COLUMNS.map((column) => {
          const columnTools = localTools.filter((t) => getStatus(t) === column.id);
          const ColIcon = column.Icon;
          return (
            <div
              key={column.id}
              className="flex flex-col min-w-[80vw] sm:min-w-[55vw] md:min-w-0"
            >
              <div className={`bg-gradient-to-l ${column.color} text-white rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 sticky top-16 md:top-24 z-10 shadow-md`}>
                <div className="flex items-center gap-2">
                  <ColIcon className="w-5 h-5" />
                  <h3 className="font-bold text-base md:text-lg">{column.title}</h3>
                </div>
                <p className="text-xs sm:text-sm opacity-90 mt-0.5">{columnTools.length} כלים</p>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 flex-1 p-2 rounded-2xl border-2 border-dashed transition-colors min-h-[120px] ${
                      snapshot.isDraggingOver ? `${column.dropBg} ${column.ring}` : 'border-transparent'
                    }`}
                  >
                    {columnTools.map((tool, index) => (
                      <Draggable key={tool.id} draggableId={tool.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={dragProvided.draggableProps.style}
                            className={dragSnapshot.isDragging ? 'opacity-90' : ''}
                          >
                            <KanbanCard tool={tool} isDragging={dragSnapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {columnTools.length === 0 && (
                      <p className="text-center text-gray-400 dark:text-gray-600 py-8 text-sm">
                        {snapshot.isDraggingOver ? 'שחרר כאן' : 'גרור כלים לכאן'}
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}