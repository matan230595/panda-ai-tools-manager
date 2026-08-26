import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { GraduationCap, Loader2, Sparkles, Award, Crown } from 'lucide-react';
import ToolLogo from '@/components/ToolLogo';

const COLUMNS = [
  { id: 'מתחיל', title: 'מתחיל', icon: GraduationCap, accent: 'from-sky-500/20 to-sky-600/5', border: 'border-sky-400/30', dot: 'bg-sky-400', glow: 'shadow-sky-500/20' },
  { id: 'בינוני', title: 'בתהליך', icon: Sparkles, accent: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-400/30', dot: 'bg-amber-400', glow: 'shadow-amber-500/20' },
  { id: 'מומחה', title: 'מומחה', icon: Crown, accent: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-400/30', dot: 'bg-emerald-400', glow: 'shadow-emerald-500/20' },
];

export default function MasteryKanban({ onToolClick }) {
  const queryClient = useQueryClient();

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const handleDragEnd = async (result) => {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) return;
    const toolId = result.draggableId;
    const newLevel = result.destination.droppableId;
    try {
      await base44.entities.AiTool.update(toolId, { masteryLevel: newLevel });
      queryClient.setQueryData(['tools'], (prev) =>
        (prev || []).map((t) => (t.id === toolId ? { ...t, masteryLevel: newLevel } : t))
      );
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      if (navigator.vibrate) navigator.vibrate(15);
    } catch (e) {
      console.error('Failed to update mastery:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400 px-1">
        <GraduationCap className="w-4 h-4 text-cyan-400" />
        גרור כרטיסי כלים בין העמודות כדי לעדכן את רמת השליטה שלך
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[60vh]">
          {COLUMNS.map((col) => {
            const items = tools.filter((t) => (t.masteryLevel || 'מתחיל') === col.id);
            const Icon = col.icon;
            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-2xl border ${col.border} bg-gradient-to-b ${col.accent} backdrop-blur-sm p-3 transition-shadow ${snapshot.isDraggingOver ? `shadow-lg ${col.glow}` : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${col.dot} bg-opacity-20 flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white">{col.title}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-2 min-h-[100px]">
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center text-xs text-slate-600 py-8">אין כלים</div>
                      )}
                      {items.map((tool, idx) => (
                        <Draggable key={tool.id} draggableId={tool.id} index={idx}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`group rounded-xl border border-white/10 bg-[#1a202d]/80 p-2.5 cursor-grab active:cursor-grabbing transition-all ${
                                snap.isDragging ? 'shadow-xl scale-[1.03] border-cyan-400/40' : 'hover:border-cyan-400/30'
                              }`}
                              onClick={() => !snap.isDragging && onToolClick?.(tool)}
                            >
                              <div className="flex items-center gap-2">
                                <ToolLogo tool={tool} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-white truncate">{tool.name}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{tool.category}</div>
                                </div>
                              </div>
                              {tool.learningPriority && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500">עדיפות:</span>
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                    tool.learningPriority === 'דוחוף' ? 'bg-red-500/20 text-red-300' :
                                    tool.learningPriority === 'חשוב' ? 'bg-amber-500/20 text-amber-300' :
                                    'bg-slate-500/20 text-slate-300'
                                  }`}>
                                    {tool.learningPriority}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}