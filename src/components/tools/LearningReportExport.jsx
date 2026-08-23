import React from 'react';
import { jsPDF } from 'jspdf';
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/**
 * רכיב לייצוא דוחות התקדמות למידה ל-PDF או דף Google
 */
export default function LearningReportExport({ tool, plans = [], tasks = [], masteryData }) {
  const [exporting, setExporting] = React.useState(null);

  const buildReportData = () => {
    const plan = plans[0];
    const steps = plan?.steps || [];
    const completedSteps = steps.filter(s => s.isCompleted).length;
    const totalSteps = steps.length;
    const progress = plan?.progress || 0;

    return {
      toolName: tool?.name || 'כלי לא ידוע',
      toolCategory: tool?.category?.replace(/_/g, ' ') || '',
      masteryLevel: tool?.masteryLevel || 'מתחיל',
      learningPriority: tool?.learningPriority || 'רגיל שלי',
      planTitle: plan?.title || 'אין תוכנית',
      planDescription: plan?.description || '',
      targetDate: plan?.targetDate || '',
      progress,
      completedSteps,
      totalSteps,
      steps: steps.map((s, i) => ({
        num: i + 1,
        title: s.title,
        completed: s.isCompleted,
        dueDate: s.dueDate || '',
      })),
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
      })),
      masteryScore: masteryData?.overallScore || 0,
      skillLevel: masteryData?.skillLevel?.label || 'מתחיל',
      generatedAt: new Date().toLocaleString('he-IL'),
    };
  };

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      const data = buildReportData();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      // כותרת
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('דוח התקדמות למידה', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`כלי: ${data.toolName}`, pageWidth / 2, 25, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`נוצר: ${data.generatedAt}`, pageWidth / 2, 31, { align: 'center' });

      y = 45;
      doc.setTextColor(30, 41, 59);

      // מידע כללי
      doc.setFontSize(14);
      doc.text('מידע כללי', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`שם הכלי: ${data.toolName}`, margin, y); y += 6;
      doc.text(`קטגוריה: ${data.toolCategory}`, margin, y); y += 6;
      doc.text(`רמת שליטה: ${data.masteryLevel}`, margin, y); y += 6;
      doc.text(`עדיפות למידה: ${data.learningPriority}`, margin, y); y += 6;
      doc.text(`ציון מיומנות כללי: ${data.masteryScore}% (${data.skillLevel})`, margin, y); y += 8;

      // תוכנית למידה
      doc.setFontSize(14);
      doc.text('תוכנית למידה', margin, y); y += 7;
      doc.setFontSize(10);
      doc.text(`כותרת: ${data.planTitle}`, margin, y); y += 6;
      if (data.planDescription) {
        const desc = doc.splitTextToSize(data.planDescription, contentWidth);
        doc.text(desc, margin, y); y += desc.length * 5 + 2;
      }
      doc.text(`התקדמות: ${data.progress}% (${data.completedSteps}/${data.totalSteps} שלבים)`, margin, y); y += 6;
      if (data.targetDate) {
        doc.text(`תאריך יעד: ${new Date(data.targetDate).toLocaleDateString('he-IL')}`, margin, y); y += 6;
      }
      y += 4;

      // שלבים
      if (data.steps.length > 0) {
        doc.setFontSize(14);
        doc.text('שלבי למידה', margin, y); y += 7;
        doc.setFontSize(10);
        data.steps.forEach((step) => {
          if (y > 275) { doc.addPage(); y = 20; }
          const status = step.completed ? '[V]' : '[ ]';
          const line = `${status} ${step.num}. ${step.title}`;
          doc.text(line, margin, y); y += 6;
          if (step.dueDate) {
            doc.text(`   יעד: ${new Date(step.dueDate).toLocaleDateString('he-IL')}`, margin, y); y += 5;
          }
        });
        y += 4;
      }

      // משימות
      if (data.tasks.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.text('משימות קשורות', margin, y); y += 7;
        doc.setFontSize(10);
        data.tasks.forEach((task) => {
          if (y > 275) { doc.addPage(); y = 20; }
          const status = task.status === 'done' ? '[V]' : task.status === 'in_progress' ? '[~]' : '[ ]';
          doc.text(`${status} ${task.title}`, margin, y); y += 6;
        });
      }

      // כותרת תחתונה
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`עמוד ${i} מתוך ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      }

      doc.save(`דוח_למידה_${data.toolName}_${Date.now()}.pdf`);
      toast.success('הדוח יוצא ל-PDF בהצלחה');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('שגיאה בייצוא PDF');
    } finally {
      setExporting(null);
    }
  };

  const exportToGoogleSheet = async () => {
    setExporting('sheet');
    try {
      const data = buildReportData();
      const rows = [
        ['שדה', 'ערך'],
        ['שם הכלי', data.toolName],
        ['קטגוריה', data.toolCategory],
        ['רמת שליטה', data.masteryLevel],
        ['עדיפות למידה', data.learningPriority],
        ['ציון מיומנות', `${data.masteryScore}%`],
        ['רמת מיומנות', data.skillLevel],
        ['תוכנית', data.planTitle],
        ['התקדמות', `${data.progress}%`],
        ['שלבים שהושלמו', `${data.completedSteps}/${data.totalSteps}`],
        ['תאריך יעד', data.targetDate || ''],
        ['תאריך יצירה', data.generatedAt],
        [],
        ['שלב', 'כותרת', 'הושלם', 'תאריך יעד'],
        ...data.steps.map(s => [s.num, s.title, s.completed ? 'כן' : 'לא', s.dueDate || '']),
        [],
        ['משימה', 'סטטוס', 'עדיפות', 'תאריך יעד'],
        ...data.tasks.map(t => [t.title, t.status, t.priority, t.dueDate || '']),
      ];

      const response = await base44.functions.invoke('exportToGoogleSheet', {
        title: `דוח למידה - ${data.toolName}`,
        data: rows,
      });

      if (response?.url) {
        toast.success('הדוח יוצא לדף Google');
        window.open(response.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.success('הדוח יוצא לדף Google');
      }
    } catch (err) {
      console.error('Google Sheet export error:', err);
      toast.error('שגיאה בייצוא לדף Google');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={!!exporting}
        className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
      >
        {exporting === 'pdf' ? (
          <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 ml-1.5" />
        )}
        ייצא ל-PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToGoogleSheet}
        disabled={!!exporting}
        className="border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/10"
      >
        {exporting === 'sheet' ? (
          <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4 ml-1.5" />
        )}
        ייצא ל-Google Sheets
      </Button>
    </div>
  );
}