import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';

export default function DayReminderForm({ dateKey, initial, onSave, onCancel, isSaving }) {
  const [toolName, setToolName] = useState(initial?.toolName || '');
  const [message, setMessage] = useState(initial?.message || '');
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime || '09:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!toolName.trim() || !message.trim()) return;
    onSave({
      toolName: toolName.trim(),
      message: message.trim(),
      reminderTime,
      reminderDate: dateKey,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 text-right">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{initial ? 'עריכת תזכורת' : 'תזכורת חדשה'}</h4>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">כותרת / שם הכלי</Label>
        <Input value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="למשל: ChatGPT" required />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">תוכן התזכורת</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="מה להזכיר לך?" rows={2} required />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">שעה</Label>
        <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="flex-1" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? 'שמור שינויים' : 'הוסף תזכורת'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>ביטול</Button>
      </div>
    </form>
  );
}