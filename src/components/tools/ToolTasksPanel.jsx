import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ToolTasksPanel({ tool }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    reminderTime: '09:00',
    frequency: 'one_time',
    priority: 'medium',
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['toolTasks', tool.id],
    queryFn: () => base44.entities.ToolTask.filter({ toolId: tool.id }),
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.ToolTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolTasks', tool.id] });
      queryClient.invalidateQueries({ queryKey: ['toolTasks'] });
      setForm({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        reminderTime: '09:00',
        frequency: 'one_time',
        priority: 'medium',
      });
      toast.success('המשימה נוספה');
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ToolTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolTasks', tool.id] });
      queryClient.invalidateQueries({ queryKey: ['toolTasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.ToolTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolTasks', tool.id] });
      queryClient.invalidateQueries({ queryKey: ['toolTasks'] });
      toast.success('המשימה נמחקה');
    },
  });

  const sortedTasks = useMemo(() => (
    [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  ), [tasks]);

  const openTasks = sortedTasks.filter((task) => !task.isCompleted);

  const submitTask = () => {
    if (!form.title.trim() || !form.dueDate) {
      toast.error('יש למלא כותרת ותאריך');
      return;
    }

    createTask.mutate({
      ...form,
      toolId: tool.id,
      toolName: tool.name,
      status: 'todo',
      isCompleted: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 p-4">
          <div className="text-sm text-gray-500">משימות פתוחות</div>
          <div className="text-2xl font-bold text-indigo-600">{openTasks.length}</div>
        </div>
        <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-4">
          <div className="text-sm text-gray-500">משימות הושלמו</div>
          <div className="text-2xl font-bold text-green-600">{sortedTasks.filter((task) => task.isCompleted).length}</div>
        </div>
        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-4">
          <div className="text-sm text-gray-500">קרובה לביצוע</div>
          <div className="text-2xl font-bold text-orange-600">{openTasks[0]?.dueDate || '—'}</div>
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-4">
        <div className="font-semibold">משימה חדשה לכלי {tool.name}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>כותרת</Label>
            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="למשל: עריכת פוסט שבועי" />
          </div>
          <div className="space-y-2">
            <Label>תאריך יעד</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>שעת תזכורת</Label>
            <Input type="time" value={form.reminderTime} onChange={(e) => setForm((prev) => ({ ...prev, reminderTime: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>תדירות</Label>
            <Select value={form.frequency} onValueChange={(value) => setForm((prev) => ({ ...prev, frequency: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">חד פעמי</SelectItem>
                <SelectItem value="weekly">שבועי</SelectItem>
                <SelectItem value="monthly">חודשי</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>תיאור</Label>
          <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="פירוט קצר למשימה..." rows={3} />
        </div>
        <Button onClick={submitTask} className="bg-gradient-to-r from-indigo-500 to-purple-600">
          <Plus className="w-4 h-4 ml-2" />
          הוסף משימה
        </Button>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-sm text-gray-500">עדיין אין משימות עבור הכלי הזה.</div>
        ) : (
          sortedTasks.map((task) => (
            <div key={task.id} className="rounded-xl border p-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`font-semibold ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
                  <Badge variant="outline">{task.frequency === 'weekly' ? 'שבועי' : task.frequency === 'monthly' ? 'חודשי' : 'חד פעמי'}</Badge>
                  <Badge className={task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                    {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                  </Badge>
                </div>
                {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                <div className="text-xs text-gray-500">{task.dueDate} • {task.reminderTime || '09:00'}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTask.mutate({
                    id: task.id,
                    data: {
                      ...task,
                      isCompleted: !task.isCompleted,
                      status: task.isCompleted ? 'todo' : 'done',
                    },
                  })}
                >
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                  {task.isCompleted ? 'החזר לפתוח' : 'סמן כהושלם'}
                </Button>
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteTask.mutate(task.id)}>
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}