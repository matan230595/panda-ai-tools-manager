import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { syncToolTasks } from '@/lib/googleTasksSync';
import { Wand2, CheckCircle2, ListChecks, TrendingUp, FileText, ShieldCheck, Zap, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'new_tool_eval',
    name: 'הערכת כלי AI חדש',
    description: 'תהליך מקיף לבדיקת כלי AI חדש מול החלופות',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    tasks: [
      { title: 'ניסוי ראשוני והרשמה', description: 'פתיחת חשבון וסיור ראשוני בכלי', priority: 'high', frequency: 'one_time' },
      { title: 'השוואה לחלופות', description: 'השוואת תכונות, מחיר ויכולות מול 2-3 כלים מתחרים', priority: 'high', frequency: 'one_time' },
      { title: 'בדיקת עלות-תועלת', description: 'חישוב ROI צפוי והערכת חיסכון בזמן/כסף', priority: 'medium', frequency: 'one_time' },
      { title: 'בדיקת אינטגרציות', description: 'בדיקת תאימות למערכות הקיימות ויכולות API', priority: 'medium', frequency: 'one_time' },
      { title: 'החלטת המשך ותיעוד', description: 'סיכום ממצאים והחלטה: לאמץ / לשמור לסקירה / לבטל', priority: 'high', frequency: 'one_time' },
    ],
  },
  {
    id: 'full_adoption',
    name: 'תהליך הטמעה מלא',
    description: 'שלבים להטמעת כלי חדש בצוות/ארגון',
    icon: ListChecks,
    color: 'from-emerald-500 to-green-600',
    tasks: [
      { title: 'הכשרת משתמשים', description: 'יצירת חומר הדרכה והעברת סדנאות לצוות', priority: 'high', frequency: 'one_time' },
      { title: 'הגדרת תהליכי עבודה', description: 'כתיבת SOP והגדרת תהליכים תקניים לשימוש', priority: 'high', frequency: 'one_time' },
      { title: 'אינטגרציה טכנית', description: 'חיבור למערכות קיימות, הגדרת API ואוטומציות', priority: 'medium', frequency: 'one_time' },
      { title: 'מדידת שימוש חודשית', description: 'מעקב אחר השימוש בפועל ואימוץ על ידי הצוות', priority: 'medium', frequency: 'monthly' },
      { title: 'אופטימיזציה ושיפור', description: 'ניתוח נקודות לשיפור וייעול השימוש', priority: 'low', frequency: 'monthly' },
    ],
  },
  {
    id: 'roi_assessment',
    name: 'הערכת ROI מהירה',
    description: 'חישוב החזר השקעה ובדיקת כדאיות',
    icon: FileText,
    color: 'from-purple-500 to-fuchsia-500',
    tasks: [
      { title: 'תיעוד עלויות', description: 'רישום כל עלויות המנוי, הכשרה ותחזוקה', priority: 'high', frequency: 'one_time' },
      { title: 'מדידת חיסכון זמן', description: 'כימות שעות עבודה שנחסכות הודות לכלי', priority: 'high', frequency: 'one_time' },
      { title: 'חישוב החזר השקעה', description: 'השוואת עלות מול תועלת וחישוב נקודת איזון', priority: 'medium', frequency: 'one_time' },
      { title: 'המלצה סופית', description: 'סיכום: האם הכלי משתלם? המשך / ביטול / שדרוג', priority: 'high', frequency: 'one_time' },
    ],
  },
  {
    id: 'security_audit',
    name: 'ביקורת אבטחה',
    description: 'בדיקת אבטחה ופרטיות לכלי AI',
    icon: ShieldCheck,
    color: 'from-red-500 to-rose-600',
    tasks: [
      { title: 'סקירת מדיניות פרטיות', description: 'בדיקת מדיניות הפרטיות וטיפול בנתונים של הכלי', priority: 'high', frequency: 'one_time' },
      { title: 'בדיקת אבטחת API', description: 'ודא שהכלי משתמש בהצפנה ואימות נאותים', priority: 'high', frequency: 'one_time' },
      { title: 'סקירת הרשאות גישה', description: 'בדיקת מי יכול לגשת לנתונים ואיך מנוהלות הרשאות', priority: 'medium', frequency: 'one_time' },
      { title: 'תיעוד סיכונים', description: 'תיעוד סיכונים פוטנציאליים ודרכי התמודדות', priority: 'medium', frequency: 'monthly' },
    ],
  },
  {
    id: 'quick_trial',
    name: 'ניסוי מהיר',
    description: 'בדיקה מהירה של כלי חדש תוך שבוע',
    icon: Zap,
    color: 'from-yellow-500 to-amber-500',
    tasks: [
      { title: 'הרשמה והגדרה ראשונית', description: 'פתיחת חשבון והגדרה בסיסית', priority: 'high', frequency: 'one_time' },
      { title: 'ניסוי תכונה מרכזית', description: 'בדיקת התכונה העיקרית של הכלי', priority: 'high', frequency: 'one_time' },
      { title: 'הערכת מחיר', description: 'בדיקת תוכניות המחיר והתאמה לתקציב', priority: 'medium', frequency: 'one_time' },
      { title: 'החלטה: המשך או ביטול', description: 'סיכום ראשוני והחלטה', priority: 'high', frequency: 'one_time' },
    ],
  },
  {
    id: 'team_rollout',
    name: 'הטמעה בצוות',
    description: 'גלגול כלי חדש לכל הצוות',
    icon: Users,
    color: 'from-cyan-500 to-blue-500',
    tasks: [
      { title: 'הכשרת מובילים', description: 'הכשרת 2-3 מובילים מוקדמים בצוות', priority: 'high', frequency: 'one_time' },
      { title: 'יצירת חומר הדרכה', description: 'הכנת מדריך קצר וסרטון הדגמה', priority: 'medium', frequency: 'one_time' },
      { title: 'סדנת השקה', description: 'העברת סדנה לכל הצוות', priority: 'high', frequency: 'one_time' },
      { title: 'מעקב אימוץ חודשי', description: 'בדיקת אחוז שימוש ופתרון בעיות', priority: 'medium', frequency: 'monthly' },
    ],
  },
];

