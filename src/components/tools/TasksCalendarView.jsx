import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { ChevronRight, ChevronLeft, Calendar, Clock, Flag, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PRIORITY_LABELS = { high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' };
const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const WEEK_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTH_NAMES = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

function getEventsForDate(dateStr, tasks, plans) {
  const events = [];
  tasks.forEach((task) => {
    if (formatDate(task.dueDate) === dateStr) {
      events.push({ type: 'task', data: task });
    }
  });
  plans.forEach((plan) => {
    if (formatDate(plan.targetDate) === dateStr) {
      events.push({ type: 'plan', data: plan });
    }
    (plan.steps || []).forEach((step) => {
      if (formatDate(step.dueDate) === dateStr) {
        events.push({ type: 'step', data: { ...step, planTitle: plan.title, toolName: plan.toolName } });
      }
    });
  });
  return events;
}

export default function TasksCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: tasks = [] } = useQuery({
    queryKey: ['allToolTasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by_id: user.id });
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['allLearningPlans'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id });
    },
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = lastDay.getDate();
    const days = [];

    for (let i = 0; i < startOffset; i++) {
      const d = new Date(year, month, -(startOffset - 1 - i));
      days.push({ date: d, isCurrentMonth: false, dateStr: d.toISOString().split('T')[0] });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: d.toISOString().split('T')[0] });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateStr: d.toISOString().split('T')[0] });
    }
    return days;
  }, [year, month]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDayClick = (day) => {
    const events = getEventsForDate(day.dateStr, tasks, plans);
    if (events.length > 0) {
      setSelectedDate(day.date);
      setSelectedEvents(events);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const totalEvents = useMemo(() => {
    return tasks.length + plans.reduce((sum, p) => sum + (p.steps?.length || 0), 0);
  }, [tasks, plans]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between text-white">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1">לוח שנה - משימות ולמידה</h1>
            <p className="text-sm text-indigo-100/90">{totalEvents} אירועים בסך הכל</p>
          </div>
          <Calendar className="w-10 h-10 opacity-50" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-base sm:text-lg font-bold">
            {MONTH_NAMES[month]} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>היום</Button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const events = getEventsForDate(day.dateStr, tasks, plans);
            const isToday = day.dateStr === todayStr;
            const hasEvents = events.length > 0;

            return (
              <div
                key={idx}
                onClick={() => hasEvents && handleDayClick(day)}
                className={`min-h-[60px] sm:min-h-[90px] md:min-h-[110px] p-1 sm:p-1.5 border-b border-l border-gray-100 dark:border-slate-800 last:border-l-0 transition-colors ${
                  day.isCurrentMonth ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-950/50'
                } ${hasEvents ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30' : ''}`}
              >
                <div className="flex items-center justify-end">
                  <span className={`text-xs sm:text-sm font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : day.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </span>
                </div>
                {hasEvents && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {events.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        className={`text-[10px] sm:text-[11px] px-1 py-0.5 rounded truncate ${
                          event.type === 'task'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : event.type === 'plan'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        }`}
                      >
                        {event.type === 'step' ? '📁 ' : event.type === 'plan' ? '🎓 ' : '📋 '}
                        {event.data.title || event.data.planTitle}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <span className="text-[10px] text-gray-500 px-1">+{events.length - 3} עוד</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800"></span> משימות</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-200 dark:bg-purple-800"></span> תוכניות למידה</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></span> שלבי למידה</span>
      </div>

      {/* Day detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              {selectedDate ? new Date(selectedDate).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {selectedEvents.map((event, i) => (
              <div key={i} className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {event.type === 'task' && <Clock className="w-4 h-4 text-indigo-500" />}
                  {event.type === 'plan' && <GraduationCap className="w-4 h-4 text-purple-500" />}
                  {event.type === 'step' && <Flag className="w-4 h-4 text-green-500" />}
                  <span className="font-semibold text-sm">{event.data.title || event.data.planTitle}</span>
                </div>
                {event.data.toolName && (
                  <div className="text-xs text-gray-500">כלי: {event.data.toolName}</div>
                )}
                {event.data.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">{event.data.description}</div>
                )}
                {event.type === 'task' && event.data.priority && (
                  <Badge className={PRIORITY_COLORS[event.data.priority]}>
                    עדיפות {PRIORITY_LABELS[event.data.priority]}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}