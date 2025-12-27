import React, { useState } from 'react';
import { Settings2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'שם הכלי', defaultVisible: true },
  { id: 'category', label: 'קטגוריה', defaultVisible: true },
  { id: 'pricing', label: 'תמחור', defaultVisible: true },
  { id: 'priceILS', label: 'מחיר (₪)', defaultVisible: true },
  { id: 'rating', label: 'דירוג', defaultVisible: true },
  { id: 'popularity', label: 'פופולריות', defaultVisible: false },
  { id: 'hasSubscription', label: 'מנוי פעיל', defaultVisible: true },
  { id: 'targetAudience', label: 'קהל יעד', defaultVisible: false },
  { id: 'platforms', label: 'פלטפורמות', defaultVisible: false },
  { id: 'integrations', label: 'אינטגרציות', defaultVisible: false },
  { id: 'created', label: 'תאריך יצירה', defaultVisible: false },
];

export default function TableColumnSelector({ selectedColumns, onColumnsChange }) {
  const [columns, setColumns] = useState(() => {
    if (selectedColumns && selectedColumns.length > 0) {
      return selectedColumns;
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible);
  });

  const handleToggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find(c => c.id === columnId);
    const isSelected = columns.some(c => c.id === columnId);
    
    let newColumns;
    if (isSelected) {
      newColumns = columns.filter(c => c.id !== columnId);
    } else {
      newColumns = [...columns, column];
    }
    
    setColumns(newColumns);
    onColumnsChange(newColumns);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumns(items);
    onColumnsChange(items);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          עמודות ({columns.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">בחר עמודות להצגה</h4>
            <p className="text-xs text-gray-500 mb-4">
              גרור לשינוי סדר, לחץ לבחירה/ביטול
            </p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {columns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-2 p-2 rounded-lg border ${
                            snapshot.isDragging
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </div>
                          <Checkbox
                            id={column.id}
                            checked={true}
                            onCheckedChange={() => handleToggleColumn(column.id)}
                          />
                          <Label htmlFor={column.id} className="flex-1 cursor-pointer">
                            {column.label}
                          </Label>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* עמודות לא מוצגות */}
          {AVAILABLE_COLUMNS.filter(col => !columns.some(c => c.id === col.id)).length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">עמודות זמינות:</p>
              <div className="space-y-2">
                {AVAILABLE_COLUMNS.filter(col => !columns.some(c => c.id === col.id)).map((column) => (
                  <div key={column.id} className="flex items-center gap-2 p-2">
                    <Checkbox
                      id={`available-${column.id}`}
                      checked={false}
                      onCheckedChange={() => handleToggleColumn(column.id)}
                    />
                    <Label htmlFor={`available-${column.id}`} className="cursor-pointer text-sm">
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}