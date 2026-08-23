import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, GripVertical, Bell, CreditCard, ListChecks, GraduationCap, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DayDetailDialog from '@/components/calendar/DayDetailDialog';

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

const typeStyles = {
  subscription: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  task: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  reminder: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  plan: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  step: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
};

const typeLabels = {
  subscription: 'מנוי',
  task: 'משימה',
  reminder: 'תזכורת',
  plan: 'תוכנית למידה',
  step: 'שלב למידה',
};

export default function ReminderCalendarView({ reminders = [], subscriptions = [], tasks = [], plans = [], onMoveReminder, onMoveTask }) {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogDateKey, setDialogDateKey] = useState(null);

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') return buildMonthDays(currentDate);
    if (viewMode === 'week') return buildWeekDays(currentDate);
    return [new Date(currentDate)];
  }, [currentDate, viewMode]);

  const itemsByDate = useMemo(() => {
    const grouped = {};
    const push = (key, item) => {
      if (!key) return;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    };

    reminders.forEach((reminder) => push(reminder.reminderDate, { ...reminder, itemType: 'reminder' }));
    subscriptions.forEach((subscription) => push(subscription.renewalDate, { ...subscription, itemType: 'subscription' }));
    tasks.forEach((task) => push(task.dueDate, { ...task, itemType: 'task' }));
    plans.forEach((plan) => {
      push(plan.targetDate, { ...plan, itemType: 'plan' });
      (plan.steps || []).forEach((step) => {
        if (step.dueDate) push(step.dueDate, { ...step, toolName: plan.toolName, planTitle: plan.title, itemType: 'step' });
      });
    });

    return grouped;
  }, [reminders, subscriptions, tasks, plans]);

  const moveCalendar = (direction) => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + direction);
    else if (viewMode === 'week') next.setDate(next.getDate() + direction * 7);
    else next.setDate(next.getDate() + direction);
    setCurrentDate(next);
  };

  const headerLabel = viewMode === 'day'
    ? currentDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  const dropHandlers = (dateKey) => ({
    onDragOver: (event) => event.preventDefault(),
    onDrop: (event) => {
      const reminderId = event.dataTransfer.getData('reminderId');
      const taskId = event.dataTransfer.getData('taskId');
      if (reminderId) onMoveReminder?.(reminderId, dateKey);
      if (taskId) onMoveTask?.(taskId, dateKey);
    },
  });

  const dragStart = (item) => (event) => {
    if (item.itemType === 'reminder') event.dataTransfer.setData('reminderId', item.id);
    if (item.itemType === 'task') event.dataTransfer.setData('taskId', item.id);
  };

  const renderDayView = () => {
    const dateKey = formatDateKey(currentDate);
    const dayItems = itemsByDate[dateKey] || [];
    const iconMap = { subscription: CreditCard, task: ListChecks, reminder: Bell, plan: GraduationCap, step: Flag };

    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 min-h-[400px]" {...dropHandlers(dateKey)}>
        {dayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CalendarDays className="w-12 h-12 mb-3 opacity-40" />
            <div className="text-sm">אין פריטים ביום הזה</div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayItems.map((item) => {
              const Icon = iconMap[item.itemType];
              const title = item.itemType === 'task' || item.itemType === 'step' ? (item.title || item.planTitle) : item.itemType === 'plan' ? item.title : item.toolName;
              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  draggable={item.itemType !== 'subscription'}
                  onDragStart={dragStart(item)}
                  className={`flex items-center gap-3 rounded-xl p-3.5 ${typeStyles[item.itemType]}`}
                >
                  {item.itemType !== 'subscription' && <GripVertical className="w-4 h-4 flex-shrink-0 opacity-60" />}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-semibold text-sm truncate">{title}</div>
                    <div className="text-xs opacity-80 mt-0.5 truncate">
                      {item.itemType === 'subscription' ? 'חידוש/תשלום מנוי'
                        : item.itemType === 'task' ? (item.description || 'משימה')
                        : item.itemType === 'plan' ? (item.description || 'תוכנית למידה')
                        : item.itemType === 'step' ? (item.description || 'שלב למידה')
                        : (item.message || 'תזכורת')}
                      {item.reminderTime ? ` • ${item.reminderTime}` : ''}
                    </div>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 bg-white/50 dark:bg-black/20">
                    {typeLabels[item.itemType]}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderGrid = () => (
    <>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500">
        {dayNames.map((day) => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date) => {
          const dateKey = formatDateKey(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = dateKey === formatDateKey(new Date());
          const dayItems = itemsByDate[dateKey] || [];

          return (
            <div
              key={dateKey}
              onClick={() => setDialogDateKey(dateKey)}
              {...dropHandlers(dateKey)}
              className={`min-h-[110px] rounded-xl border p-2 cursor-pointer transition hover:border-indigo-400 hover:shadow-sm ${isToday ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-800'} ${!isCurrentMonth && viewMode === 'month' ? 'opacity-40' : ''}`}
            >
              <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-indigo-600' : ''}`}>{date.getDate()}</div>
              <div className="space-y-1">
                {dayItems.slice(0, 3).map((item) => (
                  <div
                    key={`${item.itemType}-${item.id}`}
                    draggable={item.itemType !== 'subscription'}
                    onDragStart={dragStart(item)}
                    onClick={(e) => e.stopPropagation()}
                    className={`rounded-md px-2 py-1 text-[11px] flex items-center gap-1 ${typeStyles[item.itemType]}`}
                  >
                    {item.itemType !== 'subscription' && <GripVertical className="w-3 h-3 flex-shrink-0" />}
                    <span className="truncate">{item.itemType === 'task' || item.itemType === 'step' ? (item.title || item.planTitle) : item.itemType === 'plan' ? item.title : item.toolName}</span>
                  </div>
                ))}
                {dayItems.length > 3 && <div className="text-[11px] text-gray-500">+{dayItems.length - 3} נוספים</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <Card dir="rtl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          לוח שנה מאוחד
        </CardTitle>
        <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <Button variant={viewMode === 'day' ? 'default' : 'ghost'} size="sm" className="rounded-lg" onClick={() => setViewMode('day')}>יומי</Button>
          <Button variant={viewMode === 'week' ? 'default' : 'ghost'} size="sm" className="rounded-lg" onClick={() => setViewMode('week')}>שבועי</Button>
          <Button variant={viewMode === 'month' ? 'default' : 'ghost'} size="sm" className="rounded-lg" onClick={() => setViewMode('month')}>חודשי</Button>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800"></span> מנויים</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800"></span> תזכורות</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800"></span> משימות</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-200 dark:bg-purple-800"></span> תוכניות למידה</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></span> שלבי למידה</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => moveCalendar(-1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="font-semibold text-lg">{headerLabel}</div>
          <Button variant="ghost" size="icon" onClick={() => moveCalendar(1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {viewMode === 'day' ? renderDayView() : renderGrid()}
      </CardContent>

      <DayDetailDialog
        open={!!dialogDateKey}
        onOpenChange={(open) => !open && setDialogDateKey(null)}
        dateKey={dialogDateKey}
        items={dialogDateKey ? (itemsByDate[dialogDateKey] || []) : []}
      />
    </Card>
  );
}