import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

function formatDateKey(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

function buildMonthDays(currentDate) {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function buildWeekDays(currentDate) {
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function ReminderCalendarView({ reminders = [], subscriptions = [], tasks = [], onMoveReminder, onMoveTask }) {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));

  const calendarDays = useMemo(() => (
    viewMode === 'month' ? buildMonthDays(currentDate) : buildWeekDays(currentDate)
  ), [currentDate, viewMode]);

  const itemsByDate = useMemo(() => {
    const grouped = {};

    reminders.forEach((reminder) => {
      const key = reminder.reminderDate;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        ...reminder,
        itemType: 'reminder',
      });
    });

    subscriptions.forEach((subscription) => {
      if (!subscription.renewalDate) return;
      const key = subscription.renewalDate;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        ...subscription,
        itemType: 'subscription',
      });
    });

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = task.dueDate;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        ...task,
        itemType: 'task',
      });
    });

    return grouped;
  }, [reminders, subscriptions, tasks]);

  const selectedItems = itemsByDate[selectedDateKey] || [];

  const moveCalendar = (direction) => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + direction);
    } else {
      next.setDate(next.getDate() + direction * 7);
    }
    setCurrentDate(next);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          לוח תזכורות וחידושי מנויים
        </CardTitle>
        <div className="flex gap-2">
          <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('month')}>חודשי</Button>
          <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')}>שבועי</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => moveCalendar(-1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="font-semibold text-lg">
            {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </div>
          <Button variant="ghost" size="icon" onClick={() => moveCalendar(1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500">
          {dayNames.map((day) => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date) => {
            const dateKey = formatDateKey(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const dayItems = itemsByDate[dateKey] || [];

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDateKey(dateKey)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const reminderId = event.dataTransfer.getData('reminderId');
                  const taskId = event.dataTransfer.getData('taskId');
                  if (reminderId) onMoveReminder?.(reminderId, dateKey);
                  if (taskId) onMoveTask?.(taskId, dateKey);
                }}
                className={`min-h-[110px] rounded-xl border p-2 cursor-pointer transition ${selectedDateKey === dateKey ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-800'} ${!isCurrentMonth && viewMode === 'month' ? 'opacity-40' : ''}`}
              >
                <div className="text-sm font-semibold mb-2">{date.getDate()}</div>
                <div className="space-y-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <div
                      key={`${item.itemType}-${item.id}`}
                      draggable={item.itemType !== 'subscription'}
                      onDragStart={(event) => {
                        if (item.itemType === 'reminder') event.dataTransfer.setData('reminderId', item.id);
                        if (item.itemType === 'task') event.dataTransfer.setData('taskId', item.id);
                      }}
                      className={`rounded-md px-2 py-1 text-[11px] flex items-center gap-1 ${item.itemType === 'subscription' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' : item.itemType === 'task' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'}`}
                    >
                      {item.itemType !== 'subscription' && <GripVertical className="w-3 h-3 flex-shrink-0" />}
                      <span className="truncate">{item.itemType === 'task' ? item.title : item.toolName}</span>
                    </div>
                  ))}
                  {dayItems.length > 3 && <div className="text-[11px] text-gray-500">+{dayItems.length - 3} נוספים</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="font-semibold mb-3">פריטים ליום {selectedDateKey}</div>
          {selectedItems.length === 0 ? (
            <div className="text-sm text-gray-500">אין פריטים ביום הזה.</div>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={`${item.itemType}-${item.id}`} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                  <div>
                    <div className="font-medium">{item.toolName}</div>
                    <div className="text-xs text-gray-500">
                      {item.itemType === 'subscription'
                        ? 'חידוש/תשלום מנוי'
                        : item.itemType === 'task'
                          ? `${item.description || 'משימה מקושרת לכלי'} • ${item.reminderTime || '09:00'}`
                          : `${item.message} • ${item.reminderTime || '09:00'}`}
                    </div>
                  </div>
                  <Badge variant="outline">{item.itemType === 'subscription' ? 'מנוי' : item.itemType === 'task' ? 'משימה' : 'תזכורת'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}