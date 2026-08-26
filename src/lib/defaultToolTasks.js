import { base44 } from '@/api/base44Client';

const DEFAULT_TASKS = [
  ['ניסוי ראשוני והרשמה', 'פתיחת חשבון וסיור ראשוני בכלי', 'high'],
  ['השוואה לחלופות', 'השוואת תכונות, מחיר ויכולות מול כלים מתחרים', 'high'],
  ['בדיקת עלות-תועלת', 'הערכת החיסכון בזמן ובכסף שהכלי צפוי לספק', 'medium'],
  ['בדיקת אינטגרציות', 'בדיקת התאמה למערכות הקיימות ויכולות API', 'medium'],
  ['החלטת המשך ותיעוד', 'סיכום הממצאים והחלטה על המשך השימוש', 'high'],
];

export async function createDefaultToolTasks(tool) {
  const today = new Date();
  const tasks = DEFAULT_TASKS.map(([title, description, priority], index) => {
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + (index + 1) * 7);
    return {
      toolId: tool.id,
      toolName: tool.name,
      title,
      description,
      dueDate: dueDate.toISOString().split('T')[0],
      priority,
      frequency: 'one_time',
      status: 'todo',
      isCompleted: false,
    };
  });

  return base44.entities.ToolTask.bulkCreate(tasks);
}