export default function TaskTemplatesDialog({ open, onOpenChange, tools = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedToolId, setSelectedToolId] = useState('');
  const queryClient = useQueryClient();

  const applyTemplate = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate || !selectedToolId) throw new Error('נא לבחור תבנית וכלי');
      const tool = tools.find((t) => t.id === selectedToolId);
      if (!tool) throw new Error('כלי לא נמצא');

      const today = new Date();
      const tasks = selectedTemplate.tasks.map((task, index) => {
        const due = new Date(today);
        due.setDate(due.getDate() + (index + 1) * 7);
        return {
          toolId: tool.id,
          toolName: tool.name,
          title: task.title,
          description: task.description,
          dueDate: due.toISOString().split('T')[0],
          priority: task.priority,
          frequency: task.frequency,
          status: 'todo',
          isCompleted: false,
        };
      });

      const createdTasks = await base44.entities.ToolTask.bulkCreate(tasks);
      await syncToolTasks(createdTasks);
      return createdTasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolTasks'] });
      toast.success(`${selectedTemplate.tasks.length} משימות נוצרו בהצלחה!`);
      onOpenChange(false);
      setSelectedTemplate(null);
      setSelectedToolId('');
    },
    onError: (error) => toast.error(error.message || 'שגיאה ביצירת משימות'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-500" />
            תבניות משימות מוכנות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate?.id === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`w-full text-right rounded-xl border-2 p-3 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center rounded-lg w-10 h-10 bg-gradient-to-br ${tpl.color} text-white flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{tpl.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tpl.description}</p>
                    <div className="text-[11px] text-gray-400 mt-1">{tpl.tasks.length} שלבים</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-2 space-y-1 pr-1">
                    {tpl.tasks.map((task, i) => (
                      <div key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">{i + 1}</span>
                        {task.title}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedTemplate && (
          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">בחר כלי להחלת התבנית:</label>
            <Select value={selectedToolId} onValueChange={setSelectedToolId}>
              <SelectTrigger><SelectValue placeholder="בחר כלי..." /></SelectTrigger>
              <SelectContent>
                {tools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>{tool.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button
            onClick={() => applyTemplate.mutate()}
            disabled={!selectedTemplate || !selectedToolId || applyTemplate.isPending}
          >
            {applyTemplate.isPending ? 'יוצר משימות...' : `צור ${selectedTemplate?.tasks.length || ''} משימות`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}