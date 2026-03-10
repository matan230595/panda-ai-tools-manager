import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Bell, Plus, Trash2, Check, AlertCircle, Clock, Sparkles, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { toast } from 'sonner';
import ReminderCalendarView from '@/components/calendar/ReminderCalendarView';

export default function RemindersTab() {
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    toolId: '',
    toolName: '',
    reminderType: 'subscription_expiry',
    reminderDate: '',
    reminderTime: '09:00',
    message: '',
    priority: 'medium',
    daysBeforeAlert: 7,
    subscriptionRenewalDate: ''
  });

  // טעינת כלים
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by: user.email });
    },
  });

  // טעינת תזכורות
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by: user.email });
    },
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by: user.email });
    },
  });

  const { data: toolTasks = [] } = useQuery({
    queryKey: ['toolTasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by: user.email });
    },
  });

  // יצירת תזכורת
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Reminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      setShowForm(false);
      resetForm();
      toast.success('תזכורת נוספה בהצלחה! 🔔');
    },
    onError: () => toast.error('שגיאה בהוספת התזכורת'),
  });

  // עדכון תזכורת
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reminder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      setShowForm(false);
      setEditingReminder(null);
      resetForm();
      toast.success('התזכורת עודכנה בהצלחה! ✅');
    },
    onError: () => toast.error('שגיאה בעדכון התזכורת'),
  });

  // מחיקת תזכורת
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('התזכורת נמחקה');
    },
    onError: () => toast.error('שגיאה במחיקת התזכורת'),
  });

  // סימון כבוצע
  const completeMutation = useMutation({
    mutationFn: ({ id, reminder }) => base44.entities.Reminder.update(id, { ...reminder, isCompleted: !reminder.isCompleted, completedDate: !reminder.isCompleted ? new Date().toISOString() : null }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('התזכורת עודכנה! ✓');
    }
  });

  // שלח תזכורות
  const sendRemindersMutation = useMutation({
    mutationFn: (reminderIds) => base44.functions.invoke('sendReminderNotification', { reminderIds }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['reminders']);
      toast.success(`נשלחו ${res.data.sent} תזכורות בדוא"ל ✉️`);
    },
    onError: () => toast.error('שגיאה בשליחת התזכורות')
  });

  const resetForm = () => {
    setFormData({
      toolId: '',
      toolName: '',
      reminderType: 'subscription_expiry',
      reminderDate: '',
      reminderTime: '09:00',
      message: '',
      priority: 'medium',
      daysBeforeAlert: 7,
      subscriptionRenewalDate: ''
    });
    setEditingReminder(null);
  };

  const handleSelectTool = (toolId) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
      setFormData(prev => ({
        ...prev,
        toolId: tool.id,
        toolName: tool.name
      }));
    }
  };

  const handleGenerateReminders = async () => {
    try {
      const subscriptionTools = tools.filter(t => t.subscriptionType && t.subscriptionType !== 'חינמי');
      
      for (const tool of subscriptionTools) {
        const existingReminder = reminders.find(r => r.toolId === tool.id && r.reminderType === 'subscription_expiry' && !r.isCompleted);
        
        if (!existingReminder) {
          const renewalDate = new Date();
          renewalDate.setDate(renewalDate.getDate() + 30);
          
          await createMutation.mutateAsync({
            toolId: tool.id,
            toolName: tool.name,
            reminderType: 'subscription_expiry',
            reminderDate: renewalDate.toISOString().split('T')[0],
            reminderTime: '09:00',
            message: `חידוש מנוי עבור ${tool.name}`,
            priority: 'high',
            daysBeforeAlert: 7,
            subscriptionRenewalDate: renewalDate.toISOString().split('T')[0]
          });
        }
      }
      
      toast.success(`${subscriptionTools.length} תזכורות נוצרו אוטומטית! 🎯`);
    } catch (error) {
      toast.error('שגיאה בהנדסת התזכורות');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.toolId || !formData.reminderDate || !formData.message) {
      toast.error('יש למלא את כל השדות הנדרשים');
      return;
    }

    if (editingReminder) {
      updateMutation.mutate({
        id: editingReminder.id,
        data: { ...editingReminder, ...formData }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeReminders = reminders.filter(r => !r.isCompleted && r.isActive);
  const completedReminders = reminders.filter(r => r.isCompleted);

  const handleMoveReminder = (reminderId, reminderDate) => {
    const reminder = reminders.find((item) => item.id === reminderId);
    if (!reminder) return;
    updateMutation.mutate({
      id: reminderId,
      data: { ...reminder, reminderDate },
    });
  };

  const handleMoveTask = async (taskId, dueDate) => {
    const task = toolTasks.find((item) => item.id === taskId);
    if (!task) return;
    await base44.entities.ToolTask.update(taskId, { ...task, dueDate });
    queryClient.invalidateQueries({ queryKey: ['toolTasks'] });
    toast.success('המשימה הוזזה בלוח');
  };

  const priorityColor = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const ReminderForm = () => (
    <div className="space-y-4 p-4 md:p-6">
      <div className="space-y-2">
        <Label htmlFor="tool">בחר כלי</Label>
        <Select value={formData.toolId} onValueChange={handleSelectTool}>
          <SelectTrigger id="tool">
            <SelectValue placeholder="בחר כלי..." />
          </SelectTrigger>
          <SelectContent>
            {tools.map(tool => (
              <SelectItem key={tool.id} value={tool.id}>
                {tool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderType">סוג התזכורת</Label>
        <Select 
          value={formData.reminderType} 
          onValueChange={(val) => setFormData(prev => ({ ...prev, reminderType: val }))}
        >
          <SelectTrigger id="reminderType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subscription_expiry">תפוגת מנוי</SelectItem>
            <SelectItem value="usage_check">בדיקת שימוש</SelectItem>
            <SelectItem value="price_alert">התראת מחיר</SelectItem>
            <SelectItem value="custom">מותאם אישית</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reminderDate">תאריך התזכורת</Label>
          <Input
            id="reminderDate"
            type="date"
            value={formData.reminderDate}
            onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminderTime">שעה</Label>
          <Input
            id="reminderTime"
            type="time"
            value={formData.reminderTime}
            onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">הודעה</Label>
        <Input
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="הודעת התזכורת..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">עדיפות</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">נמוכה</SelectItem>
            <SelectItem value="medium">בינונית</SelectItem>
            <SelectItem value="high">גבוהה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="daysBeforeAlert">ימים לפני ההתראה</Label>
        <Input
          id="daysBeforeAlert"
          type="number"
          min="1"
          value={formData.daysBeforeAlert}
          onChange={(e) => setFormData(prev => ({ ...prev, daysBeforeAlert: parseInt(e.target.value) || 7 }))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600" onClick={handleSubmit}>
          {editingReminder ? 'עדכן תזכורת' : 'הוסף תזכורת'}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
          ביטול
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  const FormWrapper = isMobile ? (
    <Drawer open={showForm} onOpenChange={setShowForm}>
      <DrawerTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 w-full md:w-auto">
          <Plus className="w-4 h-4 ml-2" />
          תזכורת חדשה
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{editingReminder ? 'ערוך תזכורת' : 'תזכורת חדשה'}</DrawerTitle>
        </DrawerHeader>
        <ReminderForm />
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
          <Plus className="w-4 h-4 ml-2" />
          תזכורת חדשה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingReminder ? 'ערוך תזכורת' : 'תזכורת חדשה'}</DialogTitle>
        </DialogHeader>
        <ReminderForm />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-1">תזכורות</h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            {activeReminders.length} תזכורות פעילות
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
           {FormWrapper}
           <Button 
             variant="outline"
             onClick={handleGenerateReminders}
             className="flex-1 sm:flex-none text-xs sm:text-sm"
           >
             <Sparkles className="w-4 h-4 ml-2" />
             AI
           </Button>
           {activeReminders.length > 0 && (
             <Button
               onClick={() => sendRemindersMutation.mutate(activeReminders.map(r => r.id))}
               className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
               disabled={sendRemindersMutation.isPending}
             >
               <Mail className="w-4 h-4 ml-2" />
               שלח דוא״ל
             </Button>
           )}
         </div>
      </div>

      <ReminderCalendarView
        reminders={activeReminders}
        subscriptions={subscriptions.filter((item) => item.isActive)}
        tasks={toolTasks.filter((item) => !item.isCompleted)}
        onMoveReminder={handleMoveReminder}
        onMoveTask={handleMoveTask}
      />

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">תזכורות פעילות</h3>
          <div className="grid gap-3 md:gap-4">
            {activeReminders.map(reminder => (
              <Card key={reminder.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <h4 className="font-semibold text-sm md:text-base break-words">{reminder.toolName}</h4>
                        <Badge className={`${priorityColor[reminder.priority]} text-xs`} variant="secondary">
                          {reminder.priority === 'high' ? '🔴 גבוהה' : reminder.priority === 'medium' ? '🟡 בינונית' : '🔵 נמוכה'}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">{reminder.message}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {reminder.reminderDate} {reminder.reminderTime}
                        </span>
                        {reminder.reminderType === 'subscription_expiry' && (
                          <Badge variant="outline" className="text-xs">תפוגת מנוי</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => completeMutation.mutate({ id: reminder.id, reminder })}
                        className="flex-1 sm:flex-none text-xs h-8"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingReminder(reminder); setFormData(reminder); setShowForm(true); }}
                        className="flex-1 sm:flex-none text-xs h-8"
                      >
                        ערוך
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(reminder.id)}
                        className="flex-1 sm:flex-none text-xs h-8 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Active Reminders */}
      {activeReminders.length === 0 && (
        <div className="text-center py-8 md:py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <AlertCircle className="w-8 md:w-12 h-8 md:h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">אין תזכורות פעילות</p>
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <details className="group border rounded-lg dark:border-gray-700">
          <summary className="p-3 md:p-4 cursor-pointer font-semibold text-sm md:text-base flex items-center gap-2">
            <span>✓ תזכורות הושלמו ({completedReminders.length})</span>
          </summary>
          <div className="p-3 md:p-4 border-t dark:border-gray-700 space-y-2">
            {completedReminders.map(reminder => (
              <div key={reminder.id} className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>{reminder.toolName} - {reminder.message}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(reminder.id)}
                  className="text-xs h-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}